# 06 — HTTP: HttpClient + interceptores

## BaseHttpService — servicio base CRUD

Vive en `src/app/core/services/base-http.service.ts`. Toda llamada se cancela cuando `RequestCancellerService.cancelAll()` emite (por ejemplo, en `logout()`).

```typescript
// core/services/base-http.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, takeUntil } from 'rxjs';
import { RequestCancellerService } from './request-canceller.service';

@Injectable({ providedIn: 'root' })
export class BaseHttpService {
  protected http = inject(HttpClient);
  private canceller = inject(RequestCancellerService);

  protected get<T>(url: string, params?: HttpParams | Record<string, any>): Observable<T> {
    return this.http.get<T>(url, { params }).pipe(takeUntil(this.canceller.cancelAll$));
  }

  protected post<T>(
    url: string,
    body: unknown,
    options?: { headers?: HttpHeaders; context?: HttpContext },
  ): Observable<T> {
    return this.http.post<T>(url, body, options).pipe(takeUntil(this.canceller.cancelAll$));
  }

  protected put<T>(
    url: string,
    body: unknown,
    options?: { headers?: HttpHeaders; context?: HttpContext },
  ): Observable<T> {
    return this.http.put<T>(url, body, options).pipe(takeUntil(this.canceller.cancelAll$));
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url).pipe(takeUntil(this.canceller.cancelAll$));
  }
}
```

### RequestCancellerService

```typescript
// core/services/request-canceller.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestCancellerService {
  readonly cancelAll$ = new Subject<void>();

  cancelAll(): void {
    this.cancelAll$.next();
  }
}
```

`AuthService.logout()` llama a `requestCanceller.cancelAll()` para abortar peticiones en vuelo antes de redirigir.

---

## Crear un servicio de feature

Las URLs base vienen de `@env/environment`. Las features del dominio actual usan `environment.url_fondeadores`. `AuthService` también consume `environment.url_core` y `environment.url_motor`.

```typescript
// pages/fondeadores/<feature>/data-access/feature.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { BaseHttpService } from '@core/services/base-http.service';
import { Lote, ComprarLotePayload } from './feature.model';

@Injectable({ providedIn: 'root' })
export class FeatureService extends BaseHttpService {
  private base = `${environment.url_fondeadores}owner_base`;

  list(filters: Record<string, any>): Observable<Lote[]> {
    return this.get<Lote[]>(`${this.base}/lotes`, filters);
  }

  detalle(id: number): Observable<Lote> {
    return this.get<Lote>(`${this.base}/lotes/${id}`);
  }

  comprar(payload: ComprarLotePayload): Observable<Lote> {
    return this.post<Lote>(`${this.base}/lotes/comprar`, payload);
  }
}
```

---

## Tokens de contexto HTTP

Viven en `core/interceptors/http-context-tokens.ts` y los interceptores los leen vía `req.context.get(...)`.

```typescript
// core/interceptors/http-context-tokens.ts
import { HttpContextToken } from '@angular/common/http';

export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
export const SHOW_ERROR_MODAL = new HttpContextToken<boolean>(() => true);
```

- `SKIP_AUTH = true` — el `authInterceptor` no adjunta los headers Cognito/Motor. Útil en el login.
- `SHOW_ERROR_MODAL = false` — el `errorInterceptor` no muestra el modal global de error en este request.

### Silenciar el modal y bypass de auth en un request

```typescript
import { HttpContext } from '@angular/common/http';
import { SHOW_ERROR_MODAL, SKIP_AUTH } from '@core/interceptors/http-context-tokens';

const context = new HttpContext()
  .set(SKIP_AUTH, true)
  .set(SHOW_ERROR_MODAL, false);

this.post('/auth/login', body, { context });
```

---

## Interceptores funcionales

Se registran en `app.config.ts`:

```typescript
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

### Auth interceptor — headers Cognito + Motor

Adjunta tres headers cuando hay tokens en `sessionStorage`. Si `SKIP_AUTH` está activo o no hay `idToken`, sigue de largo.

```typescript
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { SKIP_AUTH } from './http-context-tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) return next(req);

  const auth = inject(AuthService);
  const idToken = auth.getIdToken();
  const refreshToken = auth.getRefreshToken();
  const motorToken = auth.getMotorToken();

  if (!idToken) return next(req);

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${idToken}`,
        'Id-Token-Cognito': idToken,
        ...(refreshToken ? { 'Refresh-Token-Cognito': refreshToken } : {}),
        ...(motorToken ? { 'Token-Motor': motorToken } : {}),
      },
    }),
  );
};
```

### Error interceptor — manejo global de errores HTTP

Hace tres cosas, en orden:

1. Si el backend devuelve `404` con `responseCode: '404'`, lo trata como "lista vacía" y emite una respuesta `200 { data: null }` (evita modal de error en listados sin resultados).
2. Si es `401` y `SKIP_AUTH` no está activo, llama `authService.logout()` y absorbe el error con `EMPTY`.
3. Si `SHOW_ERROR_MODAL` está activo, muestra el modal global con `MessagesService.error(...)`.

```typescript
// core/interceptors/error.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, catchError, of, throwError } from 'rxjs';
import { MessagesService } from '@core/services/modals/messages.service';
import { AuthService } from '@core/services/auth.service';
import { SHOW_ERROR_MODAL, SKIP_AUTH } from './http-context-tokens';

const HTTP_ERRORS: Record<number, string> = {
  400: 'Solicitud incorrecta.',
  401: 'Sesión expirada.',
  403: 'Sin permisos para realizar esta acción.',
  404: 'Recurso no encontrado.',
  500: 'Error interno del servidor.',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messages = inject(MessagesService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isEmptyResults404(err)) {
        return of(
          new HttpResponse({
            url: req.url,
            status: 200,
            statusText: 'OK',
            body: { statusCode: 200, data: null },
          }),
        );
      }

      if (err.status === 401 && !req.context.get(SKIP_AUTH)) {
        authService.logout();
        return EMPTY;
      }

      if (req.context.get(SHOW_ERROR_MODAL)) {
        const msg = err.error?.message ?? HTTP_ERRORS[err.status] ?? 'Error inesperado.';
        messages.error(msg);
      }

      return throwError(() => err);
    }),
  );
};

function isEmptyResults404(err: HttpErrorResponse): boolean {
  return err.status === 404 && err.error?.responseCode === '404';
}
```

---

## Patrones RxJS más usados

```typescript
import { forkJoin, map, tap, catchError, throwError, finalize } from 'rxjs';

// Múltiples llamadas paralelas
forkJoin({
  lotes: this.lotesService.list(filters),
  catalogos: this.catalogoService.cargar(),
}).subscribe({
  next: ({ lotes, catalogos }) => { /* ambos disponibles */ },
});

// Transformar respuesta en el servicio
list(filters: Record<string, any>): Observable<Lote[]> {
  return this.get<ApiResponse<Lote[]>>(`${this.base}/lotes`, filters).pipe(
    map((res) => res.data ?? []),
  );
}

// Apagar loading siempre
this.service.list(filters).pipe(
  finalize(() => this.loading.set(false)),
).subscribe((page) => this.listOfData.set(page));
```

---

## environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  environmentName: 'development',
  url_fondeadores: 'https://.../fondeadores/',
  url_core:        'https://.../core/',
  url_motor:       'https://.../motor/',
};
```

`fileReplacements` en `angular.json` intercambia el archivo según el build target.

---

## AuthService — patrón real del proyecto

`AuthService` extiende `BaseHttpService`. Login hace `forkJoin` contra core+motor, persiste tokens en `sessionStorage`, carga el owner y deja la sesión lista. `logout()` cancela requests, cierra modales, limpia storage y redirige.

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService extends BaseHttpService {
  private readonly ownerSession = inject(OwnerSessionService);
  private readonly router = inject(Router);
  private readonly requestCanceller = inject(RequestCancellerService);
  private readonly modalService = inject(ModalService);

  private readonly loginContext = new HttpContext()
    .set(SKIP_AUTH, true)
    .set(SHOW_ERROR_MODAL, false);

  login(payload: LoginPayload): Observable<void> {
    return forkJoin({
      core: this.signIn(payload),
      motor: this.loginMotor(payload),
    }).pipe(
      tap(({ core, motor }) => { /* persistir tokens */ }),
      switchMap(() => this.ownerSession.loadOwner()),
      map(() => void 0),
    );
  }

  logout(): void {
    this.requestCanceller.cancelAll();
    this.modalService.closeAllModals();
    sessionStorage.clear();
    localStorage.clear();
    this.ownerSession.clear();
    this.router.navigate(['/login']);
  }
}
```

Ver implementación completa en `src/app/core/services/auth.service.ts`.

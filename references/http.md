# 06 — HTTP: HttpClient + interceptores

## BaseHttpService — servicio base CRUD

Extender para cada servicio de feature. Evita repetir `this.http.get/post/put/delete` en cada servicio.

```typescript
// core/services/base-http.service.ts
import { inject, Injectable }                           from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable }                          from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BaseHttpService {
  protected http = inject(HttpClient);

  protected get<T>(url: string, params?: HttpParams | Record<string, any>): Observable<T> {
    return this.http.get<T>(url, { params });
  }

  protected post<T>(url: string, body: any, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.post<T>(url, body, options);
  }

  protected put<T>(url: string, body: any, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.put<T>(url, body, options);
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }
}
```

---

## Crear un servicio de feature

```typescript
// pages/users/data-access/user.service.ts
import { Injectable }     from '@angular/core';
import { Observable }     from 'rxjs';
import { environment }    from '@env';
import { BaseHttpService } from '@core/services/base-http.service';
import { User, CreateUserPayload } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseHttpService {
  private base = `${environment.apiUrl}users`;

  getAll(): Observable<User[]>                          { return this.get<User[]>(this.base); }
  getById(id: number): Observable<User>                 { return this.get<User>(`${this.base}/${id}`); }
  create(body: CreateUserPayload): Observable<User>     { return this.post<User>(this.base, body); }
  update(id: number, body: Partial<User>): Observable<User> { return this.put<User>(`${this.base}/${id}`, body); }
  remove(id: number): Observable<void>                  { return this.delete<void>(`${this.base}/${id}`); }

  search(filters: Record<string, any>): Observable<User[]> {
    return this.get<User[]>(this.base, filters);
  }
}
```

---

## Interceptores funcionales

Se registran en `app.config.ts`:
```typescript
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

### Auth interceptor — Bearer token automático

```typescript
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';
import { AuthService }       from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

### Error interceptor — manejo global de errores HTTP

```typescript
// core/interceptors/error.interceptor.ts
import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';
import { Router }            from '@angular/router';
import { MessagesService }   from '@core/services/modals/messages.service';
import { catchError, throwError } from 'rxjs';

// Token para silenciar el modal en un request específico
export const SHOW_ERROR_MODAL = new HttpContextToken<boolean>(() => true);

const HTTP_ERRORS: Record<number, string> = {
  400: 'Solicitud incorrecta.',
  401: 'Sesión expirada.',
  403: 'Sin permisos.',
  404: 'Recurso no encontrado.',
  500: 'Error interno del servidor.',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messages = inject(MessagesService);
  const router   = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) router.navigate(['/login']);

      if (req.context.get(SHOW_ERROR_MODAL)) {
        const msg = err.error?.message ?? HTTP_ERRORS[err.status] ?? 'Error inesperado.';
        messages.error(msg);
      }

      return throwError(() => err);
    })
  );
};
```

### Silenciar el modal de error para un request específico

```typescript
import { HttpContext } from '@angular/common/http';
import { SHOW_ERROR_MODAL } from '@core/interceptors/error.interceptor';

this.service.check(id, {
  context: new HttpContext().set(SHOW_ERROR_MODAL, false)
}).subscribe({ error: err => { /* manejar manualmente */ } });
```

---

## Patrones RxJS más usados

```typescript
import { forkJoin, map, tap, catchError, throwError, finalize } from 'rxjs';

// Múltiples llamadas paralelas
forkJoin({
  users:      this.userService.getAll(),
  categories: this.catService.getAll(),
}).subscribe({
  next: ({ users, categories }) => { /* ambos disponibles */ },
  error: err => console.error(err),
});

// Transformar respuesta en el servicio
getActive(): Observable<User[]> {
  return this.get<User[]>(`${this.base}`).pipe(
    map(users => users.filter(u => u.active))
  );
}

// Siempre ejecutar al terminar (loading off)
this.service.getAll().pipe(
  finalize(() => this.loading.set(false))
).subscribe({ next: data => this.items.set(data) });
```

---

## environment.ts

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://api.example.com/',
  environmentName: 'development',
};
```

En `app.config.ts` se configura `fileReplacements` en `angular.json` para intercambiar el archivo según el build target.

---

## AuthService — patrón básico

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService extends BaseHttpService {
  private readonly TOKEN_KEY = 'access_token';
  private userSubject = new BehaviorSubject<User | null>(this.loadFromStorage());
  currentUser$ = this.userSubject.asObservable();

  login(body: LoginPayload): Observable<LoginResponse> {
    return this.post<LoginResponse>(`${environment.apiUrl}auth/login`, body).pipe(
      tap(res => {
        sessionStorage.setItem(this.TOKEN_KEY, res.access_token);
        this.userSubject.next(res.user);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.userSubject.next(null);
    inject(Router).navigate(['/login']);
  }

  getToken()          { return sessionStorage.getItem(this.TOKEN_KEY); }
  isAuthenticated()   { return !!this.getToken(); }

  private loadFromStorage(): User | null {
    const raw = sessionStorage.getItem('user_data');
    return raw ? JSON.parse(raw) : null;
  }
}
```

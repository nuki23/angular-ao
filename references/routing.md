# 04 - Routing

## Configuracion global

El proyecto usa hash routing:

```typescript
provideRouter(routes, withHashLocation())
```

La URL protegida queda como `/#/fondeadores/...`.

## app.routes.ts

La zona autenticada del repo vive bajo `/fondeadores`. No cambiarla a `/admin` salvo que el usuario pida una plantilla generica.

```typescript
import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@pages/layout/main-layout/main-layout.component';
import { authGuard } from '@shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('@pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () =>
      import('@pages/auth/recuperar-contrasena/recuperar-contrasena.component').then(
        (m) => m.RecuperarContrasenaComponent,
      ),
  },
  {
    path: 'fondeadores',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        data: { title: 'Dashboard' },
        loadChildren: () =>
          import('@pages/fondeadores/dashboard/dashboard-fondeadores.routes').then(
            (m) => m.DASHBOARD_FONDEADORES_ROUTES,
          ),
      },
      {
        path: 'comprar-creditos',
        data: { title: 'Comprar creditos', backUrl: '/fondeadores/dashboard' },
        loadChildren: () =>
          import('@pages/fondeadores/comprar-creditos/comprar-creditos.routes').then(
            (m) => m.COMPRAR_CREDITOS_ROUTES,
          ),
      },
    ],
  },
];
```

## Feature routes

Usar named exports:

```typescript
// pages/fondeadores/comprar-creditos/comprar-creditos.routes.ts
import { Routes } from '@angular/router';

export const COMPRAR_CREDITOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./comprar-creditos').then((m) => m.ComprarCreditosComponent),
  },
  {
    path: ':id/detalle',
    data: { title: 'Detalle de lote', backUrl: '/fondeadores/comprar-creditos' },
    loadComponent: () =>
      import('./tabla-lote/tabla-lote').then((m) => m.TablaLoteComponent),
  },
];
```

Usar `loadComponent` para hojas y `loadChildren` cuando la feature tiene sub-rutas.

## Guards

Los guards funcionales viven en `shared/guards/`:

```typescript
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  if (inject(AuthService).isAuthenticated()) return true;
  inject(Router).navigate(['/login']);
  return false;
};
```

## Navegacion

```typescript
private router = inject(Router);

goDashboard(): void {
  this.router.navigate(['/fondeadores/dashboard']);
}

goDetalle(id: number): void {
  this.router.navigate(['/fondeadores/comprar-creditos', id, 'detalle']);
}
```

En templates, preferir rutas absolutas cuando cruzan features:

```html
<a [routerLink]="['/fondeadores/dashboard']">Dashboard</a>
```

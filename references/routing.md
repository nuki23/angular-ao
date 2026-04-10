# 04 — Routing

## Configuración en app.config.ts

```typescript
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

providers: [
  provideRouter(routes, withHashLocation()),  // /#/admin/... en la URL
]
```

Sin `withHashLocation()` las URLs son normales (`/admin/...`).

---

## app.routes.ts — estructura con layout

```typescript
import { Routes, CanActivateFn } from '@angular/router';
import { inject }                from '@angular/core';
import { Router }                from '@angular/router';
import { MainLayoutComponent }   from './layout/main-layout/main-layout.component';
import { authGuard }             from './core/guards/auth.guard';
import { AuthService }           from './core/services/auth.service';

const rootGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return router.createUrlTree(
    [auth.isAuthenticated() ? '/admin/dashboard' : '/login']
  );
};

export const routes: Routes = [
  // Zona protegida — comparte layout (header + sidebar + outlet)
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        data: { title: 'Dashboard' },
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./pages/users/users.routes').then(m => m.USERS_ROUTES),
        data: { title: 'Usuarios' },
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  // Login sin layout
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/auth/login/login.routes').then(m => m.LOGIN_ROUTES),
  },
  // Raíz y wildcard — redirigen según autenticación
  { path: '',  pathMatch: 'full', canActivate: [rootGuard], component: MainLayoutComponent },
  { path: '**',                   canActivate: [rootGuard], component: MainLayoutComponent },
];
```

---

## Feature routes — named export

```typescript
// pages/users/users.routes.ts
import { Routes } from '@angular/router';
import { UsersComponent } from './users.component';

export const USERS_ROUTES: Routes = [
  { path: '', component: UsersComponent }
];
```

```typescript
// En app.routes.ts
loadChildren: () => import('./pages/users/users.routes').then(m => m.USERS_ROUTES)
```

---

## Guards funcionales

### authGuard — proteger rutas

```typescript
// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};
```

### roleGuard — proteger por rol

```typescript
export const roleGuard: CanActivateFn = (route) => {
  const auth  = inject(AuthService);
  const roles = route.data['roles'] as string[];
  return roles.includes(auth.getRole());
};

// En routes:
{ path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } }
```

---

## Navegación programática

```typescript
export class MyComponent {
  private router = inject(Router);

  goTo(id: number) { this.router.navigate(['/admin/users', id]); }
  goBack()         { this.router.navigate(['/admin/dashboard']); }
  goWithParams()   { this.router.navigate(['/admin/users'], { queryParams: { page: 2 } }); }
}
```

## RouterLink en template

```html
<a [routerLink]="['/admin/dashboard']">Dashboard</a>
<a [routerLink]="['/admin/users', user.id]">Ver usuario</a>

<li nz-menu-item [routerLink]="['/admin/profile']">Perfil</li>
```

## Leer parámetros de ruta

```typescript
private route = inject(ActivatedRoute);

ngOnInit() {
  const id = this.route.snapshot.paramMap.get('id');   // síncróno
  this.route.params.subscribe(p => { /* reactivo */ }); // reactivo
}
```

## Leer data de ruta (ej: título)

```typescript
private route  = inject(ActivatedRoute);
private router = inject(Router);

constructor() {
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      this.title = this.route.snapshot.firstChild?.data['title'] ?? '';
    }
  });
}
```

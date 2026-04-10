# 01 — Setup: Angular 21 standalone / zoneless

## Crear proyecto

```bash
ng new my-app --standalone --routing --style=css
```

Instalar dependencias del stack:

```bash
npm install ng-zorro-antd
npm install lucide-angular
npm install tailwindcss @tailwindcss/vite   # Tailwind v4
```

---

## app.config.ts — bootstrap sin NgModules

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withHashLocation }         from '@angular/router';
import { provideHttpClient, withInterceptors }     from '@angular/common/http';
import { en_US, provideNzI18n }                   from 'ng-zorro-antd/i18n';
import { provideNzIcons }                          from 'ng-zorro-antd/icon';
import { NzModalModule }                           from 'ng-zorro-antd/modal';
import { registerLocaleData }                      from '@angular/common';
import en from '@angular/common/locales/en';

import { routes }          from './app.routes';
import { icons }           from './icons-provider';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),   // URLs con # → /#/admin/ruta
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideNzIcons(icons),           // iconos Ant Design globales
    provideNzI18n(en_US),            // idioma de componentes (datepicker, paginación, etc.)
    importProvidersFrom(NzModalModule),  // necesario para que NzModalService funcione
  ],
};
```

---

## icons-provider.ts — registro de iconos Ant Design

Agregar aquí cada icono de Ant Design que ng-zorro necesite internamente:

```typescript
// src/app/icons-provider.ts
import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FormOutline,
  // agregar más según necesidad
} from '@ant-design/icons-angular/icons';

export const icons = [MenuFoldOutline, MenuUnfoldOutline, DashboardOutline, FormOutline];
```

---

## lucide-angular — iconos en componentes

Los iconos Lucide se importan directamente en cada componente (no se registran globalmente).

**En el componente:**
```typescript
import { LucideAngularModule, ArrowLeft, Eye, Ellipsis } from 'lucide-angular';

@Component({
  imports: [LucideAngularModule, /* ... */],
})
export class MyComponent {
  readonly ArrowLeft = ArrowLeft;
  readonly Eye       = Eye;
  readonly Ellipsis  = Ellipsis;
}
```

**En el template:**
```html
<lucide-icon [img]="ArrowLeft" [size]="18" />
<lucide-icon [img]="Eye" [size]="18" class="icon-action" />
```

> Usar siempre `[img]` (no `[name]`). Exponer cada icono como propiedad `readonly` de la clase para que sea accesible desde el template.

---

## Zoneless (sin zone.js)

Eliminar zone.js del proyecto:

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.ts';

bootstrapApplication(AppComponent, appConfig).catch(console.error);
```

En `angular.json` quitar `zone.js` de `polyfills` si se usa modo experimental zoneless:
```json
"polyfills": []
```

Y en `app.config.ts` agregar el provider experimental:
```typescript
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
providers: [
  provideExperimentalZonelessChangeDetection(),
  // ...resto
]
```

---

## Estructura de carpetas recomendada

```
src/app/
├── core/                       # Código transversal (guards, interceptors, servicios globales)
│   ├── guards/
│   ├── interceptors/
│   ├── models/
│   └── services/
│       └── modals/             # modal.service.ts, messages.service.ts
├── layout/                     # Componentes de layout (header, sidebar, main-layout)
├── pages/                      # Features de la app
│   └── feature-name/
│       ├── feature-name.ts
│       ├── feature-name.routes.ts
│       ├── feature-name.html
│       ├── feature-name.css
│       └── data-access/
│           ├── feature.model.ts
│           └── feature.service.ts
└── shared/
    ├── components/             # Componentes reutilizables
    └── modals/
        └── info-dialog/        # Sistema de modales (ver modal-system/)
```

---

## Aliases de TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*":   ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@env":      ["src/environments/environment.ts"]
    }
  }
}
```

---

## theme.less — integración Tailwind + ng-zorro

```less
// src/theme.less
@import "../node_modules/ng-zorro-antd/ng-zorro-antd.less";

// Sobreescribir el color primario de ng-zorro
@blue-base: #14b8a6;   // teal — cambiar según brand del proyecto
@border-radius-base: 0.75rem;
@input-height-base: 28px;
@font-size-base: 0.875rem;
```

En `angular.json`, aplicar el tema:
```json
"styles": [
  { "input": "src/theme.less", "bundleName": "theme", "inject": true },
  "src/styles.css"
]
```

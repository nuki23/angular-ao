# 01 - Setup del proyecto

Este repo es Angular 21 standalone con signals, ng-zorro, Tailwind v4, Font Awesome Pro y Vitest. Usa zone.js mediante `provideAnimations()`.

## app.config.ts

Patron real del proyecto:

```typescript
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideNzI18n(en_US),
    importProvidersFrom(NzModalModule),
    provideAnimations(),
  ],
};
```

No agregar configuracion zoneless en este proyecto salvo solicitud explicita.

## Estructura de carpetas

```text
src/app/
|-- core/
|   |-- constants/
|   |-- interceptors/
|   |-- models/
|   |-- services/
|   |   `-- modals/
|   `-- utils/
|-- pages/
|   |-- auth/
|   |-- layout/
|   |-- component-lista/
|   |-- example/
|   `-- fondeadores/
|       |-- dashboard/
|       |-- comprar-creditos/
|       |-- creditos-comprados/
|       `-- recompras/
`-- shared/
    |-- animations/
    |-- components/
    |-- directives/
    |-- guards/
    |-- modals/
    `-- transitions/
```

Para nuevas features del dominio actual, ubicar bajo `src/app/pages/fondeadores/<feature>/`.

## Aliases TypeScript

`tsconfig.json` define:

```json
{
  "paths": {
    "@core/*": ["src/app/core/*"],
    "@shared/*": ["src/app/shared/*"],
    "@pages/*": ["src/app/pages/*"],
    "@env/*": ["src/environments/*"]
  }
}
```

Usar estos aliases en imports de app. Para imports relativos dentro de una misma feature, mantener rutas relativas cortas.

## Styles globales

`angular.json` carga:

```json
"styles": ["src/theme.less", "src/styles.css"]
```

- `src/theme.less`: personalizacion de ng-zorro, botones, floating labels, tablas `nz-table`, modales y shimmer de `[nzLoading]`.
- `src/styles.css`: Tailwind v4, tokens `@theme` y clases globales del stack (`.content-pages`, `.icon-action`, `.modal-header`, `.modal-footer`, `[scrolltable]`).

No recrear estas reglas en componentes si ya existen globalmente.

## Comandos

```bash
npm start
npm run build
npm test
npx prettier --write .
```

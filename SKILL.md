---
name: angular-ao
description: >
  Estandares y patrones para este proyecto Angular 21 standalone con zone.js,
  signals, ng-zorro, Tailwind v4 y Font Awesome Pro. Usar cuando se trabaje en
  componentes, rutas, formularios, HTTP, modales, estilos o UI de
  redcore-fondeador-xloan.
user-invocable: false
---

# Angular AO

Aplica estas reglas en cada tarea Angular del proyecto. Adaptar lo existente antes de crear algo nuevo.

## Principios del repo

- Mantener el dominio de rutas y carpetas `fondeadores` salvo que el usuario pida explicitamente una plantilla generica.
- No convertir rutas a `/admin` por defecto. La zona protegida actual vive bajo `/fondeadores`.
- Usar los componentes, clases globales y servicios compartidos existentes antes de crear variantes nuevas.
- `app.config.ts` usa `provideAnimations()` y zone.js. No proponer zoneless para este proyecto.
- Orden de prioridad al mapear UI nueva (Figma → código): catálogo propio (`pages/component-lista/` y `shared/components`) → ng-zorro → custom. Crear un componente nuevo solo cuando ninguno de los anteriores cumple. Ver `CLAUDE.md` para el flujo de mapeo Figma completo.

## Componentes

- Siempre standalone. Nunca crear NgModules.
- DI con `inject()` en el cuerpo de la clase. Usar constructor solo para `super()` o `effect()`.
- Control flow nativo: `@if`, `@for`, `@switch`. No importar `CommonModule` si solo se usan estas directivas.
- Antes de quitar `CommonModule`, verificar que el template no use `[ngClass]`, `[ngStyle]`, `*ngIf`, `*ngFor` ni pipes como `async`.
- Iconos FA Pro: importar `FaIconComponent` en `imports[]`, declarar iconos `readonly`, y usar `<fa-icon>`.

## Signals

- Estado local con `signal()` y `.set()` / `.update()`.
- Derivados con `computed()` sin side effects.
- Side effects reactivos con `effect()` solo en constructor.
- Entrada/salida moderna con `input()` y `output()` cuando aplique.
- Para llamadas HTTP, el patron usual es Observable -> subscribe -> signal, con `finalize()` para apagar `loading`.

## Routing

- `provideRouter(routes, withHashLocation())` esta activo.
- Zona autenticada: `path: 'fondeadores'`, `component: MainLayoutComponent`, `canActivate: [authGuard]`.
- Guards funcionales en `shared/guards/`.
- Lazy loading con named export: `export const FEATURE_ROUTES: Routes`.
- Usar `data: { title, backUrl }` para metadata de header/navegacion.
- Arreglar rutas rotas, redirects y backUrl; no renombrar el dominio de negocio sin aprobacion.

## Formularios y Loading UX

- Siempre Reactive Forms.
- `floatingLabel` vive en `shared/directives/floating-label.directive.ts` y se estiliza con `.floating-layout` en `theme.less`.
- Busquedas: `loading.set(true)` + `filterForm.disable()` + `[nzLoading]="loading()"` en el boton principal + `finalize()`.
- Formularios que cargan catalogos: usar `<custom-skeleton type="input">` cuando los campos aun no pueden mostrarse.
- Tablas cargando: usar `<custom-skeleton>` (default `type='table'`).
- **Regla dura — toda interaccion con el backend debe ser visible y dejar datos frescos**: cualquier accion del usuario que dispare una llamada HTTP (search, create, edit, delete, aprobar, rechazar, cargar masivo, descargar, etc.) DEBE: (1) bloquear su disparador con `loading()` + `[nzLoading]` + `disable()` en el form/boton, (2) usar `finalize()` para apagar el loading siempre, y (3) al exito, **recargar la fuente de datos afectada (lista, tabla, detalle, KPIs) ANTES de mostrar `messages.success(...)`**. Nunca dejar al usuario sin feedback visible mientras la peticion vuela ni con datos desactualizados despues. Ver `references/loading-ux.md` seccion "Mutaciones".

## HTTP

- Servicios de feature extienden `BaseHttpService`.
- Las URLs base vienen de `environment.url_fondeadores` en este proyecto. `AuthService` además consume `environment.url_core` y `environment.url_motor`.
- `BaseHttpService` aplica `takeUntil(canceller.cancelAll$)`. El subject vive en `core/services/request-canceller.service.ts` y `AuthService.logout()` lo dispara para abortar peticiones en vuelo.
- Tokens HTTP existentes: `SKIP_AUTH` y `SHOW_ERROR_MODAL` en `core/interceptors/http-context-tokens.ts`.
- `errorInterceptor` trata `404` con `responseCode '404'` como lista vacía (`{ data: null }`), no como error.
- Usar `forkJoin` para dependencias paralelas y `finalize()` para estado de loading.

## Estilos

- Tailwind v4 primero. Evitar `style=""` inline.
- Variables CSS con sintaxis del proyecto: `text-(--label-text-color)`, `bg-(--base-color-50)`, `h-(--h-header)`.
- Personalizar ng-zorro en `src/theme.less`, no en CSS de componente.
- `::ng-deep` no se usa para ng-zorro. Para contenido proyectado propio (`ng-content`), preferir `ViewEncapsulation.None` con selectores scoped por wrapper.
- Reutilizar clases globales: `.content-pages`, `.icon-action`, `.modal-header`, `.modal-footer`, `.custom-scrollbar`, `.shadow-header`, `[scrolltable]`, `btn-icon`.

## Modales

- Usar `ModalService` y `MessagesService`.
- Modal exclusiva de una feature: `pages/fondeadores/<feature>/modals/`.
- Modal reutilizable o generica: `shared/modals/`.
- Tamanos disponibles via `theme.less`: `nz300`, `nzXs`, `nzSm`, `nzMd`, `nzMd2`, `nzLg`, `nzXlg`, `nzXxl`.

## Referencias

| Archivo | Cuando consultarlo |
|---|---|
| `references/setup.md` | app.config, aliases, estructura real del repo |
| `references/componentes.md` | standalone, inject, control flow, CommonModule |
| `references/signals.md` | signals, computed, effect, Observable -> signal |
| `references/routing.md` | `/fondeadores`, lazy loading, guards, backUrl |
| `references/forms.md` | Reactive Forms, floatingLabel, loading en busquedas |
| `references/http.md` | BaseHttpService, interceptores, tokens HTTP |
| `references/ngzorro.md` | modulos ng-zorro, theme.less, nzLoading, btn-icon |
| `references/icons.md` | FA Pro, `.icon-action`, clases de tamano/color |
| `references/tailwind-y-css.md` | Tailwind v4, variables CSS, anti-inline styles |
| `references/loading-ux.md` | skeletons y `[nzLoading]` |
| `references/componentes-shared.md` | catalogo shared del proyecto |
| `references/modal-system/` | sistema de modales copy-paste |

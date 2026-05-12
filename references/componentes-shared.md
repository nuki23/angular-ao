# 11 — Catálogo de componentes shared y servicios core

Antes de crear un componente nuevo, revisar esta tabla. Cada entrada apunta al archivo real del proyecto. Para ejemplos de uso visuales, ver `src/app/pages/component-lista/example-*`.

---

## Componentes — `src/app/shared/components/`

### `app-collapse` — `custom-collapse/`
Sección colapsable con header propio y body proyectado.

```html
<app-collapse [(isExpanded)]="open" [bgColor]="'var(--bg-color)'">
  <div header>Filtros</div>
  <div body>…contenido…</div>
</app-collapse>
```

- `isExpanded` — `model<boolean>` (two-way).
- `bgColor` — `input<string>` (default `'var(--bg-color)'`).
- Ejemplo: `pages/component-lista/example-grid/` y uso real en `comprar-creditos.html`.

### `custom-skeleton` — `custom-skeleton/`
Placeholder visual mientras se cargan datos. Cinco variantes via `type`. Ver `references/loading-ux.md`.

```html
<custom-skeleton type="table" [rows]="6" [cols]="5" />
```

### `custom-table` — `table/`
Wrapper minimal sobre `<table>` HTML estilizado por `theme.less` (`.ant-table` overrides aplican). Estilo idéntico a `nz-table` pero sin la maquinaria de paginación interna (el proyecto pagina con `custom-pagination`).

```html
<custom-table [responsive]="true">…</custom-table>
```

- `responsive` — `input(false, { transform: booleanAttribute })`. Agrega clase `is-responsive` al host.
- Ejemplo: `pages/component-lista/example-tabla/`.

### `custom-pagination` — `pagination/`
Paginador con selector de `limit` y input numérico para ir directo a una página.

```html
<custom-pagination
  [total]="pagination().total"
  [skip]="pagination().skip"
  [limit]="pagination().limit"
  (pageChange)="onPageChange($event)" />
```

- `total`, `skip`, `limit` — `input.required<number>()`.
- `pageChange` — `output<{ skip: number; limit: number }>()`.
- Opciones de `limit`: `[20, 40, 80, 100, 150, 200]`.
- Default interno `100`.

### `fixed-content` — `fixed-content/`
Contenedor flotante con `position: fixed` y animaciones CSS de entrada/salida. Proyecta cualquier contenido.

```html
<fixed-content position="bottom" [visible]="hayCambios()">
  <button nz-button nzType="primary" (click)="guardar()">Guardar</button>
</fixed-content>
```

- `position` — `'top' | 'top-left' | 'bottom' | 'bottom-left' | 'right'` (default `'bottom'`).
- `visible` — controla la animación in/out (duración 160ms).
- El contenido se desmonta del DOM cuando termina la animación de salida.

### `input-file` — `input-file/`
`ControlValueAccessor` que produce `{ nombre, base64 }`. Valida tamaño y MIME/extension.

```html
<input-file
  formControlName="archivo"
  [accept]="'.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'"
  [maxSizeMb]="200"
  placeholder="Seleccionar archivo..." />
```

- Emite `InputFileValue | null` vía `formControlName`.
- Errores internos: tipo no permitido, supera límite MB.

### `custom-toggle` — `toggle/`
Switch on/off via `ControlValueAccessor` (compatible con `formControlName`).

```html
<custom-toggle formControlName="activo" />
```

### `app-tabs` + `app-tab` — `custom-tabs/`
Sistema de pestañas con `contentChildren`. Cada tab es un componente `<app-tab>` con su `title` y contenido proyectado.

```html
<app-tabs>
  <app-tab title="Disponible">…</app-tab>
  <app-tab title="Conciliación">…</app-tab>
  <app-tab title="Recomprados">…</app-tab>
</app-tabs>
```

Estado en `activeIndex = signal(0)`. Uso real en `pages/fondeadores/recompras/`.

### `app-chip-error` — `chip-error/`
Chip rojo con icono + texto para errores inline (validación, advertencia visible).

```html
<app-chip-error
  [icon]="faTriangleExclamation"
  text="Debes subir un archivo" />
```

- `color` — `@Input()` (default `'var(--error-color)'`).
- `icon` — `IconDefinition` (FA Pro).
- `text` — string.

---

## Directivas — `src/app/shared/directives/`

### `floatingLabel` — `floating-label.directive.ts`
Convierte un `nz-form-item` en un campo con label flotante. Agrega clase `.floating-layout` y togglea `.is-filled` según foco/valor (usa un `MutationObserver` para reaccionar a `nz-select` que inyecta el valor seleccionado).

```html
<nz-form-item floatingLabel>
  <nz-form-label>No. lote</nz-form-label>
  <nz-form-control>
    <input nz-input formControlName="noLote" />
  </nz-form-control>
</nz-form-item>
```

Estilo en `theme.less` (`.floating-layout.ant-form-item` + `.ant-form-item.is-filled`).

---

## Modales — `src/app/shared/modals/`

| Modal | Selector | Datos esperados (`nzModalData.params.data`) | Retorno (`afterClose`) |
|---|---|---|---|
| `FormModal` (`form-modal/`) | `app-form-modal` | — | `{ name }` o `undefined` |
| `InfoDialog` (`info-dialog/`) | `app-info-dialog` | `Dialog` (icon/img, textBold, botones) | `true` confirm / `false` cancel / `{ exit: true }` / `undefined` |
| `CargueMasivoModal` (`cargue-masivo/`) | `app-cargue-masivo` | `{ title, actionButtonLabel, urlPlantilla, accept, maxSizeMb, errorMessage }` | `InputFileValue` (archivo) o `undefined` |
| `TablaLoteComprarModal` (`comprar-lote/tabla-lote-comprar-modal.ts`) | `app-tabla-lote-comprar-modal` | `{ infoLote, creditosIncluidos }` | `true` / `false` |
| `VerDocumentosModal` (`ver-documentos/ver-documentos-modal.ts`) | `app-ver-documentos-modal` | `{ documentos: Documento[] }` | `undefined` |

Patrón de apertura (cualquiera de estas):

```typescript
this.modalService.openModal(
  CargueMasivoModal,
  'nzMd',
  { padding: '1.5rem' },
  { data: { title: 'Cargar lote', urlPlantilla: '/plantilla.xlsx' } },
  true,
).afterClose.subscribe((archivo) => { /* … */ });
```

> Para modales puntuales de una feature, crear en `pages/<feature>/modals/<modal-name>/`. Mover a `shared/modals/` solo cuando se use en ≥2 features.

---

## Animaciones — `src/app/shared/animations/animations.ts`

Triggers reutilizables. Importarlos con `animations: [...]` en el `@Component`.

| Trigger | Para qué |
|---|---|
| `fadeOut` | Fade controlado por estado (`'initial' | 'final'`), con `{ duration }` parametrizable. Usado en login al salir. |
| `fadeInEnterLogin` | Fade-in lento (2.5s) al montar — formulario de login. |
| `moveFromBottom` | Slide-up al montar — personajes/ilustración del login. |
| `heightInOut` | Expand/collapse de altura (`:enter` / `:leave`, 0.3s). Mensajes de error. |

---

## Transiciones — `src/app/shared/transitions/`

### `welcome-transition/welcome-transition.component.ts`
Pantalla intermedia que se muestra al hacer login exitoso antes de entrar a `/fondeadores/dashboard`. Renderiza la ilustración con `fadeOut` controlado.

---

## Guards — `src/app/shared/guards/`

### `authGuard` — `auth.guard.ts`
`CanActivateFn` funcional. Lee `AuthService.isAuthenticated()`; si no, redirige a `/login`. Aplicado en `app.routes.ts` sobre la zona `'fondeadores'`.

---

## Servicios core — `src/app/core/services/`

### `BaseHttpService` — `base-http.service.ts`
Padre de todos los servicios HTTP. `get/post/put/delete` con `takeUntil(canceller.cancelAll$)`. Ver `references/http.md`.

### `RequestCancellerService` — `request-canceller.service.ts`
Subject `cancelAll$` + método `cancelAll()`. Llamado por `AuthService.logout()` para abortar peticiones en vuelo.

### `AuthService` — `auth.service.ts`
Login Cognito + Motor, persistencia en `sessionStorage`, logout que limpia + redirige. Ver `references/http.md` para detalle.

### `OwnerSessionService` — `owner-session.service.ts`
Cache del owner del fondeador. Carga vía `GET .../owner_base/owner/by-user`, persiste en `sessionStorage` (`Owner-Fondeador`) y expone `ownerId(): number` (con fallback a `OWNER_ID_FALLBACK`).

```typescript
private ownerSession = inject(OwnerSessionService);
this.service.list({ new_owner_id: this.ownerSession.ownerId(), ... });
```

### `ModalService` — `services/modals/modal.service.ts`
`openModal(template, nzCol, bodyStyle, param, isCloseIcon=true, width?)`. Ver `references/modal-system/`.

### `MessagesService` — `services/modals/messages.service.ts`
Atajos `success`, `error`, `warning`, `show` + `showMessage()` genérico. Anti-spam en `error()` (`isErrorOpen`). Ver `references/modal-system/`.

---

## Resumen de imports por componente standalone

Cuando un componente nuevo necesita estos artefactos, los imports típicos son:

```typescript
// Tabla + paginación + skeleton
import { CustomSkeleton } from '@shared/components/custom-skeleton/custom-skeleton';
import { CustomTable } from '@shared/components/table/table';
import { CustomPagination, PageChangeEvent } from '@shared/components/pagination/pagination';

// Layout
import { FixedContent } from '@shared/components/fixed-content/fixed-content';
import { CustomCollapseComponent } from '@shared/components/custom-collapse/custom-collapse.component';

// Forms
import { FloatingLabelDirective } from '@shared/directives/floating-label.directive';
import { InputFileComponent } from '@shared/components/input-file/input-file';
import { CustomToggle } from '@shared/components/toggle/toggle';
import { ChipErrorComponent } from '@shared/components/chip-error/chip-error.component';

// Tabs
import { CustomTabs, Tab } from '@shared/components/custom-tabs/custom-tabs';

// Servicios
import { MessagesService } from '@core/services/modals/messages.service';
import { ModalService } from '@core/services/modals/modal.service';
import { OwnerSessionService } from '@core/services/owner-session.service';
```

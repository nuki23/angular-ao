# 09 — Tailwind v4 y CSS del proyecto

Dos hojas globales cargadas desde `angular.json`:

- `src/styles.css` — Tailwind v4 (`@import 'tailwindcss'`), tokens `@theme` del proyecto y clases globales reutilizables.
- `src/theme.less` — personalización de ng-zorro (variables less, overrides de `.ant-*`, tamaños de modal y `floating-layout`).

> No recrear estas reglas en CSS de componente si ya existen globalmente.

---

## Tokens `@theme` (definidos en `styles.css`)

Layout:
```
--side-witdh:   15.625rem   /* sidebar */
--h-header:     5rem        /* altura del header (usar en min-h y h-) */
--bg-color:     #f3f5f8     /* fondo de página */
```

Border radius:
```
--radius-sm: 0.5rem     /* badges, tags */
--radius-md: 1rem       /* inputs, botones, cards pequeñas */
--radius-lg: 1rem       /* cards estándar */
--radius-xl: 1.5rem     /* cards hero, dashboard */
--border-radius: var(--radius-md)
```

Escala tipográfica:
```
--text-xs:   0.625rem   /* labels uppercase */
--text-sm:   0.75rem    /* tabla, body compacto */
--text-base: 0.875rem   /* base, headers */
--text-lg:   1rem       /* subtítulos */
--text-xl:   1.25rem    /* títulos */
--text-2xl:  1.5rem     /* greeting dashboard */
```

Texto y bordes:
```
--label-text-color: #342B47
--label-text-size:  0.875rem
--border-color:     #e2e8f0
--error-color:      #f43f5e
--error-color-bg:   #ffe6e6
```

Marca (base → verde):
```
--base-color-50:   #edfff5
--base-color-100:  #c5fce1
--base-color-200:  #8df9c6
--base-color-300:  #45f0a5
--base-color-400:  #14e893
--base-color-500:  #00e58a   /* alias --base-color */
--base-color-600:  #00b86f
--base-color-700:  #008a52
--base-color-800:  #005c37
--base-color-900:  #002e1c
--base-color:      var(--base-color-500)
```

---

## Sintaxis Tailwind v4 con variables CSS

Las variables se referencian con `(--nombre)`, no `var(--nombre)`:

```html
<!-- Texto y fondos -->
<span class="text-(--label-text-color)">Texto</span>
<div  class="bg-(--base-color-50)"></div>
<div  class="border-(--border-color)"></div>

<!-- Iconos coloreados -->
<fa-icon [icon]="faEye" class="text-[18px] text-(--base-color-500)" />

<!-- Alturas/anchos calculados con tokens -->
<aside class="w-(--side-witdh)"></aside>
<main class="min-h-[calc(100vh-var(--h-header))]"></main>
```

Para fondos con alpha, todavía es válido el `style` con `var(...)` cuando hace falta una mezcla compleja, pero priorizar utilidades Tailwind.

---

## Clases globales (`src/styles.css`)

| Clase | Para qué |
|---|---|
| `.content-pages` | Wrapper de página tipo listado. Define `.header` (var(--bg-color), altura `--h-header`), `.sub-header` (blanco con borde) y zona `[scrolltable]` con scroll y `padding-bottom: 5rem`. |
| `.icon-action` | Icono interactivo: cursor pointer, hover con `opacity: 0.8`, active con `scale(0.9)`, estado `[disabled]`. |
| `.modal-header` | Título de modales: 1.5rem, bold, `--label-text-color`. |
| `.modal-footer` | Fila de botones flex `justify-between` con botones a 100% width. |
| `.custom-scrollbar` | Scrollbar webkit estilizado (gris claro, dark mode soportado vía `:host-context(.dark)`). |
| `.shadow-header` | `box-shadow` sutil para barras pegajosas. |

Estructura típica de una página de listado:

```html
<section class="content-pages">
  <div class="header">…filtros y acciones…</div>
  <div class="sub-header">…breadcrumb o título secundario…</div>
  <div scrolltable>
    <custom-table>…</custom-table>
  </div>
</section>
```

> `[scrolltable]` solo aplica dentro de `.content-pages` (selector anidado).

---

## Clases globales (`src/theme.less`)

| Clase / selector | Para qué |
|---|---|
| `.floating-layout.ant-form-item` | Renderiza un `nz-form-item` con label flotante (lo agrega la directiva `floatingLabel`). |
| `.ant-form-item.is-filled` | Estado "label arriba" — lo togglea la directiva al detectar valor o foco. |
| `.dialog-class .ant-modal-content` | Bordes redondeados (1.25rem) y sombra suave del modal. |
| `.nz300`, `.nzXs`, `.nzSm`, `.nzMd`, `.nzMd2`, `.nzLg`, `.nzXlg`, `.nzXxl` | Anchos de modal (usados con `ModalService.openModal`). |
| `.ant-btn[btn-icon="left"]`, `[btn-icon="right"]`, `[btn-icon]` | Botón con `<fa-icon>` posicionado absoluto a 0.75rem del borde. Padding lateral 3rem. |

Botón con icono lateral:

```html
<button nz-button nzType="primary" btn-icon="left">
  <fa-icon [icon]="faMagnifyingGlass" />
  Buscar
</button>
```

---

## Anti-patrones

### `style=""` inline
Evitar. Convertir a clase Tailwind con variables CSS.

```html
<!-- ❌ -->
<div style="background: #00e58a"></div>

<!-- ✅ -->
<div class="bg-(--base-color-500)"></div>
```

### `::ng-deep` para ng-zorro
No usar. Personalizar siempre en `src/theme.less` (variables less o overrides `.ant-*`).

### CSS de componente que duplica `.content-pages`, `.modal-header`, etc.
Si la regla ya vive global, importarla por clase. Solo escribir CSS específico de componente cuando es necesario.

### `[(ngModel)]` en formularios
Usar `ReactiveFormsModule` con `FormGroup`/`FormControl`. `ngModel` queda permitido solo en componentes utility (paginación, tabla interna) donde no aplica un form.

---

## Contenido proyectado (`ng-content`) y `::ng-deep`

Cuando un componente custom propio expone slots vía `ng-content` y necesita estilarlos, no usar `::ng-deep`. La alternativa del proyecto:

```typescript
@Component({
  selector: 'app-mi-wrapper',
  standalone: true,
  templateUrl: './mi-wrapper.html',
  styleUrl: './mi-wrapper.css',
  encapsulation: ViewEncapsulation.None,   // estilos globales pero…
  host: { class: 'mi-wrapper-host' },      // …scoped por la clase del host
})
export class MiWrapper {}
```

```css
/* mi-wrapper.css — selectores prefijados por la clase del host */
.mi-wrapper-host .slot-titulo { font-weight: 700; }
.mi-wrapper-host .slot-cuerpo { padding: 1rem; }
```

Esto deja los estilos aplicables al contenido proyectado sin contaminar el resto de la app y sin recurrir a `::ng-deep`.

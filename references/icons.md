# 08 — Iconos

## Dos sistemas, una regla

| Sistema | Usar para |
|---------|-----------|
| `<fa-icon>` (`@fortawesome/angular-fontawesome`) | Todo icono de contenido, acción o UI |
| `<span nz-icon>` | Solo iconos **internos de ng-zorro** (spinner nativo, etc.) |

---

## Font Awesome Pro — uso por componente

Importar `FaIconComponent` en `imports[]` y cada ícono como constante desde el paquete de estilo:

```typescript
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTruck, faPlus, faEye, faPen, faTrash } from '@fortawesome/pro-solid-svg-icons';

@Component({
  imports: [FaIconComponent],
})
export class MyComponent {
  readonly faTruck = faTruck;
  readonly faPlus  = faPlus;
  readonly faEye   = faEye;
}
```

---

## Paquetes de estilo disponibles

| Paquete | Prefijo importación | Descripción |
|---------|---------------------|-------------|
| `@fortawesome/pro-solid-svg-icons` | `fa...` | Sólido — mayor peso visual |
| `@fortawesome/pro-regular-svg-icons` | `fa...` | Regular — uso general |
| `@fortawesome/pro-light-svg-icons` | `fa...` | Fino — decorativo |
| `@fortawesome/free-solid-svg-icons` | `fa...` | Gratuito (sin Pro) |

> Mezclar estilos en el mismo componente es válido: importar de distintos paquetes según el ícono.

---

## Uso en template

```html
<!-- Básico -->
<fa-icon [icon]="faTruck" />
<fa-icon [icon]="faPlus" />

<!-- Tamaño con Tailwind -->
<fa-icon [icon]="faTruck" class="text-sm" />   <!-- ~14px -->
<fa-icon [icon]="faPlus"  class="text-base" />  <!-- ~16px -->
<fa-icon [icon]="faEye"   class="text-xl" />    <!-- ~20px -->

<!-- Color con Tailwind -->
<fa-icon [icon]="faTruck"  class="text-white" />
<fa-icon [icon]="faTrash"  class="text-rose-500" />
<fa-icon [icon]="faCircleInfo" class="text-slate-400" />

<!-- Icono interactivo (cursor + feedback visual) -->
<fa-icon [icon]="faEye" class="icon-action" (click)="ver(item)" />

<!-- Inline con botón -->
<button nz-button nzType="primary">
  <fa-icon [icon]="faPlus" class="mr-1 text-sm" />
  Crear
</button>
```

---

## Iconos Ant Design — registro global

Solo necesarios cuando ng-zorro los usa internamente (menú, tabla, etc.):

```typescript
// src/app/icons-provider.ts
import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  // Agregar más según la consola indique "icon not found"
} from '@ant-design/icons-angular/icons';

export const icons = [MenuFoldOutline, MenuUnfoldOutline];
```

```typescript
// app.config.ts
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { icons } from './icons-provider';

providers: [provideNzIcons(icons)]
```

---

## Íconos FA Pro más útiles

```typescript
// Navegación
faArrowLeft, faArrowRight, faChevronDown, faChevronRight
faRightFromBracket, faGear, faUser, faCircleUser

// CRUD
faPlus, faPen, faPencil, faTrash, faFloppyDisk
faEye, faEyeSlash, faXmark, faCheck, faEllipsis

// Estado
faSpinner, faClock, faCircleInfo, faCircleExclamation
faCircleCheck, faCircleXmark, faTriangleExclamation

// Interfaz
faMagnifyingGlass, faFilter, faBarsFilter, faBars
faEllipsisVertical, faTableCells, faList

// Contenido
faFileLines, faImage, faDownload, faUpload
faLocationDot, faEnvelope, faPhone, faLock
```

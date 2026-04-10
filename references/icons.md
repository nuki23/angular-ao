# 08 — Iconos

## Dos sistemas, una regla

| Sistema | Usar para |
|---------|-----------|
| `<lucide-icon>` (`lucide-angular`) | Todo icono de contenido, acción o UI |
| `<span nz-icon>` | Solo iconos **internos de ng-zorro** (spinner nativo, etc.) |

---

## lucide-angular — uso por componente

Importar cada ícono como constante directamente desde `lucide-angular`:

```typescript
import { LucideAngularModule, Truck, Plus, Eye, Edit, Trash2 } from 'lucide-angular';

@Component({
  imports: [LucideAngularModule],
})
export class MyComponent {
  readonly TruckIcon = Truck;
  readonly PlusIcon  = Plus;
  readonly EyeIcon   = Eye;
}
```

---

## Uso en template

```html
<!-- Tamaño con [size] -->
<lucide-icon [img]="TruckIcon" [size]="14"></lucide-icon>   <!-- 14px -->
<lucide-icon [img]="PlusIcon"  [size]="16"></lucide-icon>   <!-- 16px -->
<lucide-icon [img]="EyeIcon"   [size]="20"></lucide-icon>   <!-- 20px -->

<!-- Color con Tailwind -->
<lucide-icon [img]="TruckIcon" [size]="16" class="text-white"></lucide-icon>
<lucide-icon [img]="Trash2Icon" [size]="16" class="text-rose-500"></lucide-icon>
<lucide-icon [img]="InfoIcon"   [size]="16" class="text-slate-400"></lucide-icon>

<!-- Stroke width -->
<lucide-icon [img]="TruckIcon" [size]="18" [strokeWidth]="2"></lucide-icon>

<!-- Icono interactivo (cursor + feedback visual) -->
<lucide-icon [img]="EyeIcon" [size]="16" class="icon-action" (click)="ver(item)"></lucide-icon>

<!-- Inline con botón -->
<button nz-button nzType="primary">
  <lucide-icon [img]="PlusIcon" [size]="14" class="mr-1"></lucide-icon>
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

## Iconos lucide más útiles

```typescript
// Navegación
ArrowLeft, ArrowRight, ChevronDown, ChevronRight
LogOut, Settings, User, CircleUser

// CRUD
Plus, Edit, Pencil, Trash2, Save
Eye, EyeOff, X, Check, Ellipsis

// Estado
Loader, Clock, Info, CircleAlert
CircleCheck, CircleX, TriangleAlert

// Interfaz
Search, Funnel, ListFilter, Menu
EllipsisVertical, Grid, List

// Contenido
FileText, Image, Download, Upload
MapPin, Mail, Phone, Lock
```

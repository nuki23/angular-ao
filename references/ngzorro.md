# 07 — ng-zorro-antd

## Módulos comunes

Importar directamente en el array `imports[]` del componente standalone:

```typescript
import { NzButtonModule }     from 'ng-zorro-antd/button';
import { NzInputModule }      from 'ng-zorro-antd/input';
import { NzSelectModule }     from 'ng-zorro-antd/select';
import { NzFormModule }       from 'ng-zorro-antd/form';
import { NzTableModule }      from 'ng-zorro-antd/table';
import { NzDropdownModule }   from 'ng-zorro-antd/dropdown';
import { NzTagModule }        from 'ng-zorro-antd/tag';
import { NzLayoutModule }     from 'ng-zorro-antd/layout';
import { NzMenuModule }       from 'ng-zorro-antd/menu';
import { NzSpinModule }       from 'ng-zorro-antd/spin';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule }       from 'ng-zorro-antd/grid';
import { NzSkeletonModule }   from 'ng-zorro-antd/skeleton';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzCollapseModule }   from 'ng-zorro-antd/collapse';
import { NzDividerModule }    from 'ng-zorro-antd/divider';
import { NzSpaceModule }      from 'ng-zorro-antd/space';
import { NzModalModule }      from 'ng-zorro-antd/modal';  // GLOBAL en app.config
```

`NzModalModule` va en `app.config.ts`, no en componentes:
```typescript
importProvidersFrom(NzModalModule)
```

---

## Botones

```html
<button nz-button nzType="primary">Primario</button>
<button nz-button nzType="default">Default</button>
<button nz-button nzType="link">Link</button>
<button nz-button nzType="text">Texto</button>

<button nz-button nzType="primary" nzDanger>Eliminar</button>
<button nz-button nzType="default" nzDanger>Cancelar</button>

<button nz-button [nzLoading]="saving()">Guardando...</button>
<button nz-button [disabled]="form.invalid">Guardar</button>
```

---

## Input

```html
<input nz-input placeholder="Texto" formControlName="nombre" />
<input nz-input type="number" formControlName="cantidad" />

<!-- Con prefijo -->
<nz-input-group nzPrefix="$">
  <input nz-input formControlName="precio" />
</nz-input-group>

<!-- Textarea autoresize -->
<textarea nz-input formControlName="descripcion"
  [nzAutosize]="{ minRows: 3, maxRows: 6 }">
</textarea>
```

---

## Select

```html
<nz-select formControlName="categoria"
           nzPlaceHolder="Seleccionar"
           [nzAllowClear]="true"
           [nzShowSearch]="true">
  @for (opt of options; track opt.id) {
    <nz-option [nzValue]="opt.id" [nzLabel]="opt.nombre"></nz-option>
  }
</nz-select>

<!-- Selección múltiple -->
<nz-select formControlName="tags" [nzMode]="'multiple'" nzPlaceHolder="Tags">
  <nz-option nzValue="a" nzLabel="Tag A"></nz-option>
  <nz-option nzValue="b" nzLabel="Tag B"></nz-option>
</nz-select>
```

Atributos útiles: `[nzAllowClear]`, `[nzShowSearch]`, `[nzLoading]`, `[nzDisabled]`, `[nzMode]`

---

## DatePicker

```html
<nz-date-picker formControlName="fecha"
                [nzFormat]="'dd/MM/yyyy'"
                nzPlaceHolder="Seleccionar fecha"
                style="width: 100%">
</nz-date-picker>

<!-- Rango -->
<nz-range-picker formControlName="rango"
                 [nzFormat]="'dd/MM/yyyy'"
                 style="width: 100%">
</nz-range-picker>
```

---

## Grid

```html
<div nz-row [nzGutter]="[16, 12]">
  <div nz-col [nzXl]="6" [nzMd]="8" [nzXs]="24"><!-- campo --></div>
  <div nz-col [nzXl]="6" [nzMd]="8" [nzXs]="24"><!-- campo --></div>
  <div nz-col [nzSpan]="24"><!-- full width --></div>
</div>
```

Breakpoints: `nzXs` < 576, `nzSm` ≥ 576, `nzMd` ≥ 768, `nzLg` ≥ 992, `nzXl` ≥ 1200

---

## Tags

```html
<nz-tag nzColor="success">Activo</nz-tag>
<nz-tag nzColor="error">Inactivo</nz-tag>
<nz-tag nzColor="warning">Pendiente</nz-tag>
<nz-tag nzColor="processing">En proceso</nz-tag>
<nz-tag nzColor="default">N/A</nz-tag>
<nz-tag nzColor="#14b8a6">Custom hex</nz-tag>
```

---

## Dropdown de acciones

```html
<div nz-dropdown [nzDropdownMenu]="menu" nzTrigger="click" nzPlacement="bottomRight">
  <button nz-button nzType="text">
    <ng-icon name="lucideEllipsisVertical"></ng-icon>
  </button>
</div>

<nz-dropdown-menu #menu="nzDropdownMenu">
  <ul nz-menu>
    <li nz-menu-item (click)="editar(item)">Editar</li>
    <li nz-menu-divider></li>
    <li nz-menu-item nzDanger (click)="eliminar(item)">Eliminar</li>
  </ul>
</nz-dropdown-menu>
```

---

## Personalización: theme.less

> **REGLA**: No personalizar ng-zorro en el CSS del componente. Usar `src/theme.less`.

```less
@import "../node_modules/ng-zorro-antd/ng-zorro-antd.less";

// Color primario
@blue-base: #14b8a6;

// Dimensiones
@border-radius-base: 0.75rem;
@input-height-base:  28px;
@font-size-base:     0.875rem;

// Sobreescribir componentes específicos
.ant-btn {
  font-weight: 600;
  height: @input-height-base;
}

.ant-input {
  height: @input-height-base;
  padding: 0.375rem 0.625rem;
}

// Tamaños de modal (usados por ModalService)
.nz300 { width: 300px; }
.nzXs  { width: 368px; }
.nzSm  { width: 25.75rem; }
.nzMd  { width: 36.25rem; }
.nzLg  { width: 55rem; }
.nzXlg { width: 59rem; }

// Modal — backdrop blur
.ant-modal-mask {
  backdrop-filter: blur(4px);
  background: rgba(0, 0, 0, 0.25);
}

// Modal — bordes redondeados
.dialog-class .ant-modal-content {
  border-radius: 1.25rem;
}
```

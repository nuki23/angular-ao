# modal-system — Sistema de modales (copy-paste listo)

Sistema completo de modales con ng-zorro. Los archivos son réplica literal de los del proyecto. Se copian tal cual y funcionan en cualquier repo con el mismo stack.

## Archivos a copiar

```
modal-system/
├── dialog.interface.ts                      → src/app/core/models/dialog.interface.ts
├── modal.service.ts                         → src/app/core/services/modals/modal.service.ts
├── messages.service.ts                      → src/app/core/services/modals/messages.service.ts
└── info-dialog/
    ├── info-dialog.ts                       → src/app/shared/modals/info-dialog/info-dialog.ts
    ├── info-dialog.html                     → src/app/shared/modals/info-dialog/info-dialog.html
    └── info-dialog.css                      → src/app/shared/modals/info-dialog/info-dialog.css
```

## Prerequisitos

En `app.config.ts`:
```typescript
importProvidersFrom(NzModalModule)
```

En `tsconfig.json` (aliases):
```json
"paths": {
  "@core/*":   ["src/app/core/*"],
  "@shared/*": ["src/app/shared/*"]
}
```

Si vas a usar el flujo de iconos PNG (`img.src`), asegurar que existan las imágenes referenciadas (por defecto `/message-icon/success.png`, `/error.png`, `/warning.png`, `/info.png`, `/alerta.png`).

---

## Uso básico

```typescript
private messages = inject(MessagesService);

// Atajos
this.messages.success('Guardado correctamente');
this.messages.error('Ocurrió un error');
this.messages.warning('Hay datos sin guardar');
this.messages.show('Sin conexión', 'info');

// Confirmación con respuesta
this.messages.showMessage({
  icon: { name: faTriangleExclamation, container: 'text-amber-500' },
  textBold: '¿Eliminar este registro?',
  text: 'Esta acción no se puede deshacer.',
  confirmButton: { text: 'Sí, eliminar' },
  cancelButton:  { text: 'Cancelar' },
  withClass: 'nzXs',
  data: {},
}).subscribe(result => {
  if (result === true) this.eliminar();
});
```

> El método `error()` está protegido contra spam: si ya hay un modal de error abierto, los siguientes `messages.error(...)` se ignoran hasta que el primero cierre (`isErrorOpen + finalize()`).

---

## Abrir un componente custom como modal

```typescript
private modalService = inject(ModalService);

open(item: MyItem): void {
  const ref = this.modalService.openModal(
    MyDetailComponent,       // componente a renderizar
    'nzLg',                  // tamaño: nz300 | nzXs | nzSm | nzMd | nzMd2 | nzLg | nzXlg | nzXxl
    { padding: '1.5rem' },   // bodyStyle
    { data: item } as Dialog, // datos → accesibles vía inject(NZ_MODAL_DATA)
    true,                    // isCloseIcon (mostrar X)
    // '900px'               // width custom (opcional, sobrescribe el del tamaño)
  );

  ref.afterClose.subscribe(result => {
    if (result) this.loadData();
  });
}
```

Firma real: `openModal(template, nzCol, bodyStyle, param, isCloseIcon = true, width?)`.

---

## Recibir datos dentro del componente modal

```typescript
@Component({ standalone: true, /* ... */ })
export class MyDetailComponent {
  readonly nzModalData = inject(NZ_MODAL_DATA);
  readonly modal       = inject(NzModalRef);

  get item() { return this.nzModalData?.params?.data; }

  guardar(): void { this.modal.close({ ok: true }); }
  cancelar(): void { this.modal.close(); }
}
```

---

## Valores retornados por `showMessage()`

| Resultado | Cuándo |
|-----------|--------|
| `true` | El usuario pulsó `confirmButton` |
| `false` | El usuario pulsó `cancelButton` |
| `{ exit: true }` | El usuario pulsó `exitButton` |
| `undefined` | Cerró con la X o backdrop |

---

## Iconos en `InfoDialog`

`InfoDialog` admite dos vías mutuamente excluyentes:

### 1) `icon` — Font Awesome Pro

`icon.name` es un `IconDefinition` (no un string), y `icon.container` es la clase Tailwind del color.

```typescript
import {
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faTriangleExclamation,
} from '@fortawesome/pro-solid-svg-icons';

this.messages.showMessage({
  icon: { name: faCircleXmark, container: 'text-rose-500' },
  textBold: 'No se pudo guardar',
  confirmButton: { text: 'Entendido' },
  withClass: 'nzXs',
  data: {},
});
```

Combinaciones usadas en el proyecto:

| Tipo | Icono | Container |
|---|---|---|
| Éxito | `faCircleCheck` | `text-green-500` o `text-(--base-color-500)` |
| Error | `faCircleXmark` | `text-rose-500` |
| Advertencia | `faTriangleExclamation` | `text-amber-500` |
| Información | `faCircleInfo` | `text-blue-500` |

### 2) `img` — imagen PNG

Para mensajes con ilustración (los atajos `success`/`warning`/`show` usan esto):

```typescript
this.messages.showMessage({
  img: { src: '/message-icon/success.png', alt: 'Success' },
  textBold: 'Guardado correctamente',
  confirmButton: { text: 'Entendido' },
  withClass: 'nzXs',
  data: {},
});
```

> No mezclar `icon` y `img` en el mismo `Dialog` — `InfoDialog` renderiza uno u otro según cuál esté presente.

---

## `Dialog` (campos)

```typescript
interface Dialog {
  icon?:        { name?: IconDefinition; container: string };
  img?:         { src?: string; alt: string };
  text?:        string;
  textBold?:    string;
  subText?:     string;
  gridButton?:  number;
  confirmButton?: { text: string; icon?: string };
  cancelButton?:  { text: string; icon?: string };
  exitButton?:    { text: string; icon?: string };
  callback?:    any;
  data?:        any;
  padding?:     string;
  withClass?:   'nz300' | 'nzXs' | 'nzXXs' | 'nz2Xs' | 'nzSm' | 'nzMd' | 'nzLg' | 'nzXlg' | 'nzXxl';
}
```

> El proyecto usa `textBold` (no `titleBold`). Si vienes de un fork viejo del modal-system, renombrar.

---

## Tamaños de modal

Definir estas clases en `theme.less` del proyecto (todas presentes en `redcore-fondeador-xloan`):

```less
.nz300 { width: 300px; }
.nzXs  { width: 368px; }
.nzSm  { width: 25.75rem; }
.nzMd  { width: 36.25rem; }
.nzMd2 { width: 680px; }
.nzLg  { width: 55rem; }
.nzXlg { width: 59rem; }
.nzXxl { width: 73.75rem; }
```

`Dialog.withClass` también acepta `'nzXXs'` y `'nz2Xs'`; si los necesitas, agregar la regla correspondiente en `theme.less`.

---

## Default values en `MessagesService`

| Campo | Default | Notas |
|---|---|---|
| `withClass` | `'nzXs'` | si `params.withClass` viene vacío |
| `padding`   | `'3rem 1.5rem 1.5rem 1.5rem'` | si `params.padding` viene vacío |
| `confirmButton.text` (atajos) | `'Entendido'` | en `success/error/warning/show` |

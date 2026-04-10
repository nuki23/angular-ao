# modal-system — Sistema de modales (copy-paste listo)

Sistema completo de modales con ng-zorro. Se copia tal cual y funciona igual en cualquier proyecto con el mismo stack.

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

---

## Uso básico

```typescript
private messages = inject(MessagesService);

// Alertas simples
this.messages.success('Guardado correctamente');
this.messages.error('Ocurrió un error');
this.messages.show('Sin conexión', 'warning');

// Confirmación con respuesta
this.messages.showMessage({
  icon: { name: 'warning', container: 'text-amber-500' },
  titleBold: '¿Eliminar este registro?',
  text: 'Esta acción no se puede deshacer.',
  confirmButton: { text: 'Sí, eliminar' },
  cancelButton:  { text: 'Cancelar' },
  withClass: 'nzXs',
  data: {},
}).subscribe(result => {
  if (result === true) this.eliminar();
});
```

---

## Abrir un componente custom como modal

```typescript
private modalService = inject(ModalService);

open(item: MyItem): void {
  const ref = this.modalService.openModal(
    MyDetailComponent,       // componente a renderizar
    'nzLg',                  // tamaño: nz300 | nzXs | nzSm | nzMd | nzLg | nzXlg | nzXxl
    { padding: '1.5rem' },   // bodyStyle
    { data: item } as Dialog, // datos → accesibles vía inject(NZ_MODAL_DATA)
    true,                    // mostrar icono de cierre
    // '900px'               // width custom (opcional, sobrescribe el del tamaño)
  );

  ref.afterClose.subscribe(result => {
    if (result) this.loadData();
  });
}
```

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

## Valores retornados por showMessage()

| Resultado | Cuándo |
|-----------|--------|
| `true` | El usuario pulsó `confirmButton` |
| `false` | El usuario pulsó `cancelButton` |
| `{ exit: true }` | El usuario pulsó `exitButton` |
| `undefined` | Cerró con la X o backdrop |

---

## Iconos disponibles en InfoDialog (icon.name)

`'info'` `'check'` `'error'` `'warning'` `'trash'` `'clock'` `'code'` `'more'` `'message'`

Color del icono via `icon.container` (clase Tailwind):

```typescript
'text-green-500'  // éxito
'text-rose-500'   // error
'text-amber-500'  // advertencia
'text-blue-500'   // información
'text-red-500'    // peligro
```

---

## Tamaños de modal

Definir estas clases en `theme.less` del proyecto:

```less
.nz300 { width: 300px; }
.nzXs  { width: 368px; }
.nzSm  { width: 25.75rem; }
.nzMd  { width: 36.25rem; }
.nzLg  { width: 55rem; }
.nzXlg { width: 59rem; }
.nzXxl { width: 73.75rem; }
```

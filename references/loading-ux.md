# 10 — Loading UX

Tres componentes/atajos que combinas según el tipo de espera:

| Cuándo | Usar |
|---|---|
| Mostrar una región completa que aún no tiene datos (tabla, formulario, detalle) | `<custom-skeleton>` |
| Botón disparando una acción async (buscar, guardar, eliminar) | `[nzLoading]` |
| Listas/tablas en estado vacío (sin loading) | `<nz-empty>` |

> **Regla dura:** toda llamada HTTP que arranca por una acción del usuario (search, create, edit, delete, aprobar, rechazar, cargar masivo, descargar, etc.) debe ser visible mientras vuela **y** dejar datos frescos al volver. Si una mutación no recarga la lista/tabla/detalle afectado, el usuario ve datos desactualizados y desconfía. Ver sección "Mutaciones" abajo.

---

## `custom-skeleton` — placeholder visual

Definido en `src/app/shared/components/custom-skeleton/`. Componente standalone, signal-first, sin dependencias.

```typescript
type = input<SkeletonType>('table');   // 'table' | 'card' | 'input' | 'detail' | 'text'
rows = input<number>(6);
cols = input<number>(5);
```

```html
<!-- Tabla (default) -->
<custom-skeleton />
<custom-skeleton type="table" [rows]="8" [cols]="4" />

<!-- Inputs de un formulario que aún carga catálogos -->
<custom-skeleton type="input" [rows]="3" />

<!-- Vista detalle (cards con campos label+value) -->
<custom-skeleton type="detail" [rows]="2" [cols]="6" />

<!-- Card individual -->
<custom-skeleton type="card" [rows]="3" />

<!-- Texto suelto -->
<custom-skeleton type="text" [rows]="2" />
```

---

## Patrón canónico: búsqueda con loading

Extraído de `src/app/pages/fondeadores/comprar-creditos/comprar-creditos.ts`. Repetir tal cual en cada vista de listado:

```typescript
loading = signal(false);
listOfData = signal<LoteCredito[]>([]);
filterForm = new FormGroup({ /* ... */ });

buscar(): void {
  this.loading.set(true);
  this.filterForm.disable();

  this.service
    .list(this.filterForm.getRawValue())
    .pipe(
      finalize(() => {
        this.loading.set(false);
        this.filterForm.enable();
      }),
    )
    .subscribe((page) => this.listOfData.set(page.data));
}
```

Tres cosas pasan a la vez:

1. `loading.set(true)` activa el skeleton en el template.
2. `filterForm.disable()` deshabilita inputs y el botón "Buscar" mientras la petición está en curso.
3. `finalize()` reactiva ambos pase lo que pase (éxito o error).

### Template asociado

```html
<form nz-form [formGroup]="filterForm" (ngSubmit)="buscar()" nzLayout="vertical">
  <!-- filtros... -->
  <button
    nz-button
    nzType="primary"
    type="submit"
    btn-icon="left"
    [disabled]="loading()"
    [nzLoading]="loading()"
  >
    <fa-icon [icon]="faMagnifyingGlass" />
    Buscar
  </button>
</form>

@if (loading()) {
  <custom-skeleton />
} @else if (listOfData().length === 0) {
  <nz-empty />
} @else {
  <custom-table>…</custom-table>
}
```

> El shimmer de `[nzLoading]` está estilizado globalmente en `theme.less` (`@keyframes btn-shimmer`). No reescribirlo en CSS de componente.

---

## Catálogos: cargar antes de habilitar el formulario

Cuando un formulario depende de catálogos (selects con datos del backend), deshabilitar el form, mostrar skeleton, cargar con `forkJoin`, y al terminar habilitar y ocultar el skeleton.

```typescript
loadingCatalogos = signal(true);

ngOnInit(): void {
  this.form.disable();

  forkJoin({
    categorias: this.catalogoService.categorias(),
    estados:    this.catalogoService.estados(),
  })
    .pipe(finalize(() => this.loadingCatalogos.set(false)))
    .subscribe(({ categorias, estados }) => {
      this.categorias.set(categorias);
      this.estados.set(estados);
      this.form.enable();
    });
}
```

```html
@if (loadingCatalogos()) {
  <custom-skeleton type="input" [rows]="3" />
} @else {
  <form nz-form [formGroup]="form" nzLayout="vertical">…</form>
}
```

---

## `[nzLoading]` — botones primarios async

Para acciones puntuales (guardar, confirmar, descargar) que no necesitan skeleton de toda la región:

```typescript
saving = signal(false);

guardar(): void {
  if (this.form.invalid) return;
  this.saving.set(true);
  this.service.save(this.form.value)
    .pipe(finalize(() => this.saving.set(false)))
    .subscribe(() => {
      this.messages.success('Guardado correctamente');
      this.modal.close({ ok: true });
    });
}
```

```html
<button
  nz-button
  nzType="primary"
  type="button"
  [disabled]="saving()"
  [nzLoading]="saving()"
  (click)="guardar()"
>
  Guardar
</button>
```

---

## Mutaciones (create / edit / delete / aprobar / rechazar / cargar masivo)

Toda mutación sigue el mismo flujo. **El reload de la fuente de datos NO es opcional**: pasa antes de `messages.success(...)`.

### Pasos

1. **Bloquear el disparador** con un signal `saving` (o `deleting`, `approving`, según la acción) + `[nzLoading]` + `disabled`. Si la mutación nace desde un form, además `form.disable()`.
2. **`finalize()`** para apagar el loading pase lo que pase (éxito o error). Nunca apagarlo solo en `next`.
3. **Al éxito: primero `buscar()` (o el método que recarga la lista/detalle), después `messages.success(...)`**. No invertir el orden ni omitir la recarga.
4. Si la mutación se dispara desde un modal, el modal mismo NO toca la lista: cierra con `.modal.close(true)` y el componente padre, en `afterClose`, se encarga de la mutación + reload + success.

### Patrón canónico

```typescript
saving = signal(false);

eliminar(id: number): void {
  this.saving.set(true);
  this.service.delete(id).pipe(
    finalize(() => this.saving.set(false)),
  ).subscribe(() => {
    this.buscar();                                 // 1° refresca la tabla
    this.messages.success('Registro eliminado');   // 2° confirma al usuario
  });
}

guardar(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
  this.saving.set(true);
  this.form.disable();
  this.service.create(this.form.getRawValue()).pipe(
    finalize(() => {
      this.saving.set(false);
      this.form.enable();
    }),
  ).subscribe(() => {
    this.buscar();
    this.messages.success('Registro creado');
    this.form.reset();
  });
}
```

```html
<button
  nz-button
  nzType="primary"
  [disabled]="saving()"
  [nzLoading]="saving()"
  (click)="eliminar(item.id)"
>
  Eliminar
</button>
```

### Mutación lanzada desde un modal de confirmación

El modal solo confirma; el padre ejecuta y recarga.

```typescript
abrirAprobar(item: Lote): void {
  const ref = this.modalService.openModal(ConfirmModal, 'nzSm', { padding: '1.5rem' }, { data: item }, true);
  ref.afterClose.subscribe((confirmed) => {
    if (!confirmed) return;

    this.saving.set(true);
    this.service.aprobar(item.id).pipe(
      finalize(() => this.saving.set(false)),
    ).subscribe(() => {
      this.buscar();
      this.messages.success('Lote aprobado');
    });
  });
}
```

### Anti-patrones (los que confunden hoy al usuario)

- `messages.success(...)` antes de recargar la tabla → la lista muestra el dato viejo cuando el modal cierra.
- Click en "Eliminar" sin `[nzLoading]` ni `disabled` → el usuario hace doble click y dispara la mutación dos veces.
- Ejecutar la mutación dentro del modal sin avisar al padre → la tabla del padre no se entera y se queda desactualizada.
- Apagar `loading` en `next` en lugar de `finalize` → si la API falla, el spinner se queda encendido para siempre.
- Recargar la tabla sin mostrar skeleton/loading mientras tanto → la tabla parece estática aunque está en plena petición.

---

## Reglas

- Una sola señal `loading` (o `saving`, `deleting`, …) por acción async; nunca booleanos sueltos.
- `finalize()` es obligatorio para apagar el loading; nunca apagarlo solo en `next` (se queda colgado en `error`).
- No mostrar skeleton **y** `[nzLoading]` simultáneamente para la misma operación — eligir la que comunique mejor.
- Mientras `loading()`, `disabled` el botón disparador y `disable()` el form para evitar dobles envíos.
- Si el componente carga catálogos al iniciar, hacerlo en `ngOnInit` con `forkJoin` + `disable()` previo; no esperar al primer click.
- `<nz-empty>` ≠ loading. Solo cuando ya hay respuesta y vino vacía.
- Después de toda mutación (`POST/PUT/DELETE` o flujo equivalente), **recargar la fuente de datos antes de `messages.success(...)`**. No hacerlo es un bug de UX, no una optimización.

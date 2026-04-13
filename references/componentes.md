# 02 — Componentes standalone

## Estructura base

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { FaIconComponent }                   from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass }                 from '@fortawesome/pro-solid-svg-icons';
import { NzButtonModule }                    from 'ng-zorro-antd/button';
import { NzInputModule }                     from 'ng-zorro-antd/input';
import { ReactiveFormsModule }               from '@angular/forms';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FaIconComponent,
    NzButtonModule,
    NzInputModule,
  ],
  templateUrl: './my-component.html',
  styleUrl: './my-component.css',
})
export class MyComponent implements OnInit {
  private myService = inject(MyService);   // DI via inject(), no constructor

  readonly faMagnifyingGlass = faMagnifyingGlass;
  loading = signal(false);

  ngOnInit(): void { /* ... */ }
}
```

---

## inject() — inyección de dependencias

Preferir `inject()` en el cuerpo de la clase sobre constructor DI:

```typescript
// ✅ Moderno
export class MyComponent {
  private router   = inject(Router);
  private service  = inject(MyService);
  private messages = inject(MessagesService);
}

// ⚠️ Solo usar constructor cuando se necesita super() o lógica de init
export class MyService extends BaseHttpService {
  constructor() { super(); }
}
```

---

## Control flow (@if / @for / @switch)

```html
@if (loading()) {
  <p>Cargando...</p>
} @else if (items().length === 0) {
  <p>Sin resultados</p>
} @else {
  <ul>
    @for (item of items(); track item.id) {
      <li>{{ item.nombre }}</li>
    }
  </ul>
}

@switch (status) {
  @case ('active')   { <span class="text-green-600">Activo</span> }
  @case ('inactive') { <span class="text-red-500">Inactivo</span> }
  @default           { <span>Desconocido</span> }
}
```

> `@if/@for/@switch` reemplazan `*ngIf`, `*ngFor`, `ngSwitch`. No importar `CommonModule` para estas directivas.

---

## FA Pro — iconos por componente

Importar `FaIconComponent` en `imports[]` y declarar cada ícono como propiedad `readonly`:

```typescript
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faUser, faTrash, faFloppyDisk } from '@fortawesome/pro-solid-svg-icons';

@Component({
  imports: [FaIconComponent],
})
export class MyComponent {
  readonly faUser        = faUser;
  readonly faTrash       = faTrash;
  readonly faFloppyDisk  = faFloppyDisk;
}
```

```html
<fa-icon [icon]="faUser"  class="text-base" />
<fa-icon [icon]="faTrash" class="text-rose-500" />
```

---

## Recibir datos en modal (NZ_MODAL_DATA)

```typescript
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({ standalone: true, /* ... */ })
export class MyModalComponent {
  readonly nzModalData = inject(NZ_MODAL_DATA);
  readonly modal       = inject(NzModalRef);

  get item() { return this.nzModalData?.params?.data; }

  guardar(): void { this.modal.close({ ok: true, data: this.result }); }
  cancelar(): void { this.modal.close(); }
}
```

---

## Template inline (para layouts pequeños)

```typescript
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FaIconComponent, NzDropdownModule],
  styles: [`.trigger { cursor: pointer; }`],
  template: `
    <div class="flex items-center gap-2 px-4">
      <fa-icon [icon]="faUser" />
      <span>{{ userName }}</span>
    </div>
  `,
})
export class HeaderComponent {
  readonly faUser = faUser;
  userName = 'Usuario';
}
```

---

## Ciclo de vida

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({ standalone: true, /* ... */ })
export class MyComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    // Se ejecuta una vez al inicializar el componente
  }

  ngOnDestroy(): void {
    // Limpiar suscripciones, timers, etc.
  }
}
```

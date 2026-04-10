# 03 — Signals

Sistema reactivo nativo de Angular 17+. Reemplaza zone.js y es compatible con detección de cambios zoneless.

---

## signal() — estado mutable

```typescript
import { signal } from '@angular/core';

loading  = signal(false);
count    = signal(0);
items    = signal<string[]>([]);
selected = signal<number | null>(null);

// Leer — siempre como función
const value = this.loading();

// Actualizar
this.loading.set(true);
this.count.update(n => n + 1);
this.items.update(list => [...list, 'nuevo']);
```

En template (detección automática):
```html
@if (loading()) { <span>Cargando...</span> }
<p>{{ count() }}</p>
<span>{{ items().length }} elementos</span>
```

---

## computed() — valores derivados

Se recalcula automáticamente cuando algún signal que lee cambia. Sin side-effects.

```typescript
import { signal, computed } from '@angular/core';

items   = signal<{ precio: number; cantidad: number }[]>([]);

total   = computed(() => this.items().reduce((acc, i) => acc + i.precio * i.cantidad, 0));
isEmpty = computed(() => this.items().length === 0);
hasItems = computed(() => this.items().length > 0);
```

```html
<p>Total: {{ total() | currency }}</p>
@if (isEmpty()) { <p>Sin items</p> }
```

> `computed()` es lazy — solo se ejecuta cuando alguien lo lee Y algún signal cambió.

---

## effect() — reaccionar a cambios con side-effects

Se ejecuta cuando cambian los signals que lee. Se declara en el constructor.

```typescript
import { Component, effect, signal } from '@angular/core';

@Component({ /* ... */ })
export class MyComponent {
  theme = signal<'light' | 'dark'>('light');

  constructor() {
    effect(() => {
      document.body.setAttribute('data-theme', this.theme());
    });

    // Con cleanup (limpiar subscripciones externas)
    effect((onCleanup) => {
      const sub = this.externalService.changes$.subscribe(v => this.data.set(v));
      onCleanup(() => sub.unsubscribe());
    });
  }
}
```

---

## input() — señal de entrada del componente

Reemplaza `@Input()`:

```typescript
import { Component, input, booleanAttribute } from '@angular/core';

@Component({ /* ... */ })
export class MyComponent {
  title    = input<string>();               // opcional
  count    = input(0);                      // con default
  disabled = input(false, { transform: booleanAttribute });  // <comp disabled> → true
  data     = input.required<Item[]>();      // requerido

  // Leer en clase o template
  isDisabled() { return this.disabled(); }
}
```

```html
<!-- Uso -->
<my-component title="Hola" [count]="5" disabled [data]="items"></my-component>
```

---

## output() — eventos de salida

Reemplaza `@Output() + EventEmitter`:

```typescript
import { Component, output } from '@angular/core';

@Component({ /* ... */ })
export class MyComponent {
  saved    = output<void>();
  selected = output<Item>();

  onSave()            { this.saved.emit(); }
  onSelect(item: Item) { this.selected.emit(item); }
}
```

```html
<my-component (saved)="handleSave()" (selected)="handleSelect($event)"></my-component>
```

---

## Patrones comunes

### Toggle booleano
```typescript
isOpen = signal(false);
toggle() { this.isOpen.update(v => !v); }
```

### Lista con operaciones
```typescript
items = signal<Item[]>([]);

add(item: Item)     { this.items.update(list => [...list, item]); }
remove(id: number)  { this.items.update(list => list.filter(i => i.id !== id)); }
update(item: Item)  { this.items.update(list => list.map(i => i.id === item.id ? item : i)); }
```

### Set dinámico (collapsed/expanded IDs)
```typescript
expandedIds = signal<Set<number>>(new Set());

toggle(id: number) {
  this.expandedIds.update(set => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
}

isExpanded(id: number) { return this.expandedIds().has(id); }
```

### Loading + data
```typescript
loading = signal(false);
data    = signal<Item[]>([]);
error   = signal<string | null>(null);

load() {
  this.loading.set(true);
  this.error.set(null);
  this.service.getData().subscribe({
    next: d  => { this.data.set(d); this.loading.set(false); },
    error: e => { this.error.set(e.message); this.loading.set(false); },
  });
}
```

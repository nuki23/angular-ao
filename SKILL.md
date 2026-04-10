---
name: angular-ao
description: >
  Estándares y patrones para proyectos Angular 21 standalone/zoneless con ng-zorro,
  Tailwind v4 y @ng-icons/lucide. Aplica automáticamente cuando el usuario trabaja
  en código Angular — componentes, rutas, formularios, HTTP, modales.
user-invocable: false
---

# Angular 21 — Estándares AO

Aplica estas reglas en CADA tarea Angular. No pedir confirmación; aplicarlas directamente.

---

## Reglas obligatorias

### Componentes
- Siempre **standalone: true**. Nunca NgModules.
- DI con **inject()** en el cuerpo de la clase. Solo usar constructor cuando se necesita `super()`.
- **Control flow nativo**: `@if`, `@for`, `@switch`. Nunca `*ngIf`, `*ngFor`.
- Iconos lucide: registrar en **viewProviders** del componente, no globalmente.

### Signals
- Estado local: **signal()** + `.set()` / `.update()`.
- Valores derivados: **computed()** — sin side-effects.
- Side-effects reactivos: **effect()** — solo en constructor.
- Props de entrada: **input()** (reemplaza @Input). Eventos: **output()** (reemplaza @Output + EventEmitter).

### Routing
- Lazy loading con **named export**: `export const FEATURE_ROUTES: Routes`
- Guards como **CanActivateFn** funcional con `inject()`.
- Hash routing: `provideRouter(routes, withHashLocation())`.

### Formularios
- Siempre **ReactiveFormsModule**. Nunca template-driven.
- **FormControl tipado**: `new FormControl<string | null>(null)`.
- Cargar catálogos con **forkJoin** antes de habilitar el form.

### HTTP
- Servicios extienden **BaseHttpService** (ver references/http.md).
- La URL base viene de `environment.apiUrl`.
- Interceptores: **HttpInterceptorFn** funcional. Nunca de clase.

### ng-zorro
- Personalizar en **theme.less** SIEMPRE. Nunca en el CSS del componente.
- `NzModalModule` en **app.config.ts** via `importProvidersFrom`.
- Módulos ng-zorro: importar directamente en `imports[]` del componente.

### Iconos
- **`lucide-angular`** para todo icono de contenido o acción.
  - Importar cada ícono como constante: `import { Truck, Plus } from 'lucide-angular'`
  - Exponer como propiedad readonly en la clase: `readonly TruckIcon = Truck`
  - Usar en template: `<lucide-icon [img]="TruckIcon" [size]="16" />`
  - Importar `LucideAngularModule` en el `imports[]` del componente
- **`<span nz-icon nzType="...">`** solo para iconos internos de ng-zorro (inputs, selects, etc.)
- Para íconos interactivos: añadir clase `.icon-action`

### Modales
- Usar **ModalService** y **MessagesService** (ver references/modal-system/).
- El sistema de modales es idéntico en todos los proyectos.
- Header de toda modal: clase `.modal-header` + `.modal-header__bar` + `.modal-header__title`.

---

## Stack del proyecto

```
Angular 21       standalone · zoneless · signals-first
ng-zorro-antd    UI components
Tailwind v4      utilidades + @theme tokens
lucide-angular   iconografía
```

---

## Documentación detallada

Consultar en `references/` cuando se necesiten ejemplos completos:

| Archivo | Cuándo consultarlo |
|---------|-------------------|
| `references/setup.md` | Configurar nuevo proyecto, app.config, aliases |
| `references/componentes.md` | Esqueleto de componente, inject(), control flow |
| `references/signals.md` | signal(), computed(), effect(), input(), output() |
| `references/routing.md` | Lazy loading, guards, navegación |
| `references/forms.md` | FormGroup, validación, disable/enable, forkJoin |
| `references/http.md` | BaseHttpService, interceptores, AuthService |
| `references/ngzorro.md` | Módulos, componentes, theme.less |
| `references/icons.md` | Registro y uso de iconos |
| `references/modal-system/` | Código copy-paste del sistema de modales |

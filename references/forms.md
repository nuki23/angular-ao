# 05 — Formularios reactivos

## Import necesario

```typescript
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule, NzSelectModule],
})
```

---

## FormGroup + FormControl

```typescript
form = new FormGroup({
  nombre:    new FormControl<string>('', [Validators.required]),
  email:     new FormControl<string>('', [Validators.required, Validators.email]),
  edad:      new FormControl<number | null>(null),
  activo:    new FormControl<boolean>(true),
  categoria: new FormControl<string | null>(null, [Validators.required]),
});
```

Con `FormBuilder`:
```typescript
private fb = inject(FormBuilder);

ngOnInit() {
  this.form = this.fb.group({
    nombre: ['', [Validators.required]],
    email:  ['', [Validators.required, Validators.email]],
  });
}
```

---

## Template con ng-zorro (nzLayout="vertical")

```html
<form nz-form [formGroup]="form" (ngSubmit)="save()" nzLayout="vertical">

  <nz-form-item>
    <nz-form-label nzRequired>Nombre</nz-form-label>
    <nz-form-control nzErrorTip="El nombre es requerido">
      <input nz-input formControlName="nombre" placeholder="Nombre completo" />
    </nz-form-control>
  </nz-form-item>

  <nz-form-item>
    <nz-form-label>Categoría</nz-form-label>
    <nz-form-control>
      <nz-select formControlName="categoria" nzPlaceHolder="Seleccionar" [nzAllowClear]="true">
        @for (opt of options; track opt.value) {
          <nz-option [nzValue]="opt.value" [nzLabel]="opt.label"></nz-option>
        }
      </nz-select>
    </nz-form-control>
  </nz-form-item>

  <div class="flex gap-2 justify-end">
    <button nz-button nzType="default" type="button" (click)="cancel()">Cancelar</button>
    <button nz-button nzType="primary" type="submit" [disabled]="form.invalid">Guardar</button>
  </div>

</form>
```

---

## Validación en submit

```typescript
save(): void {
  if (this.form.invalid) {
    // Marcar todo dirty para mostrar errores
    Object.values(this.form.controls).forEach(ctrl => {
      ctrl.markAsDirty();
      ctrl.updateValueAndValidity({ onlySelf: true });
    });
    return;
  }
  const payload = this.form.value;
  this.service.save(payload).subscribe({ /* ... */ });
}
```

---

## patchValue — pre-llenar el formulario

```typescript
ngOnInit() {
  const item = this.data;
  this.form.patchValue({
    nombre:    item.nombre,
    email:     item.email,
    categoria: item.categoria_id,
    // Campos que no se pasen conservan su valor actual
  });
}
```

---

## Disable / Enable dinámico

```typescript
// Inicializar campos deshabilitados
form = new FormGroup({
  campo1: new FormControl({ value: '', disabled: true }),
  campo2: new FormControl({ value: null, disabled: true }),
});

// Habilitar/deshabilitar por nombre
this.form.get('campo1')?.enable();
this.form.get('campo1')?.disable();

// Habilitar grupo completo
this.form.enable();
this.form.disable();
```

Patrón de "modo edición" (readonly → editable):
```typescript
private editableFields = ['email', 'categoria'];
isEditing = signal(false);

startEdit() {
  this.isEditing.set(true);
  this.editableFields.forEach(key => this.form.get(key)?.enable());
}

cancelEdit() {
  this.isEditing.set(false);
  this.editableFields.forEach(key => this.form.get(key)?.disable());
  this.form.patchValue(this.originalData);
}
```

---

## Reset

```typescript
// Reset completo — todos los campos a null
this.form.reset();

// Reset con valores por defecto
this.form.reset({ categoria: 'default', activo: true });

// Reset parcial — mantener algunos valores
const savedValue = this.form.get('eps')?.value;
this.form.reset();
this.form.get('eps')?.setValue(savedValue);
```

---

## Validators disponibles

```typescript
Validators.required
Validators.minLength(6)
Validators.maxLength(100)
Validators.email
Validators.min(0)
Validators.max(999)
Validators.pattern(/^\d+$/)

// Custom validator
function noWhitespace(ctrl: AbstractControl): ValidationErrors | null {
  return typeof ctrl.value === 'string' && ctrl.value.trim() === ''
    ? { noWhitespace: true }
    : null;
}
```

---

## Leer errores en template

```html
<nz-form-control
  [nzErrorTip]="
    form.get('email')?.hasError('required') ? 'Email requerido' :
    form.get('email')?.hasError('email')    ? 'Email inválido'  : ''
  ">
  <input nz-input formControlName="email" />
</nz-form-control>
```

---

## forkJoin — cargar datos antes de habilitar el form

```typescript
import { forkJoin } from 'rxjs';

ngOnInit() {
  this.form.disable();
  this.loading.set(true);

  forkJoin({
    categorias: this.catalogService.get('categorias'),
    usuarios:   this.userService.getAll(),
  }).subscribe({
    next: ({ categorias, usuarios }) => {
      this.categorias = categorias;
      this.usuarios   = usuarios;
      this.form.enable();
      this.loading.set(false);
    },
    error: () => this.loading.set(false),
  });
}
```

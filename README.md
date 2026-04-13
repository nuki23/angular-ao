# angular-ao

Skill de Angular 21 para Claude Code — patrones standalone/zoneless con ng-zorro, Tailwind v4 y @fortawesome/pro.

## Instalación

Copiar la carpeta `skill-angular-ao/` en:

```
# Por proyecto (solo aplica en este repo)
.claude/skills/angular-ao/

# Global (aplica en todos los proyectos)
~/.claude/skills/angular-ao/
```

Reiniciar Claude Code. El skill se activa automáticamente en tareas Angular.

---

## Estructura

```
SKILL.md                          ← entrada principal (reglas siempre activas)
references/
├── setup.md                      ← bootstrap, app.config, estructura de carpetas
├── componentes.md                ← standalone, inject(), control flow
├── signals.md                    ← signal(), computed(), effect(), input(), output()
├── routing.md                    ← lazy loading, guards, navegación
├── forms.md                      ← formularios reactivos, validación
├── http.md                       ← BaseHttpService, interceptores
├── ngzorro.md                    ← módulos, componentes, theme.less
├── icons.md                      ← @fortawesome/pro vs nz-icon
└── modal-system/                 ← código copy-paste del sistema de modales
    ├── README.md                 ← instrucciones de instalación y uso
    ├── dialog.interface.ts
    ├── modal.service.ts
    ├── messages.service.ts
    └── info-dialog/
        ├── info-dialog.ts
        ├── info-dialog.html
        └── info-dialog.css
```

## Qué hace el skill

- Aplica reglas Angular 21 en cada tarea (standalone, signals, inject(), control flow)
- Recuerda cómo usar ng-zorro, icons y formularios
- El sistema de modales en `references/modal-system/` es copy-paste directo al proyecto

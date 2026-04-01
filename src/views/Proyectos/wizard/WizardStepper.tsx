import { cn } from '@/shared/lib/utils'

const STEPS = [
  { n: 1, label: 'Datos Generales' },
  { n: 2, label: 'Actividades'     },
  { n: 3, label: 'Construcción'    },
] as const

export function WizardStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => {
        const done   = step.n < current
        const active = step.n === current
        return (
          <div key={step.n} className="flex items-center flex-1 last:flex-none">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  done   && 'text-white',
                  active && 'text-white',
                  !done && !active && 'border-2'
                )}
                style={{
                  backgroundColor: done   ? 'var(--color-success)'    :
                                   active ? 'var(--color-petroleum)'   : 'transparent',
                  borderColor: !done && !active ? 'var(--color-border)' : undefined,
                  color: !done && !active ? 'var(--color-text-soft)' : undefined,
                }}
              >
                {done ? '✓' : step.n}
              </div>
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: active ? 'var(--color-petroleum)' : done ? 'var(--color-text-soft)' : 'var(--color-text-soft)' }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-3 mb-5 transition-colors"
                style={{ backgroundColor: done ? 'var(--color-success)' : 'var(--color-border)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

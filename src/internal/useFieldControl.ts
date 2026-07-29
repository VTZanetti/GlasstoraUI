import { computed, inject, type ComputedRef } from 'vue'
import { fieldKey } from './keys'
import { useGlassId } from './useId'

export interface FieldControlProps {
  id?: string
  invalid?: boolean
  required?: boolean
}

export interface FieldControl {
  id: ComputedRef<string>
  describedBy: ComputedRef<string | undefined>
  invalid: ComputedRef<boolean>
  required: ComputedRef<boolean>
}

/**
 * Reconciles a control's own props with the GlassField around it, if there is
 * one. An explicit prop always wins, so a control can still be used on its own
 * or overridden inside a field.
 */
export function useFieldControl(props: FieldControlProps, prefix: string): FieldControl {
  const field = inject(fieldKey, null)
  const generated = useGlassId(prefix)

  return {
    id: computed(() => props.id || field?.id.value || generated),
    describedBy: computed(() => field?.describedBy.value),
    invalid: computed(() => Boolean(props.invalid) || Boolean(field?.invalid.value)),
    required: computed(() => Boolean(props.required) || Boolean(field?.required.value)),
  }
}

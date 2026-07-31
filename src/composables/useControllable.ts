import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'

export interface UseControllableReturn<T> {
  /** The value in force, whoever owns it. */
  value: ComputedRef<T>
  /** Reports the change and, when nobody is controlling it, records it. */
  setValue: (next: T) => void
  /** True while the consumer is passing the prop. */
  controlled: ComputedRef<boolean>
}

/**
 * One value that works with or without v-model.
 *
 * Passing the prop takes control: the component reports changes and renders
 * whatever comes back. Leaving it out lets the component keep the value itself,
 * so `<GlassSwitch />` on its own still toggles.
 *
 * The prop is read through a getter rather than by name because that stays
 * typed. `v-model:sort` and `v-model` are the same call with a different
 * getter, and a misspelled prop is a compile error instead of undefined.
 *
 *   const { value: open, setValue: setOpen } = useControllable(
 *     () => props.modelValue,
 *     (value) => emit('update:modelValue', value),
 *     false,
 *   )
 *
 * `undefined` is what "nobody is controlling this" means, so a value that can
 * be empty has to say so with null or '' rather than undefined.
 */
export function useControllable<T>(
  current: () => T | undefined,
  onChange: (value: T) => void,
  defaultValue: MaybeRefOrGetter<T>,
): UseControllableReturn<T> {
  // Undefined until the first change, so a default that derives from props (the
  // first enabled tab, say) keeps tracking them until the user picks something.
  const internal = ref<T>() as Ref<T | undefined>

  const controlled = computed(() => current() !== undefined)

  const value = computed<T>(() => {
    const outer = current()
    if (outer !== undefined) return outer
    return internal.value !== undefined ? internal.value : toValue(defaultValue)
  })

  function setValue(next: T) {
    // Arrays and objects are replaced rather than mutated, so identity is the
    // only comparison that means anything for them, and it is also what keeps a
    // primitive from echoing a change nobody made.
    if (next === value.value) return
    if (!controlled.value) internal.value = next
    onChange(next)
  }

  return { value, setValue, controlled }
}

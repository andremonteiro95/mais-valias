import { computed, ref } from "vue";
import type { FormValues } from "~/composables/useCalculations";

/**
 * A frozen snapshot of the form state and derived results at a point in time.
 */
export interface PinnedSnapshot {
  id: number;
  snapshotKey: string;
  formValues: FormValues;
  // display / diff fields
  valorVenda: number | null;
  anoVenda: number;
  coef: number;
  maisValia: number;
  maisValiaTributavel50: number;
  valorAReinvestir: number;
  maisValiaIsenta: number;
  maisValiaTributavelParcial: number;
  modoReinvestimento: "total" | "parcial" | "nenhum";
  valorReinvestido: number | null;
}

/**
 * The subset of computed results that useCalculations returns and that
 * usePinnedSnapshots needs to capture in each snapshot.
 */
export interface CalculationSnapshot {
  coeficiente: { value: number };
  maisValia: { value: number };
  maisValiaTributavel50: { value: number };
  valorAReinvestir: { value: number };
  maisValiaIsenta: { value: number };
  maisValiaTributavelParcial: { value: number };
  /** A stable string key that identifies this result set. */
  currentSnapshotKey?: { value: string };
}

/**
 * Callback used to restore a pinned snapshot into the live form.
 * Matches the VeeValidate `setValues` signature.
 */
type SetValuesFn = (values: Partial<FormValues>) => void;

/**
 * Callback used to transition the form back to the "confirmed" phase when
 * restoring a snapshot (matches the pattern in index.vue).
 */
type OnRestoreFn = () => void;

/**
 * Pinned-snapshots state machine.
 *
 * Encapsulates the list of pinned scenarios, compare-mode selection, delta
 * helpers, and modal visibility — everything under the "Pinned snapshots"
 * section of index.vue.
 *
 * Usage:
 *   const {
 *     pinnedSnapshots, compareWith, hasPinnedBar,
 *     pinCurrent, removePin, restorePin, ...
 *   } = usePinnedSnapshots(values, calcs, setValues, onRestore)
 *
 * @param values     Reactive VeeValidate form values object.
 * @param calcs      Reactive computed results from useCalculations.
 * @param setValues  VeeValidate setValues function, used when restoring a pin.
 * @param onRestore  Optional callback run after restoring (e.g. to switch phase).
 */
export function usePinnedSnapshots(
  values: FormValues,
  calcs: CalculationSnapshot,
  setValues: SetValuesFn,
  onRestore?: OnRestoreFn,
) {
  // ── Internal counter for stable IDs ────────────────────────────────────────
  const pinnedCounter = ref(0);

  // ── Snapshot list ───────────────────────────────────────────────────────────
  const pinnedSnapshots = ref<PinnedSnapshot[]>([]);

  // ── Compare mode ────────────────────────────────────────────────────────────
  /** ID of the snapshot currently selected for comparison, or null. */
  const compareWith = ref<number | null>(null);

  // Kept as an alias so index.vue's existing template references keep working
  // if the composable is adopted incrementally.
  const activeCompareId = compareWith;

  // ── Modal visibility ────────────────────────────────────────────────────────
  const showCompareModal = ref(false);

  // ── Derived key for the current live state ─────────────────────────────────
  const currentSnapshotKey = computed(() =>
    [
      Math.round(calcs.maisValia.value),
      Math.round(calcs.maisValiaTributavel50.value),
      Math.round(calcs.valorAReinvestir.value),
    ].join("|"),
  );

  // ── Active comparison snapshot ─────────────────────────────────────────────
  const pinnedSnapshot = computed(
    () => pinnedSnapshots.value.find((p) => p.id === compareWith.value) ?? null,
  );

  // ── Visibility helper ───────────────────────────────────────────────────────
  const hasPinnedBar = computed(() => pinnedSnapshots.value.length > 0);

  // ── Best snapshot (lowest taxable gain) ────────────────────────────────────
  const bestPinnedId = computed(() => {
    if (pinnedSnapshots.value.length < 2) return null;
    return pinnedSnapshots.value.reduce((best, p) =>
      p.maisValiaTributavel50 < best.maisValiaTributavel50 ? p : best,
    ).id;
  });

  // ── Delta helpers ───────────────────────────────────────────────────────────
  const diffMaisValia = computed(() => {
    if (!pinnedSnapshot.value) return null;
    return calcs.maisValia.value - pinnedSnapshot.value.maisValia;
  });

  const diffTributavel = computed(() => {
    if (!pinnedSnapshot.value) return null;
    return calcs.maisValiaTributavel50.value - pinnedSnapshot.value.maisValiaTributavel50;
  });

  const diffAReinvestir = computed(() => {
    if (!pinnedSnapshot.value) return null;
    return calcs.valorAReinvestir.value - pinnedSnapshot.value.valorAReinvestir;
  });

  const diffVerdict = computed(() => {
    if (!pinnedSnapshot.value) return null;
    const d = diffTributavel.value ?? 0;
    if (Math.abs(d) < 1) return "neutral";
    return d < 0 ? "better" : "worse";
  });

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Capture the current form state and calculation results as a new pin. */
  function pinCurrent() {
    pinnedCounter.value++;
    pinnedSnapshots.value.push({
      id: pinnedCounter.value,
      snapshotKey: currentSnapshotKey.value,
      formValues: { ...values } as FormValues,
      valorVenda: values.valorVenda,
      anoVenda: values.anoVenda,
      coef: calcs.coeficiente.value,
      maisValia: calcs.maisValia.value,
      maisValiaTributavel50: calcs.maisValiaTributavel50.value,
      valorAReinvestir: calcs.valorAReinvestir.value,
      maisValiaIsenta: calcs.maisValiaIsenta.value,
      maisValiaTributavelParcial: calcs.maisValiaTributavelParcial.value,
      modoReinvestimento: values.modoReinvestimento,
      valorReinvestido: values.valorReinvestido,
    });
  }

  /** Remove a pin by id. Clears the compare selection if it matches. */
  function removePin(id: number) {
    if (compareWith.value === id) compareWith.value = null;
    pinnedSnapshots.value = pinnedSnapshots.value.filter((p) => p.id !== id);
  }

  // Keep the original name from index.vue as an alias.
  const removePinned = removePin;

  /** Toggle compare mode for a given pin id. */
  function toggleCompare(id: number) {
    compareWith.value = compareWith.value === id ? null : id;
  }

  /** Remove all pins and exit compare mode. */
  function clearPinned() {
    pinnedSnapshots.value = [];
    compareWith.value = null;
  }

  /**
   * Restore a pinned snapshot into the live form.
   * Calls setValues and (optionally) the onRestore callback.
   */
  function restorePin(p: PinnedSnapshot) {
    setValues(p.formValues);
    onRestore?.();
  }

  // Keep the original name from index.vue as an alias.
  const restoreSnapshot = restorePin;

  return {
    // State
    pinnedSnapshots,
    /** ID of the snapshot selected for comparison (alias: activeCompareId). */
    compareWith,
    activeCompareId,
    showCompareModal,
    // Derived
    currentSnapshotKey,
    pinnedSnapshot,
    hasPinnedBar,
    bestPinnedId,
    // Deltas
    diffMaisValia,
    diffTributavel,
    diffAReinvestir,
    diffVerdict,
    // Actions
    pinCurrent,
    removePin,
    removePinned,
    toggleCompare,
    clearPinned,
    restorePin,
    restoreSnapshot,
  };
}

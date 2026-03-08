<script setup lang="ts">
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  modelValue?: number | null;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  step?: number;
  max?: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number | null];
}>();
</script>

<template>
  <UInputNumber
    :model-value="props.modelValue"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :required="props.required"
    :step="props.step"
    :max="props.max"
    :format-options="{
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }"
    locale="pt-PT"
    :min="0"
    :increment="false"
    :decrement="false"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

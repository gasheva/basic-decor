<script setup lang="ts">
import BaseCard from '@/ui/card/BaseCard.vue'
import type { Product } from '@/interfaces/Product'
import { computed } from 'vue'

interface IProps {
  product: Product
}

const props = defineProps<IProps>()

const emit = defineEmits<{
  (e: 'toggle', id: number): void
}>()

const toggleSelection = () => {
  emit('toggle', props.product.id)
}

const formattedPrice = computed(() => {
  return Intl.NumberFormat('ru-RU').format(props.product.price)
})

const generateId = () => {
  return `product_card-${Date.now()}`
}
const checkboxId = generateId()
</script>

<template>
  <base-card>
    <template #default>
      <div class="d-flex align-items-center mb-1">
        <input
          :id="checkboxId"
          class="form-check-input mt-0"
          type="checkbox"
          :checked="product.selected"
          aria-label="Select all"
          @click.capture="toggleSelection"
        />
        <label :for="checkboxId" class="ms-2" @click.prevent>Выбрать</label>
        <div
          class="d-flex align-items-center justify-content-center ms-auto bg-primary"
          :class="$style.favourite"
        >
          <i class="bi bi-heart text-white"></i>
        </div>
      </div>
      <img :src="props.product.image" height="220" class="card-img-top object-fit-cover" />
      <h5 class="card-title mt-2">{{ props.product.name }}</h5>

      <div class="text-secondary small">Артикул: {{ props.product.vendor_sku }}</div>
      <div class="text-secondary small">Бренд: {{ props.product.brand }}</div>
      <div class="mt-auto">
        <span class="fs-3 fw-bold">{{ formattedPrice }}</span
        ><span class="fw-bold">&nbsp;руб.</span>
      </div>
    </template>
  </base-card>
</template>

<style module>
.favourite {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>

<script setup lang="ts">
import { SORT_CRITERIA_LIST } from '@/components/sortFilter/consts'
import type { SortCriteria } from '@/components/sortFilter/interfaces/SortCriteria'

interface IProps {
  selectedSortCriteria: SortCriteria
}
const props = defineProps<IProps>()

const emit = defineEmits<{
  (e: 'select', sortCriteria: SortCriteria): void
}>()
</script>

<template>
  <div class="d-flex align-items-center mb-4">
    <span class="me-3">Сортировать:</span>
    <button
      v-for="filter in SORT_CRITERIA_LIST"
      :key="filter.name"
      class="btn btn-link p-0 me-3"
      :class="{
        [$style.sortLink]: true,
        active: filter.id === props.selectedSortCriteria.id,
        'text-secondary': filter.id !== props.selectedSortCriteria.id
      }"
      @click.prevent="() => emit('select', filter)"
    >
      {{ filter.name }}
    </button>
  </div>
</template>

<style module>
.sortLink {
  text-decoration-style: dotted;
}
</style>

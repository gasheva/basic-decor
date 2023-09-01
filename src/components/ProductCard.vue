<script setup lang="ts">
import BaseCard from "@/ui/card/BaseCard.vue";

import type {Product} from "@/interfaces/Product";

interface IProps {
   product: Product
}

const props = defineProps<IProps>();

const emit = defineEmits<{
    (e: 'toggle', id: number): void
}>();

const toggleSelection = () => {
    emit('toggle', props.product.id);
};

</script>

<template>
<base-card>
   <template #default>
    <div>{{props.product.name}}</div>
    <div>{{props.product.price}}</div>
   <input type="checkbox" @change="toggleSelection" />
   </template>
</base-card>
</template>

<style scoped>

</style>
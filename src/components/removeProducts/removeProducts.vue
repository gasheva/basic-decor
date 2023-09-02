<script setup lang="ts">

interface IProps {
    countOfSelectedProducts: number
}
const props = defineProps<IProps>()

const emit = defineEmits<{
    (e: 'remove'): void
}>();

</script>

<template>
    <div class="d-flex justify-content-end align-items-center">
                  <span v-show="props.countOfSelectedProducts" class="text-secondary small text-nowrap me-3">
                      Выбрано товаров: {{ props.countOfSelectedProducts }}
                  </span>

        <button type="button" class="btn bg-white border-primary p-3" @click="emit('remove')">
            <i class="bi-trash-fill text-primary" :class="$style.icon"></i>
        </button>
    </div>
</template>

<style module>
.icon {
    display: block;
    width: 24px;
    height: 24px;
    font-size: 20px;
}
</style>
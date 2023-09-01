<script setup lang="ts">

import type {Category} from "@/interfaces/Category";

interface IProps {
    categories: Category[]
}
const {categories} = defineProps<IProps>()

const emit = defineEmits<{
    (e: 'select', category: Category): void
    (e: 'selectAll'): void
}>()

</script>

<template>
    <div class="d-flex ">
        <div>
            <input class="form-check-input mt-0" type="checkbox" value=""
                   aria-label="Select all" @input="emit('selectAll')">
        </div>
        <div class="dropdown">
            <button class="btn btn-light dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton1"
                    data-bs-toggle="dropdown" aria-expanded="false">
                Categories
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li v-for="category in categories" :key="category.id">
                    <a class="dropdown-item" href="#" @click="emit('select', category)">{{ category.name }}</a>
                    <ul>
                        <li v-for="child in category.children" :key="child.id">
                            <a class="dropdown-item" href="#" @click="emit('select', child)">{{ `${child.name} (${child.productsCount})` }}</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<style module>
</style>
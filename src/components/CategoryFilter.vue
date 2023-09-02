<script setup lang="ts">

import type {Category} from "@/interfaces/Category";
import {ref} from "vue";

interface IProps {
    categories: Category[]
    selectedCategory: Category
}
const {categories, selectedCategory} = defineProps<IProps>()

const emit = defineEmits<{
    (e: 'select', category: Category): void
    (e: 'toggleAll', val: boolean): void
}>()

const selectAll = ref(false);

const onSelect = (val:Category)=>{
    selectAll.value = false;
    emit('select', val);
}

const onSelectAll = (event: Event)=>{
    selectAll.value = event.target.checked;
    emit('toggleAll', event.target.checked)
}

</script>

<template>
    <div class="d-flex align-items-center border w-25">
        <input class="form-check-input" :class="$style.checkbox"
               type="checkbox" id="flexCheckDefault"
               :checked="selectAll"
               aria-label="Select all" @input="onSelectAll">
        <div class="dropdown w-100" :class="$style.dropdown">
            <button class="btn bg-white dropdown-toggle w-100 d-flex justify-content-between align-items-center"
                    :class="$style.button"
                    type="button"
                    id="dropdownMenuButton1"
                    data-bs-toggle="dropdown" aria-expanded="false">
                {{selectedCategory?.name || ''}}
            </button>
            <ul class="dropdown-menu w-100" aria-labelledby="dropdownMenuButton1">
                <li v-for="category in categories" :key="category.id">
                    <a class="dropdown-item text-wrap"
                       :class="[$style.dropdownItem, {'text-primary':selectedCategory.id===category.id}]" @click="onSelect(category)">{{ category.name }}</a>
                    <ul class="ps-3">
                        <li v-for="child in category.children" :key="child.id" class="list-unstyled">
                            <a class="dropdown-item text-wrap"
                               :class="[$style.dropdownItem, {'text-primary':selectedCategory.id===child.id}]" @click.prevent="onSelect(child)">{{ `${child.name} (${child.productsCount})` }}</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<style module>
.dropdownItem:hover{
    cursor: pointer;
}
.dropdownItem:active {
    background-color: white !important;
    color: inherit !important;

}
.dropdown {
    border-left: 1px solid #dee2e6;
}
.button:focus {
    border: none !important;
}
.checkbox {
    margin: 11px;
}
</style>
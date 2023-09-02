<script setup lang="ts">
import { useRequests } from '@/composable/useRequests'
import { computed, onMounted, ref } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import CategoryFilter from '@/components/categoryFilter/CategoryFilter.vue'
import type { Category } from '@/interfaces/Category'
import { SORT_CRITERIA_LIST } from '@/components/sortFilter/consts'
import type { SortCriteria } from '@/components/sortFilter/interfaces/SortCriteria'
import SortFilter from '@/components/sortFilter/SortFilter.vue'
import RemoveProducts from '@/components/removeProducts/removeProducts.vue'
import { defaultCategory } from '@/components/categoryFilter/consts'
import useCategories from '@/composable/useCategories'
import useProducts from '@/composable/useProducts'

const { fetch: fetchAllData, remove: removeProduct } = useRequests()

const selectedSortCriteria = ref<SortCriteria>(SORT_CRITERIA_LIST[0])

const {
  categories,
  selectedCategory,
  getCategoryFromRouter,
  enrichCategoriesWithProductCounts,
  setCategoryFilter
} = useCategories()
const {
  products,
  displayedProducts,
  toggleProductStatus,
  toggleAllProducts,
  updateDisplayedProducts
} = useProducts([])

const countOfSelectedProducts = computed(() => {
  return displayedProducts.value.filter((p) => p.selected).length
})

const fetchData = () => {
  fetchAllData().then((res) => {
    products.value = res.data.data.products

    categories.value = res.data.data.categories
    enrichCategoriesWithProductCounts(products.value)
    categories.value.unshift(defaultCategory)

    const categoryFromRouter = getCategoryFromRouter()
    if (!categoryFromRouter) {
      setCategoryFilter(defaultCategory)
      updateDisplayedProducts(selectedSortCriteria.value, selectedCategory.value)
      return
    }
    selectedCategory.value = categoryFromRouter
    updateDisplayedProducts(selectedSortCriteria.value, selectedCategory.value)
  })
}
onMounted(() => {
  fetchData()
})

const removeSelectedProducts = () => {
  const selectedProductIds = displayedProducts.value.filter((p) => p.selected).map((p) => p.id)
  selectedProductIds.forEach((id) => {
    removeProduct(id).then(() => {
      products.value = products.value.filter((p) => p.id !== id)
      updateDisplayedProducts(selectedSortCriteria.value, selectedCategory.value)
    })
  })
}

const applySortCriteria = (criteria: SortCriteria) => {
  selectedSortCriteria.value = criteria
  updateDisplayedProducts(selectedSortCriteria.value, selectedCategory.value)
}

const onSelectCategoryFilter = (val: Category) => {
  setCategoryFilter(val)
  updateDisplayedProducts(selectedSortCriteria.value, selectedCategory.value)
}
</script>

<template>
  <main>
    <div class="container-xl pb-5">
      <h1 class="mt-3 mb-5">Избранное</h1>
      <sort-filter :selected-sort-criteria="selectedSortCriteria" @select="applySortCriteria" />

      <category-filter
        class="mb-4 mt-3"
        v-bind="{ categories, selectedCategory }"
        @select="onSelectCategoryFilter"
        @toggle-all="toggleAllProducts"
      />

      <div class="row">
        <div class="col-9 d-flex flex-wrap">
          <product-card
            v-for="product in displayedProducts"
            :key="product.id"
            v-bind="{ product }"
            @toggle="toggleProductStatus"
            :class="$style.card"
          />
        </div>
        <div class="col-3">
          <remove-products
            :count-of-selected-products="countOfSelectedProducts"
            @remove="removeSelectedProducts"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style module>
.card {
  flex-basis: calc(33.33% - 20px);
}
</style>

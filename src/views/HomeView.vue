<script setup lang="ts">
import {useRequests} from "@/composable/useRequests";
import {computed, onMounted, ref} from "vue";
import {useRouter} from 'vue-router'
import ProductCard from "@/components/ProductCard.vue";
import CategoryFilter from "@/components/categoryFilter/CategoryFilter.vue";
import type {Product} from "@/interfaces/Product";
import type {Category} from "@/interfaces/Category";
import {ALL_CATEGORIES_ID} from "@/consts";
import {SORT_CRITERIA_LIST} from "@/components/sortFilter/consts";
import type {SortCriteria} from "@/components/sortFilter/interfaces/SortCriteria";
import SortFilter from "@/components/sortFilter/SortFilter.vue";
import RemoveProducts from "@/components/removeProducts/removeProducts.vue";
import {defaultCategory} from "@/components/categoryFilter/consts";
import useCategories from "@/composable/useCategories";

const {fetch: fetchAllData, remove: removeProduct} = useRequests();
const router = useRouter();

const
    products = ref<Product[]>([]),
    selectedSortCriteria = ref(SORT_CRITERIA_LIST[0]),
    displayedProducts = ref<Product[]>([]);

const {categories, selectedCategory, getCategoryFromRouter, enrichCategoriesWithProductCounts, setCategoryFilter} = useCategories();

const countOfSelectedProducts = computed(() => {
    return displayedProducts.value.filter(p => p.selected).length;
});

const updateDisplayedProducts = (products: Product[]) => {
    let sortedProducts: Product[] = [];
    switch (selectedSortCriteria.value.id) {
        case 'date':
            sortedProducts = sortByDate(); break;
        case 'priceAsc':
            sortedProducts = sortByPriceAsc(products); break;
        case 'priceDesc':
            sortedProducts = sortByPriceDesc(products); break;
    }
    return filterProductsBySelectedCategory(sortedProducts, selectedCategory.value);
};

fetchAllData().then((res) => {
    products.value = res.data.data.products;

    categories.value = res.data.data.categories;
    enrichCategoriesWithProductCounts(products.value);
    categories.value.unshift(defaultCategory);

    const categoryFromRouter = getCategoryFromRouter();
    if(!categoryFromRouter) {
        setCategoryFilter(defaultCategory);
        displayedProducts.value = updateDisplayedProducts(products.value)
        return;
    }
    selectedCategory.value = categoryFromRouter;
    displayedProducts.value = updateDisplayedProducts(products.value)

});
onMounted(()=>{
    console.log('mounted');
})

const toggleProductStatus = (productId:number) => {
    const idx = displayedProducts.value.findIndex(p=>p.id === productId)
    if(idx === -1) {
        return;
    }
    displayedProducts.value[idx] = {...displayedProducts.value[idx], selected:!displayedProducts.value[idx].selected};
};

const removeSelectedProducts = () => {
    const selectedProductIds = displayedProducts.value.filter(p=>p.selected).map(p=>p.id);
    selectedProductIds.forEach(id => {
        removeProduct(id).then(()=>{
            products.value = products.value.filter(p=>p.id !== id);
            displayedProducts.value = updateDisplayedProducts(products.value);
        })
    })
};

const filterProductsBySelectedCategory = (products: Product[], val: Category) => {
    if(val.id === ALL_CATEGORIES_ID){
        return products;
    }

    return products.filter(p => {
        return p.categories.includes(val.id) || val.children?.some(c => p.categories.includes(c.id))
    })
}

const onSelectCategoryFilter = (val: Category)=>{
    setCategoryFilter(val);
    displayedProducts.value = updateDisplayedProducts(products.value);
}

const toggleAllProducts = (val: boolean)=>{
    displayedProducts.value = displayedProducts.value.map(p=>({...p, selected: val}));
}

const sortByDate = () => {
    return [...products.value];
};

const sortByPriceAsc = (products: Product[]) => {
    return [...products].sort((a: Product, b: Product) => {
        return a.price - b.price;
    })
};

const sortByPriceDesc = (products: Product[]) => {
    return [...products].sort((a: Product, b: Product) => {
        return b.price - a.price;
    })
};

const applySortCriteria = (val: SortCriteria)=>{
    selectedSortCriteria.value = val;
    displayedProducts.value = updateDisplayedProducts(products.value);
}

</script>

<template>
  <main>
      <div class="container-xl pb-5">
      <h1 class="mt-3 mb-5">Избранное</h1>
      <sort-filter :selected-sort-criteria="selectedSortCriteria" @select="applySortCriteria"/>

      <category-filter class="mb-4 mt-3" v-bind="{categories, selectedCategory}" @select="onSelectCategoryFilter" @toggle-all="toggleAllProducts"/>

          <div class="row">
              <div class="col-9 d-flex flex-wrap">
                  <product-card
                          v-for="product in displayedProducts" :key="product.id"
                          v-bind="{product}" @toggle="toggleProductStatus" :class="$style.card"/>
              </div>
              <div class="col-3">
                  <remove-products :count-of-selected-products="countOfSelectedProducts" @remove="removeSelectedProducts"/>
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

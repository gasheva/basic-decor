<script setup lang="ts">
import {useRequests} from "@/composable/useRequests";
import {computed, ref} from "vue";
import {useRoute, useRouter} from 'vue-router'
import ProductCard from "@/components/ProductCard.vue";
import CategoryFilter from "@/components/CategoryFilter.vue";
import type {Product} from "@/interfaces/Product";
import type {Category} from "@/interfaces/Category";
import {ALL_CATEGORIES_ID} from "@/consts";
import {SORT_CRITERIA_LIST} from "@/components/sortFilter/consts";
import type {SortCriteria} from "@/components/sortFilter/interfaces/SortCriteria";
import SortFilter from "@/components/sortFilter/SortFilter.vue";
import RemoveProducts from "@/components/removeProducts/removeProducts.vue";

const defaultCategory: Category = {id: ALL_CATEGORIES_ID, name: 'Все товары'};

const {fetch: fetchAllData, remove: removeProduct} = useRequests();
const router = useRouter();
const route = useRoute();

const
    products = ref<Product[]>([]),
    categories = ref<Category[]>([]),
    selectedCategory = ref<Category>(defaultCategory),
    selectedSortCriteria = ref(SORT_CRITERIA_LIST[0]),
    displayedProducts = ref<Product[]>([]);

const countOfSelectedProducts = computed(() => {
    return displayedProducts.value.filter(p => p.selected).length;
});

const getCategoryFromRouter = () => {
    if(route.name==='home'){
        return defaultCategory;
    }
    const id = Number(route.params.id);
    if(!id || isNaN(id)) {
        return defaultCategory;
    }
    let categoryRoute = null;
    for (const category of categories.value) {
        if(category.id === id) {
            categoryRoute = category;
            break;
        }
        if(category.children) {
            for (const child of category.children) {
                if(child.id === id) {
                    categoryRoute = child;
                    break;
                }
            }
        }
    }

    return categoryRoute;
}

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

const enrichCategoriesWithProductCounts = (categories: Category[]): Category[] => {
    return categories.map(category => {
        let childCategoriesWithCounts: Category[] = [];
        if(category.children) {
            childCategoriesWithCounts = category.children.map(child => {
                const associatedProductsCount = products.value.filter(product => product.categories.includes(child.id)).length;
                return {...child, productsCount: associatedProductsCount};
            });
        }
        return {...category, children: childCategoriesWithCounts};
    });
};

fetchAllData().then((res) => {
    products.value = res.data.data.products;
    displayedProducts.value = [...products.value]

    categories.value = res.data.data.categories;
    categories.value = enrichCategoriesWithProductCounts(categories.value);
    categories.value.unshift(defaultCategory);

    const categoryFromRouter = getCategoryFromRouter();
    if(!categoryFromRouter) {
        router.push({name:'home'}).catch(()=>{})
        return;
    }
    selectedCategory.value = categoryFromRouter;
});


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

const setCategoryFilter = (val: Category)=>{
    selectedCategory.value = val;
    displayedProducts.value = updateDisplayedProducts(products.value);
    if(val.id===ALL_CATEGORIES_ID){
        router.push({name:'home'}).catch(()=>{});
        return;
    }
    router.push({name:'selectedCategory', params: {id: val.id.toString()}}).catch(()=>{});
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
      <h1 class="mb-5">Избранное</h1>
      <sort-filter :selected-sort-criteria="selectedSortCriteria" @select="applySortCriteria"/>

      <category-filter class="mb-4 mt-3" v-bind="{categories, selectedCategory}" @select="setCategoryFilter" @toggle-all="toggleAllProducts"/>

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

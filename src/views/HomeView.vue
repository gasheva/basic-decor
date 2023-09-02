<script setup lang="ts">
import {useRequests} from "@/composable/useRequests";
import {computed, ref} from "vue";
import { useRouter, useRoute } from 'vue-router'
import ProductCard from "@/components/ProductCard.vue";
import CategoryFilter from "@/components/CategoryFilter.vue";
import type {Product} from "@/interfaces/Product";
import type {Category} from "@/interfaces/Category";

const CATEGORY_ID_SELECTED_ALL = -1;

interface ISortFilter {
    id: string,
    name: string,
}
const SORT_FILTERS: ISortFilter[] = [
    {id: 'date', name: 'По дате добавления'},
    {id: 'priceAsc', name: 'От дешевых к дорогим'},
    {id: 'priceDesc', name: 'От дорогих к дешевым'},
]
const defaultCategory: Category = {id: CATEGORY_ID_SELECTED_ALL, name: 'Все товары'};

const {fetch, remove} = useRequests();
const router = useRouter();
const route = useRoute();

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const selectedCategory = ref<Category>(defaultCategory);
const selectedSort = ref(SORT_FILTERS[0]);

const productsShown = ref<Product[]>([]);

const selectedProductsCount = computed(() => {
    return productsShown.value.filter(p => p.selected).length;
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

const recalculateProducts = (products: Product[]) => {
    let sorted: Product[] = [];
    switch (selectedSort.value.id) {
        case 'date':
            sorted = sortByDate(); break;
        case 'priceAsc':
            sorted = sortByPriceAsc(products); break;
        case 'priceDesc':
            sorted = sortByPriceDesc(products); break;
    }
    const filtered = filterProductsByCategory(sorted, selectedCategory.value);
    return filtered;
};

fetch().then((res) => {
    products.value = res.data.data.products;
    productsShown.value = [...products.value]
    categories.value = res.data.data.categories;
    categories.value = categories.value.map(c=>{
        let childrenWithCounts: Category[] = [];
        if(c.children) {
             childrenWithCounts = c.children.map(child => {
                const productsCount = products.value.filter(p => {
                    return p.categories.includes(child.id)
                }).length;
                return {...child, productsCount}
            })
        }
        return {...c, children: childrenWithCounts}
    })
    categories.value.unshift(defaultCategory);
    const categoryFromRouter = getCategoryFromRouter();
    if(!categoryFromRouter) {
        router.push({name:'home'}).catch(()=>{})
        return;
    }
    selectedCategory.value = categoryFromRouter;
})


const toggleProductSelection = (id:number) => {
    const idx = productsShown.value.findIndex(p=>p.id === id)
    if(idx === -1) {
        return;
    }
    productsShown.value[idx] = {...productsShown.value[idx], selected:!productsShown.value[idx].selected};
};

const deleteSelected = () => {
    const ids = productsShown.value.filter(p=>p.selected).map(p=>p.id);

    ids.forEach(id => {
        remove(id).then(()=>{
            products.value = products.value.filter(p=>p.id !== id);
            productsShown.value = recalculateProducts(products.value);
        })
    })
};

const filterProductsByCategory = (products: Product[], val: Category) => {
    if(val.id === CATEGORY_ID_SELECTED_ALL){
        return products;
    }

    return products.filter(p => {
        return p.categories.includes(val.id) || val.children?.some(c => p.categories.includes(c.id))
    })
}

const onSelectCategory = (val: Category)=>{
    selectedCategory.value = val;
    productsShown.value = recalculateProducts(products.value);
    if(val.id===CATEGORY_ID_SELECTED_ALL){
        router.push({name:'home'}).catch(()=>{});
        return;
    }
    router.push({name:'selectedCategory', params: {id: val.id.toString()}}).catch(()=>{});
}

const toggleAllProducts = (val: boolean)=>{
    productsShown.value = productsShown.value.map(p=>({...p, selected: val}));
}

const sortByDate = () => {
    return [...products.value];
};

const sortByPriceAsc = (products: Product[]) => {
    const res = [...products].sort((a: Product, b: Product) => {
        return a.price - b.price;
    });

    return res
};

const sortByPriceDesc = (products: Product[]) => {
    const res = [...products].sort((a: Product, b: Product) => {
        return b.price - a.price;
    });

    return res
};

const onSortChanged = (val: ISortFilter)=>{
    selectedSort.value = val;
    productsShown.value = recalculateProducts(products.value);
}

</script>

<template>
  <main>
      <div class="container-xl pb-5">
      <h1 class="mb-5">Избранное</h1>
      <div class="d-flex align-items-center mb-4">
          <span class="me-3">Сортировать:</span>
          <button v-for="filter in SORT_FILTERS" :key="filter.name"
                  class="btn btn-link p-0 me-3"
                  :class="{[$style.sortLink]: true, active: filter.id === selectedSort.id, 'text-secondary': filter.id !== selectedSort.id}"
                  @click.prevent="()=>onSortChanged(filter)">{{ filter.name }}
          </button>
      </div>

      <category-filter class="mb-4 mt-3" v-bind="{categories, selectedCategory}" @select="onSelectCategory" @toggle-all="toggleAllProducts"/>

          <div class="row">
              <div class="col-9 d-flex flex-wrap">
                  <product-card
                          v-for="product in productsShown" :key="product.id"
                          v-bind="{product}" @toggle="toggleProductSelection" :class="$style.card"/>
              </div>
              <div class="col-3">
                  <div class="d-flex justify-content-end align-items-center">
                  <span v-show="selectedProductsCount" class="text-secondary small text-nowrap me-3">
                      Выбрано товаров: {{ selectedProductsCount }}
                  </span>

                      <button type="button" class="btn bg-white border-primary p-3" @click="deleteSelected">
                          <i class="bi-trash-fill text-primary" :class="$style.icon"></i>
                      </button>
                  </div>
              </div>
          </div>
      </div>
  </main>
</template>

<style module>
.card {
    flex-basis: calc(33.33% - 20px);
}
.sortLink {
    text-decoration-style: dotted;
}
.icon {
    display: block;
    width: 24px;
    height: 24px;
    font-size: 20px;
}
</style>

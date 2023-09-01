<script setup lang="ts">
import {useRequests} from "@/composable/useRequests";
import {computed, ref} from "vue";
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

const {fetch} = useRequests();

const products = ref<Product[]>([]);
const selectedProductsIds = ref<number[]>([]);
const categories = ref<Category[]>([]);
const selectedCategory = ref<Category>(defaultCategory);
const selectedSort = ref(SORT_FILTERS[0]);

const filteredProducts = computed<Category[]>(() => {
    let sorted: Product[] = [];
    switch (selectedSort.value.id) {
        case 'date':
            sorted = sortByDate(); break;
        case 'priceAsc':
            sorted = sortByPriceAsc(products.value); break;
        case 'priceDesc':
            sorted = sortByPriceDesc(products.value); break;
    }
    const filtered = filterProductsByCategory(sorted, selectedCategory.value);
    return filtered;
});

fetch().then((res) => {
    products.value = res.data.data.products;
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
    console.log(categories.value)
    categories.value.unshift(defaultCategory);
})


const toggleProductSelection = (id:number) => {
    if (selectedProductsIds.value.includes(id)) {
        const index = selectedProductsIds.value.indexOf(id);
        selectedProductsIds.value.splice(index, 1);
    } else {
        selectedProductsIds.value.push(id);
    }
};

const deleteSelected = () => {
    for (let id of selectedProductsIds.value) {
        const index = products.value.findIndex(p => p.id === id);
        if (index > -1) products.value.splice(index, 1);
    }
    selectedProductsIds.value = [];
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
}

const selectAllProducts = ()=>{
    selectedProductsIds.value = filteredProducts.value.map(p=>p.id);
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
}

</script>

<template>
  <main>
      <div>
          <a v-for="filter in SORT_FILTERS" :key="filter.name"
             class="link-info"
             @click.prevent="()=>onSortChanged(filter)">{{filter.name}}</a>

          <category-filter v-bind="{categories}" @select="onSelectCategory" @select-all="selectAllProducts"/>
      </div>

      <div><button @click="deleteSelected">delete</button></div>
      <div>
          <product-card
                  v-for="product in filteredProducts" :key="product.id"
                  v-bind="{product}" @toggle="toggleProductSelection"/>
      </div>
  </main>
</template>

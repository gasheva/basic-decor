import { ref } from 'vue'
import type { Product } from '@/interfaces/Product'
import { ALL_CATEGORIES_ID } from '@/consts'
import type { SortCriteria } from '@/components/sortFilter/interfaces/SortCriteria'
import { sortProductsByPrice } from '@/utils/sort'
import type { Category } from '@/interfaces/Category'

export default function useProducts(productsInitial: Product[]) {
  const products = ref<Product[]>(productsInitial)
  const displayedProducts = ref<Product[]>([])

  const sortByDate = () => [...products.value]

  const filterProductsBySelectedCategory = (prodList: Product[], selectedCategory: Category) => {
    if (selectedCategory.id === ALL_CATEGORIES_ID) return prodList

    return prodList.filter(
      (p) =>
        p.categories.includes(selectedCategory.id) ||
        selectedCategory.children?.some((c: Category) => p.categories.includes(c.id))
    )
  }

  const updateDisplayedProducts = (
    selectedSortCriteria: SortCriteria,
    selectedCategory: Category
  ) => {
    let sortedProducts: Product[] = []
    switch (selectedSortCriteria.id) {
      case 'date':
        sortedProducts = sortByDate()
        break
      case 'priceAsc':
        sortedProducts = sortProductsByPrice(products.value)
        break
      case 'priceDesc':
        sortedProducts = sortProductsByPrice(products.value, false)
        break
    }
    displayedProducts.value = filterProductsBySelectedCategory(sortedProducts, selectedCategory)
  }

  const toggleProductStatus = (productId: number) => {
    const idx = displayedProducts.value.findIndex((product) => product.id === productId)
    if (idx === -1) return

    displayedProducts.value[idx].selected = !displayedProducts.value[idx].selected
  }

  const toggleAllProducts = (isSelected: boolean) => {
    displayedProducts.value = displayedProducts.value.map((product) => ({
      ...product,
      selected: isSelected
    }))
  }

  return {
    products,
    displayedProducts,
    toggleProductStatus,
    toggleAllProducts,
    updateDisplayedProducts
  }
}

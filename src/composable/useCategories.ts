import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Category } from '@/interfaces/Category'
import { ALL_CATEGORIES_ID } from '@/consts'
import { defaultCategory } from '@/components/categoryFilter/consts'
import type { Product } from '@/interfaces/Product'

export default function useCategories() {
  const router = useRouter()
  const route = useRoute()

  const categories = ref<Category[]>([])
  const selectedCategory = ref<Category>(defaultCategory)

  const getCategoryFromRouter = () => {
    if (route.name === 'home') return defaultCategory

    const id = Number(route.params.id)
    if (!id || isNaN(id)) return defaultCategory

    let categoryRoute = null
    for (const category of categories.value) {
      if (category.id === id) {
        categoryRoute = category
        break
      }
      if (category.children) {
        for (const child of category.children) {
          if (child.id === id) {
            categoryRoute = child
            break
          }
        }
      }
    }
    console.log(categoryRoute)
    return categoryRoute
  }

  const enrichCategoriesWithProductCounts = (products: Product[]) => {
    categories.value = categories.value.map((category) => {
      let childCategoriesWithCounts: Category[] = []
      if (category.children) {
        childCategoriesWithCounts = category.children.map((child) => {
          const associatedProductsCount = products.filter((product) =>
            product.categories.includes(child.id)
          ).length
          return { ...child, productsCount: associatedProductsCount }
        })
      }
      return { ...category, children: childCategoriesWithCounts }
    })
  }

  const setCategoryFilter = (category: Category) => {
    selectedCategory.value = category
    const routeName = category.id === ALL_CATEGORIES_ID ? 'home' : 'selectedCategory'
    router.push({ name: routeName, params: { id: category.id.toString() } }).catch(() => {})
  }

  return {
    categories,
    selectedCategory,
    getCategoryFromRouter,
    enrichCategoriesWithProductCounts,
    setCategoryFilter
  }
}

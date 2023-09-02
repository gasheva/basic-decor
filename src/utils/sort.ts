import type { Product } from '@/interfaces/Product'

export const sortProductsByPrice = (products: Product[], ascending: boolean = true) => {
  return [...products].sort((a, b) => (ascending ? a.price - b.price : b.price - a.price))
}

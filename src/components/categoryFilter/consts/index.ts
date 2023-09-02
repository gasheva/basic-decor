import type { Category } from '@/interfaces/Category'
import { ALL_CATEGORIES_ID } from '@/consts'

export const defaultCategory: Category = Object.freeze({
  id: ALL_CATEGORIES_ID,
  name: 'Все товары'
})

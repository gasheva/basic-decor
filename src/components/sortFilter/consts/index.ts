import type { SortCriteria } from '@/components/sortFilter/interfaces/SortCriteria'

export const SORT_CRITERIA_LIST: SortCriteria[] = [
  { id: 'date', name: 'По дате добавления' },
  { id: 'priceAsc', name: 'От дешевых к дорогим' },
  { id: 'priceDesc', name: 'От дорогих к дешевым' }
]

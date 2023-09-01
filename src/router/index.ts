import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      // children: [
      //   {
      //     path: '/category/:id',
      //     name: 'selectedCategory',
      //     component: HomeView,
      //   }
      // ]
    },
  ]
})

export default router
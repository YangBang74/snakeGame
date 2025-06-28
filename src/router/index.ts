import { createRouter, createWebHistory } from 'vue-router'
import GamePage from '../views/game/GamePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'game',
      component: GamePage,
    },
  ],
})

export default router

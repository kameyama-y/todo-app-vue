import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import TodoList from '../components/TodoList.vue'

const routes = [
  { path: '/', component: LoginForm },
  { path: '/todo', component: TodoList },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

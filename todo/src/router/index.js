import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import TodoList from '../components/TodoList.vue'
import RegisterPage from "../components/RegisterPage.vue"

const routes = [
  { path: '/login', component: LoginForm },
  { path: '/todo', component: TodoList },
  { path: '/register', component: RegisterPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

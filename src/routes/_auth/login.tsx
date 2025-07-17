import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/features/authentication/pages/LoginPage'

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})
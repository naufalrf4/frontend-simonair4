import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordPage } from '@/features/authentication/pages/ForgotPasswordPage'

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordPage,
})

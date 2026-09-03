import { Routes, Route, Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Login from "./features/auth/Login"
import Register from "./features/auth/Register"
import VerifyEmail from "./features/auth/VerifyEmail"
import ForgotPassword from "./features/auth/ForgotPassword"
import ResetPassword from "./features/auth/ResetPassword"
import ForgotUsername from "./features/auth/ForgotUsername"
import Dashboard from "./features/dashboard/Dashboard"
import Clients from "./features/clients/Clients"
import ClientDetail from "./features/clients/ClientDetail"
import Projects from "./features/projects/Projects"
import ProjectDetail from "./features/projects/ProjectDetail"
import Board from "./features/board/Board"
import Invoices from "./features/invoices/Invoices"
import InvoiceDetail from "./features/invoices/InvoiceDetail"
import Documents from "./features/documents/Documents"
import Subscribe from "./features/billing/Subscribe"
import TwoFactor from "./features/auth/TwoFactor"
import Planner from "./features/ai/Planner"
import WeeklySummary from "./features/ai/WeeklySummary"
import ChatWithDocs from "./features/ai/ChatWithDocs"
import TaskDetail from "./features/tasks/TaskDetail"
import Team from "./features/team/Team"
import Notifications from "./features/notifications/Notifications"
import Settings from "./features/settings/Settings"
import ThemeSettings from "./features/settings/ThemeSettings"
import ClientPortal from "./features/portal/ClientPortal"
import Calendar from "./features/calendar/Calendar"
import Layout from "./components/Layout"
import ErrorBoundary from "./components/ErrorBoundary"

function Protected({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("access")
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { i18n } = useTranslation()
  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-username" element={<ForgotUsername />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/board" element={<ErrorBoundary><Board /></ErrorBoundary>} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="team" element={<Team />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/theme" element={<ThemeSettings />} />
        <Route path="documents" element={<Documents />} />
        <Route path="billing/subscribe" element={<Subscribe />} />
        <Route path="settings/2fa" element={<TwoFactor />} />
        <Route path="portal" element={<ClientPortal />} />
        <Route path="calendar" element={<ErrorBoundary><Calendar /></ErrorBoundary>} />
        <Route path="ai/planner" element={<Planner />} />
        <Route path="ai/summary" element={<WeeklySummary />} />
        <Route path="ai/chat" element={<ChatWithDocs />} />
      </Route>
    </Routes>
    </ErrorBoundary>
  )
}

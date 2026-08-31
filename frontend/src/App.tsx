import { Routes, Route, Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Login from "./features/auth/Login"
import Register from "./features/auth/Register"
import Dashboard from "./features/dashboard/Dashboard"
import Clients from "./features/clients/Clients"
import Projects from "./features/projects/Projects"
import ProjectDetail from "./features/projects/ProjectDetail"
import Board from "./features/board/Board"
import Invoices from "./features/invoices/Invoices"
import Planner from "./features/ai/Planner"
import WeeklySummary from "./features/ai/WeeklySummary"
import Layout from "./components/Layout"

function Protected({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("access")
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { i18n } = useTranslation()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/board" element={<Board />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="ai/planner" element={<Planner />} />
        <Route path="ai/summary" element={<WeeklySummary />} />
      </Route>
    </Routes>
  )
}

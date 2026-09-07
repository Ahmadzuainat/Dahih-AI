import { useContext } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/auth.js'

export default function AppLayout() {
  const { logout } = useContext(AuthContext)
  return (
    <div className="mx-auto max-w-5xl p-6">
      <nav aria-label="Main navigation" className="mb-8 flex flex-wrap gap-5">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/document">Documents</NavLink>
        <NavLink to="/flashcards">Flashcards</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <button type="button" onClick={logout}>Sign out</button>
      </nav>
      <main><Outlet /></main>
    </div>
  )
}

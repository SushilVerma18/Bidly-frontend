import { Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/Home'
import Auctions from './pages/Auctions'
import AuctionDetails from './pages/AuctionDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'

import Dashboard from './pages/Dashboard'
import CreateAuction from './pages/CreateAuction'
import Watchlist from './pages/Watchlist'
import MyAuctions from './pages/MyAuctions'
import MyBids from './pages/MyBids'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAuctions from './pages/admin/AdminAuctions'
import PaymentHistory from './pages/PaymentHistory'

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/auctions" element={<Auctions />} />
      <Route path="/auctions/:id" element={<AuctionDetails />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Email Verification */}
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route path="/sell" element={<CreateAuction />} />
      <Route path="/my-auctions" element={<MyAuctions />} />
      <Route path="/my-bids" element={<MyBids />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile" element={<Profile />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/auctions" element={<AdminAuctions />} />

      <Route
  path="/payments"
  element={<PaymentHistory />}
/>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  )
}
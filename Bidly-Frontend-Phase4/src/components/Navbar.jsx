import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Heart,
  UserRound,
  ChevronDown,
  LogIn,
  UserPlus,
  ShieldCheck,
  LayoutDashboard,
  User,
  LogOut
} from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const token = localStorage.getItem('accessToken')
  const isLoggedIn = !!token

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('auctionUser')

    setOpen(false)
    navigate('/')
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fafaf7]/95 backdrop-blur">
      <nav className="mx-auto flex h-[82px] max-w-[1320px] items-center justify-between px-5 lg:px-8">

        {/* Logo */}
        <Link
          to="/"
          className="font-display text-3xl font-extrabold tracking-[-0.07em]"
        >
          bidly<span className="text-[#ff42ad]">.</span>
        </Link>

        {/* Center Navigation */}
        <div className="hidden items-center gap-10 md:flex">

          <Link
            to="/auctions"
            className="text-sm font-semibold text-black/55 transition hover:text-black"
          >
            Auctions
          </Link>

          <Link
            to="/#how-it-works"
            className="text-sm font-semibold text-black/55 transition hover:text-black"
          >
            How it works
          </Link>

          <Link
            to="/sell"
            className="text-sm font-semibold text-black/55 transition hover:text-black"
          >
            Sell
          </Link>

        </div>

        {/* Right */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <button
            onClick={() => navigate('/auctions')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition hover:bg-black hover:text-white"
          >
            <Search size={19} />
          </button>

          {/* Watchlist */}
          <button
            onClick={() => navigate('/watchlist')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition hover:bg-black hover:text-white"
          >
            <Heart size={18} />
          </button>

          {/* USER DROPDOWN */}
          <div className="relative">

            <button
              onClick={() => setOpen(!open)}
              className="flex h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-4 transition hover:bg-black hover:text-white"
            >
              <UserRound size={18} />

              <ChevronDown
                size={15}
                className={`transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>

            {open && (
              <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-xl">

                {!isLoggedIn ? (
                  <>
                    {/* LOGIN */}
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-black/5"
                    >
                      <LogIn size={17} />
                      Login
                    </Link>

                    {/* REGISTER */}
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-black/5"
                    >
                      <UserPlus size={17} />
                      Register
                    </Link>

                    <div className="my-1 border-t border-black/5" />

                    {/* ADMIN LOGIN */}
                    <Link
                      to="/admin/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#ff42ad] transition hover:bg-[#ff42ad]/5"
                    >
                      <ShieldCheck size={17} />
                      Admin Login
                    </Link>
                  </>
                ) : (
                  <>
                    {/* DASHBOARD */}
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-black/5"
                    >
                      <LayoutDashboard size={17} />
                      Dashboard
                    </Link>

                    {/* PROFILE */}
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition hover:bg-black/5"
                    >
                      <User size={17} />
                      Profile
                    </Link>

                    <div className="my-1 border-t border-black/5" />

                    {/* LOGOUT */}
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </>
                )}

              </div>
            )}

          </div>

        </div>
      </nav>
    </header>
  )
}
import {
  ArrowUpRight,
  Bell,
  Heart,
  Package,
  Plus,
  TrendingUp,
  Trophy,
  Wallet,
  CreditCard,
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuctionCard from '../components/AuctionCard'

import { auctionApi, paymentApi, watchlistApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  const [auctions, setAuctions] = useState([])
  const [payments, setPayments] = useState([])
  const [watchlist, setWatchlist] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)

      const [auctionResponse, paymentResponse, watchlistResponse] =
        await Promise.allSettled([
          auctionApi.list({
            page: 0,
            size: 100,
            sort: 'createdAt,desc',
          }),

          paymentApi.history({
            page: 0,
            size: 100,
            sort: 'createdAt,desc',
          }),

          watchlistApi.list(),
        ])

      /*
       * AUCTIONS
       */

      if (auctionResponse.status === 'fulfilled') {
        const data = auctionResponse.value.data.data

        setAuctions(
          data?.content ||
          data ||
          []
        )
      }

      /*
       * PAYMENTS
       */

      if (paymentResponse.status === 'fulfilled') {
        const data = paymentResponse.value.data.data

        setPayments(
          data?.content ||
          data ||
          []
        )
      }

      /*
       * WATCHLIST
       */

      if (watchlistResponse.status === 'fulfilled') {
        const data = watchlistResponse.value.data.data

        setWatchlist(
          data?.content ||
          data ||
          []
        )
      }

    } catch (error) {
      console.error(
        'Failed to load dashboard:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  /*
   * ---------------------------------------------------------
   * WON AUCTIONS
   * ---------------------------------------------------------
   */

  const currentUserId =
    user?.id ||
    user?.userId ||
    user?.user?.id

  const wonAuctions = auctions.filter(auction => {
    return (
      auction.status === 'ENDED' &&
      auction.currentHighestBidderId != null &&
      Number(auction.currentHighestBidderId) ===
        Number(currentUserId) &&
      auction.reserveMet !== false
    )
  })

  /*
   * ---------------------------------------------------------
   * PAYMENTS
   * ---------------------------------------------------------
   */

  const successfulPayments = payments.filter(
    payment =>
      payment.status === 'SUCCESS'
  )

  const pendingPayments = payments.filter(
    payment =>
      payment.status === 'PENDING'
  )

  /*
   * ---------------------------------------------------------
   * ACTIVE AUCTIONS / BIDS
   *
   * Backend currently does not provide
   * a "my bids" endpoint.
   *
   * So we don't fake the number.
   * ---------------------------------------------------------
   */

  const activeAuctions = auctions.filter(
    auction =>
      auction.status === 'LIVE'
  )

  /*
   * ---------------------------------------------------------
   * BALANCE
   * ---------------------------------------------------------
   *
   * There is currently no wallet/balance API
   * in the supplied backend.
   *
   * So don't show fake ₹42,800.
   */

  const stats = [
    [
      TrendingUp,
      'Active auctions',
      activeAuctions.length,
    ],
    [
      Trophy,
      'Won auctions',
      wonAuctions.length,
    ],
    [
      Heart,
      'Watchlist',
      watchlist.length,
    ],
    [
      Wallet,
      'Successful payments',
      successfulPayments.length,
    ],
  ]

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="mx-auto max-w-[1320px] px-5 py-32 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/10 border-t-black" />

          <p className="mt-4 text-sm text-black/40">
            Loading your dashboard...
          </p>
        </main>

        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8 lg:py-14">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#ff42ad]">
              Your space
            </p>

            <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-.07em] md:text-7xl">
              Good afternoon.
            </h1>

            <p className="mt-3 text-sm text-black/45">
              Track your bids, wins and payments from one place.
            </p>

          </div>

         <div className="flex gap-3">
  <Link
    to="/my-bids"
    className="flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-6 text-sm font-bold"
  >
    My Bids
    <ArrowUpRight size={15} />
  </Link>

  <Link
    to="/sell"
    className="flex h-12 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white"
  >
    <Plus size={16} />
    Create auction
  </Link>
</div>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {stats.map(
            ([Icon, label, value]) => (

              <div
                key={label}
                className="rounded-[28px] bg-white p-6 shadow-card"
              >

                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f5f5f1]">
                  <Icon size={18} />
                </div>

                <p className="mt-7 text-xs text-black/40">
                  {label}
                </p>

                <p className="mt-1 font-display text-3xl font-extrabold tracking-[-.06em]">
                  {value}
                </p>

              </div>

            )
          )}

        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.35fr_.65fr]">

          {/* =================================================
              WON AUCTIONS
          ================================================= */}

          <section>

            <div className="flex items-end justify-between">

              <div>

                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#ff42ad]">
                  Your activity
                </p>

                <h2 className="mt-2 font-display text-3xl font-extrabold tracking-[-.05em]">
                  Won auctions
                </h2>

              </div>

              <Link
                to="/auctions"
                className="text-xs font-bold"
              >
                Explore more{' '}
                <ArrowUpRight
                  size={13}
                  className="inline"
                />
              </Link>

            </div>

            {wonAuctions.length > 0 ? (

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                {wonAuctions.map(
                  (auction, index) => (

                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      index={index}
                    />

                  )
                )}

              </div>

            ) : (

              <div className="mt-6 rounded-[28px] bg-white p-10 text-center shadow-card">

                <Trophy
                  size={30}
                  className="mx-auto text-black/20"
                />

                <p className="mt-4 font-bold">
                  No won auctions yet
                </p>

                <p className="mt-2 text-sm text-black/40">
                  Win an auction and it will appear here.
                </p>

                <Link
                  to="/auctions"
                  className="mt-5 inline-flex h-11 items-center rounded-full bg-black px-6 text-xs font-bold text-white"
                >
                  Browse auctions
                </Link>

              </div>

            )}

          </section>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <aside className="space-y-4">

            {/* PAYMENT SUMMARY */}

            <div className="rounded-[30px] bg-black p-7 text-white">

              <div className="flex items-center gap-3">

                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f46a] text-black">
                  <CreditCard size={17} />
                </div>

                <div>

                  <p className="font-bold">
                    Payments
                  </p>

                  <p className="text-xs text-white/45">
                    Your payment activity.
                  </p>

                </div>

              </div>

              <div className="mt-7 space-y-4 border-t border-white/10 pt-5">

                <div className="flex justify-between">

                  <span className="text-xs text-white/45">
                    Successful
                  </span>

                  <strong className="text-sm">
                    {successfulPayments.length}
                  </strong>

                </div>

                <div className="flex justify-between">

                  <span className="text-xs text-white/45">
                    Pending
                  </span>

                  <strong className="text-sm">
                    {pendingPayments.length}
                  </strong>

                </div>

              </div>

              <Link
                to="/payments"
                className="mt-6 flex h-11 items-center justify-center rounded-full bg-white text-xs font-bold text-black"
              >
                View payment history
              </Link>

            </div>

            {/* SELL */}

            <div className="rounded-[30px] bg-[#e8f46a] p-7">

              <Package size={20} />

              <h3 className="mt-12 font-display text-2xl font-extrabold tracking-[-.05em]">
                Ready to sell?
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/50">
                List something unique and let the marketplace decide its value.
              </p>

              <Link
                to="/sell"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold"
              >
                Create listing
                <ArrowUpRight size={15} />
              </Link>

            </div>

          </aside>

        </div>

      </main>

      <Footer />
    </>
  )
}
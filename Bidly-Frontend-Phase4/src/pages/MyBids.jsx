import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Trophy,
  TrendingUp,
  Clock3,
} from 'lucide-react'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { auctionApi } from '../services/api'

function money(value) {
  if (value == null) return '—'

  return `₹${Number(value).toLocaleString('en-IN')}`
}

export default function MyBids() {

  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

    const loadMyBids = async () => {

      try {

        setLoading(true)
        setError('')

        const response = await auctionApi.myBids({
          page: 0,
          size: 20,
          sort: 'createdAt,desc',
        })

        setBids(
          response.data.data?.content || []
        )

      } catch (err) {

        console.error('Failed to load my bids:', err)

        setError(
          err.response?.data?.message ||
          'Unable to load your bids.'
        )

      } finally {

        setLoading(false)

      }
    }

    loadMyBids()

  }, [])

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 py-12 lg:py-16">

        {/* HEADER */}

        <div className="rounded-[32px] bg-[#e8f46a] p-8 md:p-12">

          <p className="text-[11px] font-bold uppercase tracking-[.2em]">
            Bid history
          </p>

          <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-.07em] md:text-6xl">
            Your bids.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">
            Track all the bids you have placed across Bidly auctions.
          </p>

        </div>


        {/* CONTENT */}

        <div className="mt-8">

          {loading && (
            <div className="rounded-[28px] bg-white p-10 text-center shadow-card">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black" />

              <p className="mt-4 text-sm text-black/40">
                Loading your bids...
              </p>

            </div>
          )}


          {!loading && error && (
            <div className="rounded-[28px] bg-[#ffecec] p-6 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}


          {!loading && !error && bids.length === 0 && (
            <div className="rounded-[28px] bg-white p-12 text-center shadow-card">

              <TrendingUp
                size={32}
                className="mx-auto text-black/20"
              />

              <h2 className="mt-4 font-display text-2xl font-extrabold">
                No bids yet
              </h2>

              <p className="mt-2 text-sm text-black/40">
                You haven't placed any bids yet.
              </p>

              <Link
                to="/auctions"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white"
              >
                Browse auctions
                <ArrowUpRight size={15} />
              </Link>

            </div>
          )}


          {!loading && !error && bids.length > 0 && (

            <div className="rounded-[28px] bg-white px-6 shadow-card">

              <div className="border-b border-black/5 py-5">

                <h2 className="font-display text-2xl font-extrabold">
                  Your bidding activity
                </h2>

                <p className="mt-1 text-xs text-black/40">
                  {bids.length} bid{bids.length !== 1 ? 's' : ''} found
                </p>

              </div>


              {bids.map((bid) => (

                <div
                  key={bid.id}
                  className="flex flex-col gap-4 border-b border-black/5 py-5 last:border-0 md:flex-row md:items-center md:justify-between"
                >

                  <div className="flex items-center gap-4">

                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f2f2ed]">

                      <Trophy size={18} />

                    </div>

                    <div>

                      <p className="font-semibold">
                        Bid #{bid.id}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-black/40">

                        <Clock3 size={12} />

                        {bid.createdAt
                          ? new Date(
                              bid.createdAt
                            ).toLocaleString()
                          : 'Date unavailable'
                        }

                      </p>

                    </div>

                  </div>


                  <div className="text-left md:text-right">

                    <p className="text-[10px] font-bold uppercase tracking-[.15em] text-black/35">
                      Your bid
                    </p>

                    <p className="mt-1 font-display text-2xl font-extrabold">
                      {money(bid.amount)}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

      <Footer />
    </>
  )
}
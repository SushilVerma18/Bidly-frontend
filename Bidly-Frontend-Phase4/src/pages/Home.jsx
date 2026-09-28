import {
  ArrowRight,
  Play,
  Sparkles,
  Timer,
  Trophy,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuctionCard from '../components/AuctionCard'

import { auctionApi, categoryApi } from '../services/api'

export default function Home() {
  const [auctions, setAuctions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true)

        const [auctionResponse, categoryResponse] = await Promise.all([
          auctionApi.list({
            page: 0,
            size: 6,
            sort: 'startDate,asc',
          }),
          categoryApi.list(),
        ])

        // Auctions
        const auctionData = auctionResponse?.data?.data

        if (auctionData?.content) {
          setAuctions(auctionData.content)
        } else if (Array.isArray(auctionData)) {
          setAuctions(auctionData)
        } else {
          setAuctions([])
        }

        // Categories
        const categoryData = categoryResponse?.data?.data

        if (Array.isArray(categoryData)) {
          setCategories(categoryData)
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error('Failed to load home data:', error)

        setAuctions([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  const live = auctions.filter(
    (auction) => auction.status === 'LIVE'
  )

  return (
    <>
      <Navbar />

      <main className="overflow-hidden">

        {/* ================= HERO ================= */}
        <section className="mx-auto max-w-[1320px] px-5 pb-16 pt-12 lg:px-8 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">

            {/* Hero Content */}
            <div>
              <p className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.2em] text-[#ff42ad]">
                <Sparkles size={14} />
                The live auction marketplace
              </p>

              <h1 className="font-display text-[clamp(3.5rem,7vw,7rem)] font-extrabold leading-[.9] tracking-[-.075em]">
                Bid on what{' '}
                <span className="text-[#ff42ad]">matters.</span>
              </h1>

              <p className="mt-7 max-w-[510px] text-base leading-7 text-black/55">
                Discover rare pieces, compete in real time, and win
                something worth keeping. Every bid moves the story forward.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auctions"
                  className="group flex h-12 items-center gap-3 rounded-full bg-black px-6 text-sm font-bold text-white"
                >
                  Explore auctions

                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>

                <a
                  href="#how-it-works"
                  className="flex h-12 items-center gap-2 rounded-full border border-black/10 bg-white px-6 text-sm font-bold"
                >
                  How it works
                  <Play size={14} />
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-7 text-xs text-black/45">
                <span className="flex items-center gap-2">
                  <Timer size={15} />
                  Live countdowns
                </span>

                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} />
                  Secure bidding
                </span>

                <span className="flex items-center gap-2">
                  <Trophy size={15} />
                  Auto-bid ready
                </span>
              </div>
            </div>

            {/* Hero Images */}
            <div className="relative min-h-[480px] lg:min-h-[610px]">

              <div className="absolute right-0 top-0 h-[78%] w-[72%] overflow-hidden rounded-[38px] bg-[#f0efea]">
                <img
                  src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=1200&q=90"
                  alt="Auction artwork"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute bottom-0 left-[3%] h-[62%] w-[57%] overflow-hidden rounded-[34px] border-[10px] border-[#fbfbf7] bg-[#f2b0d7] shadow-soft">
                <img
                  src="https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=90"
                  alt="Artwork"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute right-[4%] top-[45%] rounded-3xl bg-white p-5 shadow-soft">
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-black/40">
                  Live now
                </p>

                <p className="mt-1 font-display text-2xl font-extrabold tracking-[-.05em]">
                  ₹82,500
                </p>

                <div className="mt-2 flex items-center gap-2 text-[11px] text-black/45">
                  <span className="h-2 w-2 rounded-full bg-[#ff42ad]" />
                  Live auction
                </div>
              </div>

              <div className="absolute left-0 top-[18%] rounded-full bg-[#ff42ad] px-4 py-2 text-xs font-bold text-white shadow-soft">
                @bidly_live
              </div>
            </div>
          </div>
        </section>

        {/* ================= LIVE AUCTIONS ================= */}
        <section className="mx-auto max-w-[1320px] px-5 py-14 lg:px-8">

          <div className="flex items-end justify-between gap-5">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#ff42ad]">
                Happening now
              </p>

              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-.06em] md:text-5xl">
                Live auctions.
              </h2>
            </div>

            <Link
              to="/auctions"
              className="hidden items-center gap-2 text-sm font-bold md:flex"
            >
              View all
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Auction Cards */}
          <div className="mt-8 grid gap-5 md:grid-cols-2">

            {loading ? (
              <>
                <div className="h-[350px] animate-pulse rounded-[28px] bg-black/5" />
                <div className="h-[350px] animate-pulse rounded-[28px] bg-black/5" />
              </>
            ) : live.length > 0 ? (
              live.map((auction, index) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  index={index}
                  featured={index === 0}
                />
              ))
            ) : (
              <div className="rounded-[28px] bg-white p-10 text-center shadow-card md:col-span-2">
                <h3 className="font-display text-2xl font-extrabold">
                  No live auctions right now
                </h3>

                <p className="mt-2 text-sm text-black/50">
                  Check the marketplace for scheduled auctions.
                </p>

                <Link
                  to="/auctions"
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white"
                >
                  Browse auctions
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}

          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section
          id="how-it-works"
          className="mx-auto max-w-[1320px] px-5 py-24 lg:px-8"
        >
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#ff42ad]">
                How it works
              </p>

              <h2 className="mt-3 font-display text-5xl font-extrabold leading-[.95] tracking-[-.07em]">
                Every bid
                <br />
                tells a story.
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">

              {[
                [
                  '01',
                  'Discover',
                  'Browse live, scheduled and ending-soon auctions.',
                ],
                [
                  '02',
                  'Compete',
                  'Place a bid or let auto-bid compete for you.',
                ],
                [
                  '03',
                  'Win',
                  'Get notified when you win and complete payment.',
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="rounded-[28px] bg-white p-7 shadow-card"
                >
                  <span className="text-xs font-bold text-[#ff42ad]">
                    {number}
                  </span>

                  <h3 className="mt-16 font-display text-2xl font-extrabold tracking-[-.05em]">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-black/50">
                    {description}
                  </p>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* ================= CATEGORIES ================= */}
        <section className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8">

          <div className="rounded-[34px] bg-[#e8f46a] px-7 py-10 md:px-12 md:py-14">

            <p className="text-[11px] font-bold uppercase tracking-[.2em]">
              Find your next obsession
            </p>

            <div className="mt-5 flex flex-col justify-between gap-8 md:flex-row md:items-end">

              <h2 className="max-w-2xl font-display text-5xl font-extrabold leading-[.95] tracking-[-.07em] md:text-6xl">
                From art to watches, there’s always another bid.
              </h2>

              <Link
                to="/auctions"
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white"
              >
                Browse marketplace
                <ArrowRight size={15} />
              </Link>

            </div>

            {/* Categories */}
            <div className="no-scrollbar mt-10 flex gap-3 overflow-x-auto">

              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/auctions?category=${category.id}`}
                    className="shrink-0 rounded-full bg-white/80 px-5 py-3 text-sm font-semibold transition hover:bg-white"
                  >
                    {category.name}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-black/50">
                  No categories available.
                </p>
              )}

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
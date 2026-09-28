import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuctionCard from '../components/AuctionCard'
import { auctionApi, categoryApi } from '../services/api'

export default function Auctions() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')

  // Load auctions
  const load = async () => {
    try {
      setLoading(true)

      const params = {
        page: 0,
        size: 12,
        sort: 'startDate,asc',
      }

      if (keyword.trim()) {
        params.keyword = keyword.trim()
      }

      if (status) {
        params.status = status
      }

      if (categoryId) {
        params.categoryId = categoryId
      }

      const response = await auctionApi.search(params)

      const data = response?.data?.data

      if (data?.content) {
        setItems(data.content)
      } else if (Array.isArray(data)) {
        setItems(data)
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Failed to load auctions:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await categoryApi.list()

      const data = response?.data?.data

      if (Array.isArray(data)) {
        setCategories(data)
      } else if (data?.content && Array.isArray(data.content)) {
        setCategories(data.content)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategories([])
    }
  }

  useEffect(() => {
    loadCategories()
    load()
  }, [])

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value)
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
  }

  const handleClear = () => {
    setKeyword('')
    setStatus('')
    setCategoryId('')

    setTimeout(() => {
      load()
    }, 0)
  }

  const handleSearch = () => {
    load()
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8 lg:py-16">

        {/* Header */}
        <div className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#ff42ad]">
            The marketplace
          </p>

          <h1 className="mt-3 font-display text-6xl font-extrabold leading-[.9] tracking-[-.075em] md:text-8xl">
            Find something
            <br />
            <span className="text-black/30">
              worth bidding on.
            </span>
          </h1>
        </div>

        {/* Filters */}
        <div className="mt-12 flex flex-col gap-3 rounded-[28px] bg-white p-3 shadow-card md:flex-row">

          {/* Search */}
          <div className="flex h-12 flex-1 items-center gap-3 rounded-full bg-[#f5f5f1] px-5">
            <Search
              size={17}
              className="shrink-0 text-black/35"
            />

            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              placeholder="Search auctions..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* Category */}
          <select
            value={categoryId}
            onChange={handleCategoryChange}
            className="h-12 rounded-full bg-[#f5f5f1] px-5 text-sm font-semibold outline-none"
          >
            <option value="">
              All categories
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={handleStatusChange}
            className="h-12 rounded-full bg-[#f5f5f1] px-5 text-sm font-semibold outline-none"
          >
            <option value="">
              All status
            </option>

            <option value="LIVE">
              Live
            </option>

            <option value="SCHEDULED">
              Upcoming
            </option>
          </select>

          {/* Filter button */}
          <button
            onClick={handleSearch}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-bold text-white"
          >
            <SlidersHorizontal size={15} />
            Filter
          </button>
        </div>

        {/* Results header */}
        <div className="mt-12 flex items-center justify-between">

          <p className="text-sm text-black/45">
            {loading
              ? 'Loading auctions…'
              : `${items.length} auctions found`}
          </p>

          {(keyword || status || categoryId) && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs font-bold"
            >
              Clear
              <X size={13} />
            </button>
          )}
        </div>

        {/* Auction Grid */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {loading ? (
            [1, 2, 3, 4, 5, 6].map((x) => (
              <div
                key={x}
                className="aspect-[.88] animate-pulse rounded-[28px] bg-black/5"
              />
            ))
          ) : (
            items.map((auction, index) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                index={index}
              />
            ))
          )}

        </div>

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="rounded-[30px] bg-white py-24 text-center shadow-card">

            <h3 className="font-display text-3xl font-extrabold tracking-[-.05em]">
              No auctions found.
            </h3>

            <p className="mt-2 text-sm text-black/45">
              Try a different keyword or filter.
            </p>

          </div>
        )}

      </main>

      <Footer />
    </>
  )
}
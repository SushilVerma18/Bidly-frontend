import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { auctionApi } from '../services/api'
import { imageFor } from '../components/AuctionCard'

const tabs = ['All', 'LIVE', 'SCHEDULED', 'ENDED', 'DRAFT']

export default function MyAuctions() {
    const [items, setItems] = useState([])
    const [tab, setTab] = useState('All')
    const [error, setError] = useState('')

    const load = async () => {
        try {
            setError('')

            const r = await auctionApi.mine()

            setItems(r.data.data || [])
        } catch (e) {
            setError(
                e.response?.data?.message ||
                'Unable to load your auctions.'
            )
        }
    }

    useEffect(() => {
        load()
    }, [])

    const filtered =
        tab === 'All'
            ? items
            : items.filter(a => a.status === tab)

    const publish = async (id) => {
        try {
            await auctionApi.publish(id)
            await load()
        } catch (e) {
            setError(
                e.response?.data?.message ||
                'Unable to publish auction.'
            )
        }
    }

    const remove = async (id) => {
        if (!confirm('Delete this auction?')) return

        try {
            await auctionApi.remove(id)
            await load()
        } catch (e) {
            setError(
                e.response?.data?.message ||
                'Unable to delete auction.'
            )
        }
    }

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8 lg:py-16">

                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#ff42ad]">
                            Seller studio
                        </p>

                        <h1 className="mt-3 font-display text-6xl font-extrabold tracking-[-.07em]">
                            My auctions.
                        </h1>
                    </div>

                    <Link
                        to="/sell"
                        className="rounded-full bg-black px-6 py-3 text-sm font-bold text-white"
                    >
                        + Create auction
                    </Link>
                </div>

                <div className="mt-8 flex gap-2 overflow-auto">
                    {tabs.map(x => (
                        <button
                            key={x}
                            onClick={() => setTab(x)}
                            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold ${
                                tab === x
                                    ? 'bg-black text-white'
                                    : 'bg-white border border-black/10'
                            }`}
                        >
                            {x === 'All'
                                ? 'All'
                                : x[0] + x.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {error && (
                    <p className="mt-5 rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-600">
                        {error}
                    </p>
                )}

                <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((a, i) => (
                        <article
                            key={a.id}
                            className="overflow-hidden rounded-[28px] bg-white shadow-card"
                        >
                            <Link to={`/auctions/${a.id}`}>
                                <img
                                    src={imageFor(a, i)}
                                    className="aspect-[1.1] w-full object-cover"
                                />
                            </Link>

                            <div className="p-5">
                                <div className="flex items-center justify-between">
                                    <span className="rounded-full bg-[#f5f5f1] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em]">
                                        {a.status}
                                    </span>

                                    <strong>
                                        ₹
                                        {Number(
                                            a.currentHighestBid ??
                                            a.startingPrice ??
                                            0
                                        ).toLocaleString('en-IN')}
                                    </strong>
                                </div>

                                <h3 className="mt-4 font-display text-xl font-extrabold">
                                    {a.title}
                                </h3>

                                <p className="mt-1 text-xs text-black/40">
                                    {a.category?.name || 'Auction'} · ends{' '}
                                    {a.endDate
                                        ? new Date(a.endDate).toLocaleString()
                                        : '—'}
                                </p>

                                <div className="mt-5 flex gap-2">
                                    {a.status === 'DRAFT' && (
                                        <button
                                            onClick={() => publish(a.id)}
                                            className="flex-1 rounded-full bg-black py-2.5 text-xs font-bold text-white"
                                        >
                                            Publish
                                        </button>
                                    )}

                                    {(a.status === 'DRAFT' ||
                                        a.status === 'SCHEDULED') && (
                                        <button
                                            onClick={() => remove(a.id)}
                                            className="rounded-full border border-black/10 px-4 py-2.5 text-xs font-bold"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {!filtered.length && !error && (
                    <div className="mt-8 rounded-[30px] bg-white py-24 text-center shadow-card">
                        <h3 className="font-display text-3xl font-extrabold">
                            No auctions here.
                        </h3>

                        <p className="mt-2 text-sm text-black/40">
                            Create your first auction from Seller Studio.
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </>
    )
}
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  CreditCard,
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { paymentApi } from '../services/api'

function money(v) {
  return v == null
    ? '—'
    : `₹${Number(v).toLocaleString('en-IN')}`
}

function StatusIcon({ status }) {
  if (status === 'SUCCESS') {
    return (
      <CheckCircle2
        size={20}
        className="text-green-600"
      />
    )
  }

  if (status === 'PENDING') {
    return (
      <Clock3
        size={20}
        className="text-yellow-600"
      />
    )
  }

  if (status === 'FAILED') {
    return (
      <XCircle
        size={20}
        className="text-red-600"
      />
    )
  }

  if (status === 'REFUNDED') {
    return (
      <RotateCcw
        size={20}
        className="text-black/50"
      />
    )
  }

  return <CreditCard size={20} />
}

function statusClass(status) {
  switch (status) {
    case 'SUCCESS':
      return 'bg-[#e9f8e9] text-green-700'

    case 'PENDING':
      return 'bg-[#fff8df] text-yellow-700'

    case 'FAILED':
      return 'bg-[#ffecec] text-red-700'

    case 'REFUNDED':
      return 'bg-[#f2f2ed] text-black/60'

    default:
      return 'bg-black/5 text-black/60'
  }
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await paymentApi.history({
        page: 0,
        size: 50,
        sort: 'createdAt,desc',
      })

      const data = response.data.data

      setPayments(
        data?.content ||
        data ||
        []
      )

    } catch (err) {
      console.error(
        'Failed to load payment history:',
        err
      )

      setError(
        err.response?.data?.message ||
        'Unable to load payment history.'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8 lg:py-14">

        {/* BACK */}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        {/* HEADER */}

        <div className="mt-8">

          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#ff42ad]">
            Payments
          </p>

          <h1 className="mt-3 font-display text-5xl font-extrabold tracking-[-.07em] md:text-6xl">
            Payment history
          </h1>

          <p className="mt-3 text-sm text-black/45">
            Track all your auction payments and refunds.
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="py-24 text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/10 border-t-black" />

            <p className="mt-4 text-sm text-black/40">
              Loading payments...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="mt-10 rounded-[28px] bg-[#ffecec] p-6 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          payments.length === 0 && (

            <div className="mt-10 rounded-[30px] bg-white p-12 text-center shadow-card">

              <CreditCard
                size={36}
                className="mx-auto text-black/20"
              />

              <h2 className="mt-5 font-display text-2xl font-extrabold">
                No payments yet
              </h2>

              <p className="mt-2 text-sm text-black/40">
                Your auction payments will appear here.
              </p>

              <Link
                to="/auctions"
                className="mt-6 inline-flex h-11 items-center rounded-full bg-black px-6 text-xs font-bold text-white"
              >
                Browse auctions
              </Link>

            </div>

          )}

        {/* PAYMENTS */}

        {!loading &&
          !error &&
          payments.length > 0 && (

            <div className="mt-10 space-y-4">

              {payments.map(payment => (

                <div
                  key={payment.id}
                  className="rounded-[28px] bg-white p-6 shadow-card"
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    {/* LEFT */}

                    <div className="flex items-start gap-4">

                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f5f5f1]">
                        <StatusIcon
                          status={payment.status}
                        />
                      </div>

                      <div>

                        <p className="font-bold">
                          {payment.auctionTitle ||
                            `Auction #${payment.auctionId}`}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          Auction ID: #{payment.auctionId}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          Payment ID: #{payment.id}
                        </p>

                      </div>

                    </div>

                    {/* AMOUNT */}

                    <div className="md:text-right">

                      <p className="text-[10px] font-bold uppercase tracking-[.16em] text-black/35">
                        Amount
                      </p>

                      <p className="mt-1 font-display text-2xl font-extrabold">
                        {money(payment.amount)}
                      </p>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 grid gap-3 border-t border-black/5 pt-5 sm:grid-cols-2 lg:grid-cols-3">

                    <div>
                      <p className="text-[10px] uppercase tracking-[.15em] text-black/30">
                        Status
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${statusClass(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[.15em] text-black/30">
                        Order ID
                      </p>

                      <p className="mt-2 break-all text-xs font-semibold">
                        {payment.gatewayOrderId || '—'}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[.15em] text-black/30">
                        Created
                      </p>

                      <p className="mt-2 text-xs font-semibold">
                        {payment.createdAt
                          ? new Date(
                              payment.createdAt
                            ).toLocaleString()
                          : '—'}
                      </p>
                    </div>

                  </div>

                  {/* AUCTION LINK */}

                  {payment.auctionId && (
                    <Link
                      to={`/auctions/${payment.auctionId}`}
                      className="mt-5 inline-flex items-center text-xs font-bold underline underline-offset-4"
                    >
                      View auction
                    </Link>
                  )}

                </div>

              ))}

            </div>

          )}

      </main>

      <Footer />
    </>
  )
}
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  CreditCard,
  Heart,
  Radio,
  ShieldCheck,
  UserRound,
  XCircle,
  Zap,
  Trophy,
  Clock3,
} from 'lucide-react'

import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

import { auctionApi, paymentApi } from '../services/api'
import { imageFor } from '../components/AuctionCard'
import { useAuctionSocket } from '../hooks/useAuctionSocket'
import { useAuth } from '../context/AuthContext'

function money(v) {
  return v == null
    ? '—'
    : `₹${Number(v).toLocaleString('en-IN')}`
}

function countdown(end) {
  if (!end) return '00:00:00'

  const ms = Math.max(0, new Date(end) - Date.now())
  const s = Math.floor(ms / 1000)

  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(
    Math.floor((s % 3600) / 60)
  ).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export default function AuctionDetails() {
  const { id } = useParams()
  const { user } = useAuth()

  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])

  const [amount, setAmount] = useState('')
  const [maxBid, setMaxBid] = useState('')

  const [timer, setTimer] = useState('00:00:00')

  const [message, setMessage] = useState('')

  // Payment states
  const [payment, setPayment] = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState('')

  /*
   * ---------------------------------------------------------
   * FETCH AUCTION + BIDS
   * ---------------------------------------------------------
   */

  const loadAuction = async () => {
    try {
      const response = await auctionApi.get(id)
      setAuction(response.data.data)
    } catch (error) {
      console.error('Failed to load auction:', error)
    }
  }

  const loadBids = async () => {
    try {
      const response = await auctionApi.bids(id, {
        page: 0,
        size: 10,
        sort: 'createdAt,desc',
      })

      setBids(response.data.data.content || [])
    } catch (error) {
      console.error('Failed to load bids:', error)
    }
  }

  useEffect(() => {
    loadAuction()
    loadBids()
  }, [id])

  /*
   * ---------------------------------------------------------
   * TIMER
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!auction?.endDate) return

    const updateTimer = () => {
      setTimer(countdown(auction.endDate))
    }

    updateTimer()

    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [auction?.endDate])

  /*
   * ---------------------------------------------------------
   * WEBSOCKET
   * ---------------------------------------------------------
   */

  useAuctionSocket(id, update => {
    const next = update.payload || update

    setAuction(current => ({
      ...current,
      ...next,
    }))

    loadBids()
  })

  /*
   * ---------------------------------------------------------
   * PAYMENT
   * ---------------------------------------------------------
   */

  const loadPayment = async () => {
    if (!user || !auction) return

    try {
      const response = await paymentApi.history({
        page: 0,
        size: 20,
        sort: 'createdAt,desc',
      })

      const payments = response.data.data?.content || []

      const auctionPayment = payments.find(
        p => Number(p.auctionId) === Number(auction.id)
      )

      if (auctionPayment) {
        setPayment(auctionPayment)
      }
    } catch (error) {
      console.error('Failed to load payment:', error)
    }
  }

  useEffect(() => {
    if (
      user &&
      auction?.status === 'ENDED' &&
      isWinner()
    ) {
      loadPayment()
    }
  }, [
    user,
    auction?.status,
    auction?.currentHighestBidderId,
  ])

  /*
   * ---------------------------------------------------------
   * WINNER DETECTION
   * ---------------------------------------------------------
   */

  function getCurrentUserId() {
    return (
      user?.id ||
      user?.userId ||
      user?.user?.id ||
      null
    )
  }

  function isWinner() {
    if (!auction || !user) return false

    const currentUserId = getCurrentUserId()

    return (
      auction.status === 'ENDED' &&
      auction.currentHighestBidderId != null &&
      Number(auction.currentHighestBidderId) === Number(currentUserId) &&
      auction.reserveMet !== false
    )
  }

  const winner = isWinner()

  /*
   * ---------------------------------------------------------
   * BID CALCULATIONS
   * ---------------------------------------------------------
   */

  const current =
    auction?.currentHighestBid ||
    auction?.startingPrice ||
    0

  const min =
    Number(current) +
    Number(auction?.minIncrement || 1)

  /*
   * ---------------------------------------------------------
   * PLACE BID
   * ---------------------------------------------------------
   */

  const submit = async () => {
    setMessage('')

    if (!user) {
      setMessage('Sign in to place a bid.')
      return
    }

    if (auction.status !== 'LIVE') {
      setMessage('This auction is not accepting bids.')
      return
    }

    if (Number(amount) < min) {
      setMessage(`Minimum bid is ${money(min)}.`)
      return
    }

    try {
      const response = await auctionApi.placeBid(id, amount)

      setAuction(response.data.data)
      setAmount('')
      setMessage('Bid placed successfully.')

      await loadBids()
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Unable to place bid.'
      )
    }
  }

  /*
   * ---------------------------------------------------------
   * AUTO BID
   * ---------------------------------------------------------
   */

  const setAuto = async () => {
    setMessage('')

    if (!user) {
      setMessage('Sign in to use auto-bid.')
      return
    }

    if (!maxBid || Number(maxBid) <= 0) {
      setMessage('Enter a valid maximum amount.')
      return
    }

    try {
      await auctionApi.autoBid(id, maxBid)

      setMaxBid('')
      setMessage('Auto-bid activated.')
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          'Unable to activate auto-bid.'
      )
    }
  }

  /*
   * ---------------------------------------------------------
   * INITIATE PAYMENT
   * ---------------------------------------------------------
   */
const handlePayment = async () => {
  if (!winner) {
    setPaymentMessage(
      'Only the winner can make payment.'
    )
    return
  }

  setPaymentLoading(true)
  setPaymentMessage('')

  try {
    // 1. Create Razorpay order from backend
    const response = await paymentApi.initiate(
      auction.id
    )

    const createdPayment = response.data.data

    setPayment(createdPayment)

    // 2. Open Razorpay Checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,

      amount: Math.round(
        Number(createdPayment.amount) * 100
      ),

      currency:
        createdPayment.currency || 'INR',

      name: 'Bidly',

      description:
        createdPayment.auctionTitle,

      order_id:
        createdPayment.gatewayOrderId,

      handler: async function (response) {

        console.log(
          'Razorpay payment response:',
          response
        )

        setPaymentMessage(
          'Payment received. Verifying...'
        )

        try {

          await paymentApi.verify({
            razorpay_order_id:
              response.razorpay_order_id,

            razorpay_payment_id:
              response.razorpay_payment_id,

            razorpay_signature:
              response.razorpay_signature,
          })

          setPayment(prev => ({
            ...prev,
            status: 'SUCCESS',
            gatewayTransactionId:
              response.razorpay_payment_id,
          }))

          setPaymentMessage(
            'Payment successful! 🎉'
          )

        } catch (error) {

          console.error(
            'Payment verification failed:',
            error
          )

          setPaymentMessage(
            error.response?.data?.message ||
              'Payment verification failed.'
          )
        }
      },

      modal: {
        ondismiss: function () {
          setPaymentMessage(
            'Payment window closed.'
          )
        },
      },

      theme: {
        color: '#000000',
      },
    }

    const razorpay =
      new window.Razorpay(options)

    razorpay.on(
      'payment.failed',
      function (response) {

        console.error(
          'Razorpay payment failed:',
          response
        )

        setPaymentMessage(
          response.error?.description ||
            'Payment failed.'
        )
      }
    )

    razorpay.open()

  } catch (error) {

    console.error(
      'Failed to initiate payment:',
      error
    )

    setPaymentMessage(
      error.response?.data?.message ||
        'Unable to initiate payment.'
    )

  } finally {

    setPaymentLoading(false)

  }
}

  const handleSimulatePayment = async () => {
  if (!payment?.id) {
    setPaymentMessage(
      'Payment record not found.'
    )
    return
  }

  setPaymentLoading(true)
  setPaymentMessage('')

  try {
    const response =
      await paymentApi.simulateSuccess(payment.id)

    const updatedPayment =
      response.data.data

    setPayment(updatedPayment)

    setPaymentMessage(
      'Payment completed successfully! 🎉'
    )

  } catch (error) {

    setPaymentMessage(
      error.response?.data?.message ||
        'Unable to complete mock payment.'
    )

  } finally {
    setPaymentLoading(false)
  }
}

  /*
   * ---------------------------------------------------------
   * PAYMENT STATUS UI
   * ---------------------------------------------------------
   */

  const renderPaymentStatus = () => {
    if (!payment) return null

    if (payment.status === 'SUCCESS') {
      return (
        <div className="mt-4 rounded-2xl bg-[#e9f8e9] p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={22}
              className="text-green-600"
            />

            <div>
              <p className="font-bold text-green-700">
                Payment Successful
              </p>

              <p className="mt-1 text-xs text-green-700/70">
                Your payment for this auction has been
                completed successfully.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white p-3 text-xs">
            <p>
              Amount:{' '}
              <strong>{money(payment.amount)}</strong>
            </p>

            <p className="mt-1">
              Order ID:{' '}
              <strong>{payment.gatewayOrderId}</strong>
            </p>
          </div>
        </div>
      )
    }

  if (payment.status === 'PENDING') {
  return (
    <div className="mt-4 rounded-2xl bg-[#fff8df] p-5">

      <div className="flex items-center gap-3">

        <Clock3
          size={22}
          className="text-yellow-600"
        />

        <div>
          <p className="font-bold text-yellow-700">
            Payment Pending
          </p>

          <p className="mt-1 text-xs text-yellow-700/70">
            Your payment order has been created and is
            waiting for confirmation.
          </p>
        </div>

      </div>

      <div className="mt-4 rounded-xl bg-white p-3 text-xs">

        <p>
          Amount:{' '}
          <strong>
            {money(payment.amount)}
          </strong>
        </p>

        <p className="mt-1">
          Order ID:{' '}
          <strong>
            {payment.gatewayOrderId}
          </strong>
        </p>

      </div>

      {/* DEV ONLY */}
      <button
        onClick={handleSimulatePayment}
        disabled={paymentLoading}
        className="mt-4 h-11 w-full rounded-full bg-black px-5 text-xs font-bold text-white disabled:opacity-50"
      >
        {paymentLoading
          ? 'Processing...'
          : '🧪 Simulate Successful Payment'}
      </button>

      <p className="mt-2 text-center text-[10px] text-yellow-700/60">
        Development mode only
      </p>

    </div>
  )
}

    if (payment.status === 'FAILED') {
      return (
        <div className="mt-4 rounded-2xl bg-[#ffecec] p-5">
          <div className="flex items-center gap-3">
            <XCircle
              size={22}
              className="text-red-600"
            />

            <div>
              <p className="font-bold text-red-700">
                Payment Failed
              </p>

              <p className="mt-1 text-xs text-red-700/70">
                Your previous payment attempt failed.
                Please try again.
              </p>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={paymentLoading}
            className="mt-4 h-11 rounded-full bg-black px-5 text-xs font-bold text-white disabled:opacity-40"
          >
            {paymentLoading
              ? 'Creating order...'
              : 'Try Payment Again'}
          </button>
        </div>
      )
    }

    if (payment.status === 'REFUNDED') {
      return (
        <div className="mt-4 rounded-2xl bg-[#f2f2ed] p-5">
          <p className="font-bold">
            Payment Refunded
          </p>

          <p className="mt-1 text-xs text-black/50">
            This payment has been refunded.
          </p>
        </div>
      )
    }

    return null
  }

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (!auction) {
    return (
      <>
        <Navbar />

        <div className="mx-auto max-w-[1320px] px-5 py-32 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/10 border-t-black" />
        </div>

        <Footer />
      </>
    )
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8 lg:py-12">

        {/* BACK */}
        <Link
          to="/auctions"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to auctions
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div>

            {/* IMAGE */}
            <div className="relative aspect-[1.08] overflow-hidden rounded-[34px] bg-[#efeee9]">

              <img
                src={imageFor(auction, Number(id))}
                className="h-full w-full object-cover"
                alt={auction.title}
              />

              <div className="absolute left-5 top-5 flex gap-2">

                <span className="rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em]">

                  <span className="inline-flex items-center gap-2">

                    <Radio
                      size={11}
                      className={
                        auction.status === 'LIVE'
                          ? 'text-[#ff42ad]'
                          : ''
                      }
                    />

                    {auction.status}

                  </span>

                </span>

              </div>

              <button className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/90">
                <Heart size={18} />
              </button>

            </div>

            {/* THUMBNAILS */}
            <div className="mt-4 grid grid-cols-3 gap-3">

              {(auction.images?.slice(0, 3) || []).map(
                img => (
                  <img
                    key={img.id}
                    src={img.imageUrl}
                    className="aspect-square rounded-2xl object-cover"
                    alt=""
                  />
                )
              )}

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="pt-2 lg:pt-8">

            {/* CATEGORY */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#ff42ad]">

              <span>
                {auction.category?.name ||
                  'Collectible'}
              </span>

              <span className="text-black/20">
                •
              </span>

              <span>
                By {auction.sellerName}
              </span>

            </div>

            {/* TITLE */}
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-[.92] tracking-[-.07em] md:text-6xl">
              {auction.title}
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-5 max-w-xl text-sm leading-7 text-black/50">
              {auction.description}
            </p>

            {/* =================================================
                ENDED / WINNER BANNER
            ================================================= */}

            {auction.status === 'ENDED' && (
              <div
                className={`mt-6 rounded-[28px] p-6 ${
                  winner
                    ? 'bg-[#e8f46a]'
                    : 'bg-[#f1f1ec]'
                }`}
              >

                <div className="flex items-start gap-4">

                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                      winner
                        ? 'bg-black text-[#e8f46a]'
                        : 'bg-white'
                    }`}
                  >
                    <Trophy size={22} />
                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-[.15em] text-black/40">
                      Auction ended
                    </p>

                    {winner ? (
                      <>
                        <h2 className="mt-1 font-display text-2xl font-extrabold">
                          Congratulations! 🎉
                        </h2>

                        <p className="mt-1 text-sm text-black/60">
                          You won this auction.
                        </p>

                        <p className="mt-3 text-sm font-bold">
                          Winning bid:{' '}
                          {money(
                            auction.currentHighestBid
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="mt-1 font-display text-2xl font-extrabold">
                          Auction Ended
                        </h2>

                        <p className="mt-1 text-sm text-black/50">
                          The winning bidder was{' '}
                          {auction.currentHighestBidderName ||
                            'another bidder'}
                          .
                        </p>

                        <p className="mt-3 text-sm font-bold">
                          Final bid:{' '}
                          {money(
                            auction.currentHighestBid
                          )}
                        </p>
                      </>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                CURRENT BID CARD
            ================================================= */}

            <div className="mt-8 rounded-[30px] bg-white p-6 shadow-card">

              <div className="flex items-end justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-black/35">
                    {auction.status === 'ENDED'
                      ? 'Winning bid'
                      : 'Current bid'}
                  </p>

                  <p className="mt-1 font-display text-4xl font-extrabold tracking-[-.06em]">
                    {money(current)}
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-black/35">
                    {auction.status === 'ENDED'
                      ? 'Status'
                      : 'Time left'}
                  </p>

                  <p
                    className={`mt-1 font-display text-2xl font-extrabold tracking-[-.05em] ${
                      auction.status === 'LIVE'
                        ? 'text-[#ff42ad]'
                        : ''
                    }`}
                  >
                    {auction.status === 'ENDED'
                      ? 'ENDED'
                      : timer}
                  </p>

                </div>

              </div>

              {/* BID FORM */}

              {auction.status === 'LIVE' && (
                <>
                  <div className="mt-6 flex gap-2">

                    <input
                      type="number"
                      min={min}
                      value={amount}
                      onChange={e =>
                        setAmount(e.target.value)
                      }
                      placeholder={String(min)}
                      className="h-[52px] min-w-0 flex-1 rounded-full bg-[#f5f5f1] px-5 text-sm font-bold outline-none ring-[#ff42ad] focus:ring-2"
                    />

                    <button
                      onClick={submit}
                      className="h-[52px] rounded-full bg-black px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-black/20"
                    >
                      Place bid
                    </button>

                  </div>

                  <p className="mt-3 text-xs text-black/35">
                    Minimum next bid:{' '}
                    {money(min)}
                  </p>
                </>
              )}

              {message && (
                <p className="mt-3 rounded-xl bg-[#fff0f8] px-4 py-3 text-xs font-semibold text-[#a21c6c]">
                  {message}
                </p>
              )}

            </div>

            {/* =================================================
                PAY NOW
            ================================================= */}

            {winner && (
              <div className="mt-5 rounded-[30px] bg-black p-6 text-white">

                <div className="flex items-start gap-4">

                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e8f46a] text-black">
                    <CreditCard size={19} />
                  </div>

                  <div className="flex-1">

                    <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/40">
                      Winner payment
                    </p>

                    <h3 className="mt-1 font-display text-2xl font-extrabold">
                      Complete your payment
                    </h3>

                    <p className="mt-1 text-sm text-white/50">
                      Pay {money(
                        auction.currentHighestBid
                      )} to complete your purchase.
                    </p>

                  </div>

                </div>

                {!payment && (
                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#e8f46a] text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CreditCard size={17} />

                    {paymentLoading
                      ? 'Creating payment order...'
                      : 'Pay Now'}
                  </button>
                )}

                {paymentMessage && (
                  <p className="mt-3 rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold text-white/80">
                    {paymentMessage}
                  </p>
                )}

                {renderPaymentStatus()}

              </div>
            )}

            {/* =================================================
                AUTO BID
            ================================================= */}

            {auction.status === 'LIVE' && (
              <div className="mt-4 rounded-[30px] bg-[#e8f46a] p-6">

                <div className="flex items-center gap-3">

                  <div className="grid h-10 w-10 place-items-center rounded-full bg-black text-white">
                    <Zap size={17} />
                  </div>

                  <div>

                    <h3 className="font-bold">
                      Auto-bid
                    </h3>

                    <p className="text-xs text-black/50">
                      Let Bidly compete up to your
                      maximum.
                    </p>

                  </div>

                </div>

                <div className="mt-4 flex gap-2">

                  <input
                    type="number"
                    value={maxBid}
                    onChange={e =>
                      setMaxBid(e.target.value)
                    }
                    placeholder="Maximum amount"
                    className="h-12 min-w-0 flex-1 rounded-full bg-white px-5 text-sm font-semibold outline-none"
                  />

                  <button
                    onClick={setAuto}
                    className="h-12 rounded-full bg-black px-5 text-xs font-bold text-white"
                  >
                    Set max
                  </button>

                </div>

              </div>
            )}

            {/* =================================================
                BID ACTIVITY
            ================================================= */}

            <div className="mt-8">

              <div className="flex items-center justify-between">

                <h2 className="font-display text-2xl font-extrabold tracking-[-.05em]">
                  Bid activity
                </h2>

                <span className="inline-flex items-center gap-1 text-xs text-black/40">
                  <Bell size={13} />
                  Live updates
                </span>

              </div>

              <div className="mt-4 divide-y divide-black/5 rounded-[26px] bg-white px-5 shadow-card">

                {bids.length ? (
                  bids.map(b => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between py-4"
                    >

                      <div className="flex items-center gap-3">

                        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f2ed]">
                          <UserRound size={15} />
                        </div>

                        <div>

                          <p className="text-sm font-semibold">
                            {b.bidderName}
                          </p>

                          <p className="text-[11px] text-black/35">
                            {new Date(
                              b.createdAt
                            ).toLocaleString()}
                          </p>

                        </div>

                      </div>

                      <strong className="text-sm">
                        {money(b.amount)}
                      </strong>

                    </div>
                  ))
                ) : (
                  <p className="py-10 text-center text-sm text-black/40">
                    No bids yet. Be the first.
                  </p>
                )}

              </div>

            </div>

            {/* SECURITY */}
            <div className="mt-7 flex items-center gap-3 text-xs text-black/45">
              <ShieldCheck size={16} />
              Your bid is processed securely by the
              auction backend.
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  )
}
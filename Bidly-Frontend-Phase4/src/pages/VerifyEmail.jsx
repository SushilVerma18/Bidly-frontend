import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing.')
      return
    }

    axios.get(
  `https://bidly-z0fc.onrender.com/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`
)
      .then((response) => {
        setStatus('success')
        setMessage(
          response.data?.data?.message ||
          'Your email has been verified successfully.'
        )
      })
      .catch((error) => {
        setStatus('error')
        setMessage(
          error.response?.data?.message ||
          'Verification failed. The link may be invalid or expired.'
        )
      })
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbf7] px-5">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-card">

        {status === 'verifying' && (
          <>
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-[#ff42ad]" />
            <h1 className="font-display text-3xl font-extrabold">
              Verifying email...
            </h1>
            <p className="mt-3 text-sm text-black/50">
              Please wait while we verify your email.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-5 text-5xl">✓</div>

            <h1 className="font-display text-3xl font-extrabold">
              Email Verified!
            </h1>

            <p className="mt-3 text-sm leading-6 text-black/50">
              {message}
            </p>

            <Link
              to="/login"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-bold text-white"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-5 text-5xl">✕</div>

            <h1 className="font-display text-3xl font-extrabold">
              Verification Failed
            </h1>

            <p className="mt-3 text-sm leading-6 text-black/50">
              {message}
            </p>

            <Link
              to="/login"
              className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-bold text-white"
            >
              Back to Login
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
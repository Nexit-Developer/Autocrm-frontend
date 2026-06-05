import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import API from '../../api/axios'

const steps = ['details', 'otp', 'success']

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState('details')
  const [role, setRole] = useState('agent')
  const [form, setForm] = useState({ name: '', email: '', password: ''})
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/send-otp', {
        email: form.email,
        name: form.name
      })
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/verify-otp', {
        email: form.email,
        otp
      })
      setOtpVerified(true)
      await handleRegister()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    try {
      const endpoint = role === 'agent'
        ? '/auth/register/agent'
        : '/auth/register/customer'

      await API.post(endpoint, form)
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError('')
    try {
      await API.post('/auth/send-otp', {
        email: form.email,
        name: form.name
      })
      setError('')
      alert('New OTP sent to your email!')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-600 rounded-2xl mb-4">
            <span className="text-white text-2xl">🚗</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">AutoCRM</h1>
          <p className="text-gray-500 text-sm mt-1">Nexit Solution — Car Sales Suite</p>
        </div>

        {/* Step — Details */}
        {step === 'details' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Create account</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in your details to get started</p>

            {/* Role selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am signing up as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('agent')}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    role === 'agent'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  👤 Agent
                </button>
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    role === 'customer'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  🚗 Customer
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Min. 8 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send verification code'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step — OTP */}
        {step === 'otp' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
              <p className="text-gray-500 text-sm mt-1">
                We sent a 6-digit code to <span className="font-medium text-gray-700">{form.email}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="000000"
              />
              <p className="text-xs text-gray-400 mt-1">Code expires in 10 minutes</p>
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & create account'}
            </button>

            <button
              onClick={handleResendOTP}
              disabled={loading}
              className="w-full mt-3 text-purple-600 text-sm font-medium hover:underline"
            >
              Resend code
            </button>

            <button
              onClick={() => { setStep('details'); setError('') }}
              className="w-full mt-2 text-gray-500 text-sm hover:underline"
            >
              ← Change email
            </button>
          </div>
        )}

        {/* Step — Success */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Account created!
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Your account is pending admin approval. You will be able to login once an admin reviews and approves your account.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              Go to login
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 Nexit Solution. All rights reserved.
        </p>
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, BookOpen, Trophy, Star } from 'lucide-react'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email, formData.password)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <BookOpen className="h-10 w-10 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">LearnHub</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700">Welcome back!</h2>
          <p className="text-gray-600 mt-2">Continue your learning journey</p>
        </div>

        {/* Features showcase */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="text-center">
            <div className="bg-white rounded-full p-3 mx-auto w-fit shadow-sm">
              <Trophy className="h-6 w-6 text-warning-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">Earn Points</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-full p-3 mx-auto w-fit shadow-sm">
              <Star className="h-6 w-6 text-success-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">Level Up</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-full p-3 mx-auto w-fit shadow-sm">
              <BookOpen className="h-6 w-6 text-primary-500" />
            </div>
            <p className="text-sm text-gray-600 mt-2">Learn Skills</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">🚀 Demo Accounts (For Testing)</h3>
          <div className="space-y-2 text-xs text-blue-800">
            <div className="flex justify-between">
              <span><strong>Student:</strong> demo@learnhub.com</span>
              <span><strong>Password:</strong> demo123</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Advanced:</strong> sarah@learnhub.com</span>
              <span><strong>Password:</strong> sarah123</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Admin:</strong> admin@learnhub.com</span>
              <span><strong>Password:</strong> admin123</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Start learning today and unlock your potential!</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { getMockUser } from '../data/mockData'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Mock authentication for demo purposes
      const matchedUser = getMockUser(email, password)

      if (matchedUser) {
        // Remove password from user data
        const { password: _, ...userData } = matchedUser
        const mockToken = `mock-jwt-token-${userData.id}-${Date.now()}`

        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(userData))

        setUser(userData)
        setIsAuthenticated(true)

        return { success: true }
      } else {
        return { 
          success: false, 
          error: 'Invalid email or password. Try demo@learnhub.com / demo123' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      }
    }
  }

  const signup = async (userData) => {
    try {
      // Mock signup for demo purposes
      const newUser = {
        id: `demo-user-${Date.now()}`,
        email: userData.email,
        fullname: userData.fullname,
        username: userData.username,
        points: 0,
        level: 1,
        role: 'student',
        bio: '',
        joinDate: new Date().toISOString().split('T')[0]
      }

      const mockToken = `mock-jwt-token-${newUser.id}-${Date.now()}`

      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(newUser))

      setUser(newUser)
      setIsAuthenticated(true)

      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return { 
        success: false, 
        error: 'Signup failed. Please try again.' 
      }
    }
  }

  const logout = async () => {
    try {
      await authAPI.signout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData }
    setUser(newUserData)
    localStorage.setItem('user', JSON.stringify(newUserData))
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
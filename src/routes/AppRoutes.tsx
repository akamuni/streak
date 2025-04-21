import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage, LoginPage, SignupPage, DashboardPage, ProfilePage, FriendsPage, SetupProfilePage, SignoutPage, NotFoundPage } from '../pages'
import ProtectedRoute from '../components/auth/ProtectedRoute'

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<SignupPage />} />
    <Route
      path="/chapters"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/friends"
      element={
        <ProtectedRoute>
          <FriendsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/setup"
      element={
        <ProtectedRoute>
          <SetupProfilePage />
        </ProtectedRoute>
      }
    />
    <Route path="/signout" element={<SignoutPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export default AppRoutes

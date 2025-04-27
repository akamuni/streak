import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage, SignupPage, DashboardPage, ProfilePage, FriendsPage, SetupProfilePage, MessagesPage, ChatPage, SignoutPage, GroupsPage } from '../pages'
import GroupChatPage from '../pages/GroupChatPage';
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { AuthContext } from '../context/AuthContext'
import Spinner from '../components/common/Spinner'

const AppRoutes: React.FC = () => {
  const { user, loading } = useContext(AuthContext)
  if (loading) return <Spinner />
  return (
    <Routes>
      { !user ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/chapters" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
          <Route path="/groups/:groupId/chat" element={<ProtectedRoute><GroupChatPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/chat/:friendId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute><SetupProfilePage /></ProtectedRoute>} />
          <Route path="/signout" element={<SignoutPage />} />
          <Route path="*" element={<Navigate to="/chapters" replace />} />
        </>
      ) }
    </Routes>
  )
}

export default AppRoutes

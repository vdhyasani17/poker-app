import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from "./pages/HomePage.jsx";
import RegisterPage from './pages/RegisterPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore.js';
import { Loader } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import CreateGamePage from './pages/CreateGamePage.jsx';
import JoinGamePage from './pages/JoinGamePage.jsx';
import GamePage from './pages/GamePage.jsx';

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {  // Loading icon
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/register" element={!authUser ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/create" element={authUser ? <CreateGamePage /> : <Navigate to="/login" />} />
        <Route path="/join" element={authUser ? <JoinGamePage /> : <Navigate to="/login" />} />
        <Route path="/:id" element={authUser ? <GamePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App

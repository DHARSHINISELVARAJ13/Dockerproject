import React from 'react'
import { assets } from '../../assets/assets'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'
import { useAppContext } from '../../../context/AppContext'

const Layout = () => {
  const { user, logout } = useAppContext();

  return (
    <>
      {/* Top Navbar */}
      <div className='flex items-center justify-between py-2 h-[70px] px-4 sm:px-12 border-b border-gray-200'>
        <div className='flex items-center gap-4'>
          <img
            src={assets.logo}
            alt="logo"
            className="w-32 sm:w-40 cursor-pointer"
            onClick={() => window.location.href = '/'}
          />
          <div className='hidden md:block'>
            <h2 className='text-lg font-semibold text-gray-700'>Admin Dashboard</h2>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          {user && (
            <span className='text-sm text-gray-600 hidden sm:block'>
              Welcome, {user.name}
            </span>
          )}
          <button
            onClick={logout}
            className="text-sm px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div className='flex h-[calc(100vh-70px)]'>
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default Layout

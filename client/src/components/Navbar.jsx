import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext';

const Navbar = () => {
    const { navigate, token, user, logout } = useAppContext()
    const [showUserMenu, setShowUserMenu] = useState(false)

    const handleUserMenuToggle = () => {
        setShowUserMenu(!showUserMenu)
    }

    const handleLogout = () => {
        logout()
        setShowUserMenu(false)
    }

    return (
        <div className='flex justify-between items-center py-5 mx-8 sm:mx-20 xl:mx-32'>
            <img 
                onClick={() => navigate('/')} 
                src={assets.logo} 
                alt="logo" 
                className='w-32 sm:w-44 cursor-pointer'
            />
            
            <div className='flex items-center gap-4'>
                {token && user ? (
                    <>
                        {/* Submit Blog Button */}
                        <button 
                            onClick={() => navigate('/submit-blog')}
                            className='hidden sm:flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm'
                        >
                            Write Blog
                        </button>

                        {/* User Menu */}
                        <div className='relative'>
                            <button 
                                onClick={handleUserMenuToggle}
                                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                            >
                                <span className='hidden sm:inline'>Hi, {user.name?.split(' ')[0]}</span>
                                <span className='sm:hidden'>Menu</span>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                                    <div className='py-1'>
                                        <div className='px-4 py-2 text-sm text-gray-700 border-b'>
                                            {user.name}
                                            <div className='text-xs text-gray-500'>{user.email}</div>
                                        </div>
                                        
                                        <button 
                                            onClick={() => {
                                                navigate('/submit-blog')
                                                setShowUserMenu(false)
                                            }}
                                            className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                        >
                                            Write Blog
                                        </button>

                                        {user.role === 'admin' && (
                                            <button 
                                                onClick={() => {
                                                    navigate('/admin')
                                                    setShowUserMenu(false)
                                                }}
                                                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                            >
                                                Admin Dashboard
                                            </button>
                                        )}

                                        <hr className='my-1' />
                                        
                                        <button 
                                            onClick={handleLogout}
                                            className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className='flex items-center gap-3'>
                        <button 
                            onClick={() => navigate('/login')}
                            className='px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm'
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => navigate('/register')}
                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm'
                        >
                            Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar

import React from 'react'
import {Route,Routes, Navigate} from 'react-router-dom';
import Home from './pages/Home'
import Blog from './pages/Blog'
import Dashboard from './pages/admin/Dashboard';
import Layout from './pages/admin/Layout';
import AddBlog from './pages/admin/AddBlog';
import ListBlog from './pages/admin/ListBlog';
import Comments from './pages/admin/Comments';
import AdminLogin from './components/admin/Login';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AuthLoader from './components/Auth/AuthLoader';
import BlogSubmission from './components/BlogSubmission';
import 'quill/dist/quill.snow.css'
import { Toaster } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const App = () => {

  const {token, isLoading} = useAppContext()
  
  if (isLoading) {
    return <AuthLoader />;
  }

  return (
    <div>
      <Toaster/>
      <Routes>
        {/* Public routes */}
        <Route path='/login' element={!token ? <Login/> : <Navigate to="/" />} />
        <Route path='/register' element={!token ? <Register/> : <Navigate to="/" />} />
        
        {/* Protected routes */}
        <Route path='/' element={
          <ProtectedRoute>
            <Home/>
          </ProtectedRoute>
        } />
        <Route path='/blog/:id' element={
          <ProtectedRoute>
            <Blog/>
          </ProtectedRoute>
        } />
        <Route path='/submit-blog' element={
          <ProtectedRoute>
            <BlogSubmission/>
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path='/admin' element={token ?  <Layout/>: <AdminLogin/>}>
                     <Route index element={<Dashboard />} />
                   <Route path='addBlog' element={<AddBlog/>}/>
                    <Route path='listBlog' element={<ListBlog/>}/>
                     <Route path='comments' element={<Comments/>}/>
        </Route>

        {/* Catch all - redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to={token ? "/" : "/login"} />} />
      </Routes>
    </div>
  )
}

export default App

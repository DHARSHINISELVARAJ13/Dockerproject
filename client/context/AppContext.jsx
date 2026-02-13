import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [input, setInput] = useState('');

    // Authentication functions
    const login = async (email, password, isAdmin = false) => {
        try {
            const endpoint = isAdmin ? 'api/admin/login' : 'api/user/login';
            const { data } = await axios.post(endpoint, { email, password });
            
            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                axios.defaults.headers.common['Authorization'] = data.token;
                
                toast.success('Login successful!');
                
                // Navigate based on role
                if (data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
                
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post('api/user/register', { name, email, password });
            
            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                axios.defaults.headers.common['Authorization'] = data.token;
                
                toast.success('Registration successful!');
                navigate('/');
                return true;
            } else {
                toast.error(data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setBlogs([]);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const fetchBlogs = async () => {
        try {
            const { data } = await axios.get('api/blog/all');
            if (data.success) {
                setBlogs(data.blogs);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                logout();
            } else {
                toast.error('Failed to fetch blogs');
            }
        }
    };

    // Check authentication on app load
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken && storedUser) {
                try {
                    axios.defaults.headers.common['Authorization'] = storedToken;
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    await fetchBlogs();
                } catch (error) {
                    logout();
                }
            }
            setIsLoading(false);
        };
        
        initAuth();
    }, []);

    const value = {
        axios,
        navigate,
        token,
        setToken,
        user,
        setUser,
        blogs,
        setBlogs,
        isLoading,
        input,
        setInput,
        login,
        register,
        logout,
        fetchBlogs
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}


export const useAppContext = () =>{
    return useContext(AppContext)
};

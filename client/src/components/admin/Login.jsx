import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
    const { login } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password, true); // true for admin login
        } catch (error) {
            toast.error('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="w-full max-w-md bg-white px-10 py-12 rounded-lg border border-gray-200 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">
                        <span className="text-indigo-600">Admin</span> Login
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Enter your credentials to access the admin panel
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input onChange={e => setEmail(e.target.value)} value={email}
                            type="email"
                            required
                            placeholder="Your email id"
                            className="border-b border-gray-300 py-2 px-1 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            required
                            placeholder="Your Password"
                            className="border-b border-gray-300 py-2 px-1 text-sm placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm py-2 rounded transition duration-150"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

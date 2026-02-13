import React from 'react';

const AuthLoader = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-indigo-600 border-gray-200 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Loading...</p>
            </div>
        </div>
    );
};

export default AuthLoader;

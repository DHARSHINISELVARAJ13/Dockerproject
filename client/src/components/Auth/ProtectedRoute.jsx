import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import Loader from '../Loader';

const ProtectedRoute = ({ children }) => {
    const { token, isLoading } = useAppContext();
    const location = useLocation();

    if (isLoading) {
        return <Loader />;
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;

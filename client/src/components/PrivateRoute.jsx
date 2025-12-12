import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const token = localStorage.getItem('token');

    // Check if token exists AND is not "undefined" or "null" strings
    const isAuthenticated = token && token !== "undefined" && token !== "null";

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
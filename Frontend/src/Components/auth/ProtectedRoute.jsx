import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';

function ProtectedRoute() {
    const isAuthenticated = true; // Replace with your authentication logic
    const loading = false; // Replace with your loading state logic

    if (loading) {
        return <div>Loading...</div>;
    }
  return isAuthenticated ? (
    <AppLayout>
         <Outlet/>
    </AppLayout>): (
    <Navigate to="/login" replace />
  );
}

export default ProtectedRoute
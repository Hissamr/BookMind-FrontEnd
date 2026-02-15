import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ShoppingBag, Users, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="admin-loading">Loading...</div>;

    // Redirect non-admin users
    if (!user || !user.roles?.includes('ADMIN')) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2><Shield size={20} /> <span>Admin Panel</span></h2>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/admin" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/books" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <BookOpen size={20} />
                        <span>Books</span>
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <ShoppingBag size={20} />
                        <span>Orders</span>
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        <span>Users</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <NavLink to="/">
                        <ArrowLeft size={18} />
                        <span>Back to Store</span>
                    </NavLink>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

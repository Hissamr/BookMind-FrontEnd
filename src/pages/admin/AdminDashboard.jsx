import { useState, useEffect } from 'react';
import { BookOpen, ShoppingBag, DollarSign, Users } from 'lucide-react';
import api from '../../services/api';
import './Admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                api.get('/books/stats').catch(() => ({ data: null })),
                api.get('/orders').catch(() => ({ data: [] }))
            ]);

            setStats(statsRes.data);
            setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Loading dashboard...</div>;

    const totalRevenue = recentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return (
        <div>
            <h1 className="admin-page-title">Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon purple"><BookOpen size={24} /></div>
                    <div className="stat-info">
                        <h3>{stats?.totalBooks ?? 0}</h3>
                        <p>Total Books</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pink"><ShoppingBag size={24} /></div>
                    <div className="stat-info">
                        <h3>{recentOrders.length}</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><DollarSign size={24} /></div>
                    <div className="stat-info">
                        <h3>${totalRevenue.toFixed(2)}</h3>
                        <p>Revenue</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange"><Users size={24} /></div>
                    <div className="stat-info">
                        <h3>{stats?.totalAuthors ?? '—'}</h3>
                        <p>Authors</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Genre Distribution Chart */}
                {stats?.genreDistribution && (
                    <div className="genre-chart">
                        <h3>Genre Distribution</h3>
                        <div className="genre-bar-container">
                            {Object.entries(stats.genreDistribution).map(([genre, count], i) => {
                                const max = Math.max(...Object.values(stats.genreDistribution));
                                const pct = max > 0 ? (count / max) * 100 : 0;
                                return (
                                    <div key={genre} className="genre-bar-row">
                                        <span className="genre-bar-label">{genre}</span>
                                        <div className="genre-bar-track">
                                            <div
                                                className={`genre-bar-fill genre-colors-${i % 8}`}
                                                style={{ width: `${Math.max(pct, 8)}%` }}
                                            >
                                                {count}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Orders */}
                <div className="recent-section">
                    <h3>Recent Orders</h3>
                    {recentOrders.length > 0 ? (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td>${order.totalAmount?.toFixed(2)}</td>
                                        <td>
                                            <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="admin-empty">No orders yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

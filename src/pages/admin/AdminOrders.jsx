import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import api from '../../services/api';
import './Admin.css';

const statusFlow = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Failed to update order status.');
        }
    };

    const filtered = orders.filter(o => {
        const matchesSearch = `#${o.id}`.includes(search) ||
            o.items?.some(item => item.title?.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="admin-loading">Loading orders...</div>;

    return (
        <div>
            <div className="admin-section-header">
                <h2>Order Management</h2>
                <div className="filters-bar">
                    <div className="admin-search">
                        <Search size={18} />
                        <input
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="admin-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Update Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(order => (
                            <tr key={order.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Package size={16} color="var(--text-muted)" />
                                        <strong>#{order.id}</strong>
                                    </div>
                                </td>
                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>
                                    {order.items?.map((item, i) => (
                                        <div key={i} style={{ fontSize: '0.85rem' }}>
                                            {item.title} <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                                        </div>
                                    ))}
                                </td>
                                <td><strong>${order.totalAmount?.toFixed(2)}</strong></td>
                                <td>
                                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' ? (
                                        <select
                                            className="admin-select"
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                        >
                                            {statusFlow.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="admin-empty">No orders found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;

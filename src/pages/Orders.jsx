import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DELIVERED': return <CheckCircle className="text-success" />;
            case 'CANCELLED': return <XCircle className="text-error" />;
            default: return <Clock className="text-warning" />;
        }
    };

    if (loading) return <div className="loading-state">Loading order history...</div>;

    return (
        <div className="orders-page container">
            <h1>Order History</h1>

            {orders.length > 0 ? (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card card">
                            <div className="order-header">
                                <div className="order-id">
                                    <Package size={20} />
                                    <span>Order #{order.id}</span>
                                </div>
                                <div className="order-date">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </div>
                                <div className={`order-status status-${order.status.toLowerCase()}`}>
                                    {getStatusIcon(order.status)}
                                    <span>{order.status}</span>
                                </div>
                            </div>

                            <div className="order-items">
                                {order.items.map(item => (
                                    <div key={item.bookId} className="order-item">
                                        <span>{item.title} (x{item.quantity})</span>
                                        <span>${item.totalPrice?.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-footer">
                                <span>Total Amount:</span>
                                <span className="total-amount">${order.totalAmount?.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <Package size={48} />
                    <h2>No orders found</h2>
                    <p>You haven't placed any orders yet.</p>
                </div>
            )}
        </div>
    );
};

export default Orders;

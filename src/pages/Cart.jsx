import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateCartItem, loading } = useCart();
    const navigate = useNavigate();

    if (loading) return <div className="loading-state">Loading cart...</div>;

    const hasItems = cart && cart.items && cart.items.length > 0;

    return (
        <div className="cart-page container">
            <h1>Your Shopping Cart</h1>

            {hasItems ? (
                <div className="cart-grid">
                    <div className="cart-items">
                        {cart.items.map((item) => (
                            <div key={item.bookId} className="cart-item card">
                                <div className="cart-item-info">
                                    <h3>{item.title}</h3>
                                    <p className="price">${item.price?.toFixed(2)}</p>
                                </div>

                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => updateCartItem(item.bookId, Math.max(1, item.quantity - 1))}
                                        >-</button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => updateCartItem(item.bookId, item.quantity + 1)}
                                        >+</button>
                                    </div>
                                    <span className="item-total">${item.totalPrice?.toFixed(2)}</span>
                                    <button
                                        onClick={() => removeFromCart(item.bookId)}
                                        className="remove-btn"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary card">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${cart.totalPrice?.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${cart.totalPrice?.toFixed(2)}</span>
                        </div>

                        <button className="btn btn-primary checkout-btn">
                            Proceed to Checkout <ArrowRight size={18} />
                        </button>

                        <button onClick={() => navigate('/books')} className="btn btn-outline continue-btn">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            ) : (
                <div className="empty-cart card">
                    <ShoppingBag size={48} />
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any books yet.</p>
                    <button onClick={() => navigate('/books')} className="btn btn-primary">
                        Start Browsing
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;

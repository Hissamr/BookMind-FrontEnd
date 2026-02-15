import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, BookOpen, Heart, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css'; // We will create this or use inline styles/global css

const Navbar = () => {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    const isAdmin = user?.roles?.includes('ADMIN');

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="logo">
                    <BookOpen className="logo-icon" />
                    <span>BookMind</span>
                </Link>

                <div className="nav-links">
                    <Link to="/books">Browse</Link>
                    <Link to="/books/top-rated">Top Rated</Link>
                </div>

                <div className="nav-actions">
                    {user ? (
                        <>
                            {isAdmin && (
                                <Link to="/admin" className="icon-btn admin-link" title="Admin Panel">
                                    <Shield size={20} />
                                </Link>
                            )}
                            <Link to="/wishlists" className="icon-btn" title="Wishlist">
                                <Heart size={20} />
                            </Link>
                            <Link to="/cart" className="icon-btn cart-btn">
                                <ShoppingCart size={20} />
                                {totalItems > 0 && <span className="badge">{totalItems}</span>}
                            </Link>
                            <div className="user-menu">
                                <span className="username">{user.username}</span>
                                <button onClick={logout} className="icon-btn" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;


import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Star, Share2, Plus, Check } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AISummary from '../components/AISummary';
import './BookDetail.css';

const BookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);

    // Wishlist picker state
    const [showWishlistPicker, setShowWishlistPicker] = useState(false);
    const [wishlists, setWishlists] = useState([]);
    const [wishlistsLoading, setWishlistsLoading] = useState(false);
    const [showCreateInput, setShowCreateInput] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [addingToId, setAddingToId] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await api.get(`/books/${id}`);
                setBook(response.data);
            } catch (error) {
                console.error('Error fetching book details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowWishlistPicker(false);
                setShowCreateInput(false);
                setNewListName('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        await addToCart(book.id, quantity);
    };

    const toggleWishlistPicker = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (showWishlistPicker) {
            setShowWishlistPicker(false);
            setShowCreateInput(false);
            setNewListName('');
            return;
        }
        setShowWishlistPicker(true);
        setWishlistsLoading(true);
        try {
            const response = await api.get('/wishlists');
            setWishlists(response.data);
        } catch (error) {
            console.error('Error fetching wishlists:', error);
        } finally {
            setWishlistsLoading(false);
        }
    };

    const handleAddToWishlist = async (wishlistId) => {
        setAddingToId(wishlistId);
        try {
            await api.post(`/wishlists/${wishlistId}/books/${book.id}`);
            // Brief success indication then close
            setTimeout(() => {
                setAddingToId(null);
                setShowWishlistPicker(false);
            }, 600);
        } catch (error) {
            if (error.response?.status === 409) {
                // Book already in this wishlist — treat as success
                console.log('Book already in this wishlist');
            } else {
                console.error('Error adding to wishlist:', error);
            }
            setTimeout(() => {
                setAddingToId(null);
                setShowWishlistPicker(false);
            }, 600);
        }
    };

    const handleCreateAndAdd = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        try {
            const res = await api.post('/wishlists', { name: newListName.trim(), userId: user.id });
            const newWishlist = res.data;
            setNewListName('');
            setShowCreateInput(false);
            // Add book to the newly created wishlist
            await handleAddToWishlist(newWishlist.id);
            setWishlists(prev => [...prev, newWishlist]);
        } catch (error) {
            console.error('Error creating wishlist:', error);
            console.error('Status:', error.response?.status);
            console.error('Response data:', error.response?.data);
        }
    };

    if (loading) return <div className="loading-state">Loading book details...</div>;
    if (!book) return <div className="empty-state">Book not found.</div>;

    return (
        <div className="book-detail-page container">
            <button onClick={() => navigate(-1)} className="back-btn">
                <ArrowLeft size={20} /> Back to Browse
            </button>

            <div className="book-detail-grid">
                <div className="detail-image-col">
                    <div className="detail-image-container">
                        <img src={book.coverImageUrl || 'https://via.placeholder.com/400x600'} alt={book.title} />
                    </div>
                </div>

                <div className="detail-info-col">
                    <div className="detail-header">
                        <h1 className="detail-title">{book.title}</h1>
                        <p className="detail-author">by {book.author}</p>
                        <div className="detail-meta">
                            <span className="rating-badge">
                                <Star size={16} fill="currentColor" /> {book.averageRating?.toFixed(1) || 'N/A'}
                            </span>
                            <span className="genre-tag">{book.genre}</span>
                        </div>
                    </div>

                    <div className="detail-price-section">
                        <span className="price">${book.price?.toFixed(2)}</span>
                        <span className="status">{book.available ? 'In Stock' : 'Out of Stock'}</span>
                    </div>

                    <div className="detail-actions">
                        <div className="quantity-selector">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={quantity <= 1}
                            >-</button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>

                        <button
                            className="btn btn-primary add-cart-btn"
                            onClick={handleAddToCart}
                            disabled={!book.available}
                        >
                            <ShoppingCart size={20} /> Add to Cart
                        </button>

                        <div className="wishlist-picker-wrapper" ref={dropdownRef}>
                            <button
                                className={`btn btn-outline icon-only-btn ${showWishlistPicker ? 'active' : ''}`}
                                onClick={toggleWishlistPicker}
                                title="Add to Wishlist"
                            >
                                <Heart size={20} />
                            </button>

                            {showWishlistPicker && (
                                <div className="wishlist-dropdown">
                                    <div className="wishlist-dropdown-header">Add to Wishlist</div>

                                    {wishlistsLoading ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            Loading...
                                        </div>
                                    ) : (
                                        <div className="wishlist-dropdown-list">
                                            {wishlists.length > 0 ? (
                                                wishlists.map(list => (
                                                    <button
                                                        key={list.id}
                                                        className="wishlist-dropdown-item"
                                                        onClick={() => handleAddToWishlist(list.id)}
                                                        disabled={addingToId === list.id}
                                                    >
                                                        <span>{list.name}</span>
                                                        {addingToId === list.id ? (
                                                            <Check size={16} style={{ color: 'var(--success)' }} />
                                                        ) : (
                                                            <span className="item-count">{list.books?.length || 0}</span>
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    No wishlists yet
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="wishlist-dropdown-footer">
                                        {showCreateInput ? (
                                            <form className="wishlist-dropdown-create-form" onSubmit={handleCreateAndAdd}>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="List name"
                                                    value={newListName}
                                                    onChange={(e) => setNewListName(e.target.value)}
                                                    autoFocus
                                                />
                                                <button type="submit" className="btn btn-primary" disabled={!newListName.trim()}>
                                                    Add
                                                </button>
                                            </form>
                                        ) : (
                                            <button className="wishlist-dropdown-create" onClick={() => setShowCreateInput(true)}>
                                                <Plus size={16} /> Create new list
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="btn btn-outline icon-only-btn">
                            <Share2 size={20} />
                        </button>
                    </div>

                    <AISummary bookId={book.id} />

                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{book.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetail;

import { useState, useEffect } from 'react';
import { Trash2, ShoppingCart, Heart, Plus, Edit3, X, Check } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Wishlist.css';

const Wishlist = () => {
    const [wishlists, setWishlists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [creating, setCreating] = useState(false);
    const { addToCart } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        fetchWishlists();
    }, []);

    const fetchWishlists = async () => {
        try {
            const response = await api.get('/wishlists');
            setWishlists(response.data);
        } catch (error) {
            console.error('Error fetching wishlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWishlist = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        setCreating(true);
        try {
            await api.post('/wishlists', { name: newListName.trim(), userId: user.id });
            setNewListName('');
            setShowCreateForm(false);
            fetchWishlists();
        } catch (error) {
            console.error('Error creating wishlist:', error);
            console.error('Status:', error.response?.status);
            console.error('Response data:', error.response?.data);
        } finally {
            setCreating(false);
        }
    };

    const handleRenameWishlist = async (id) => {
        if (!editName.trim()) return;
        try {
            await api.put(`/wishlists/${id}`, { name: editName.trim() });
            setEditingId(null);
            setEditName('');
            fetchWishlists();
        } catch (error) {
            console.error('Error renaming wishlist:', error);
        }
    };

    const handleDeleteWishlist = async (id) => {
        if (!window.confirm('Delete this wishlist? This cannot be undone.')) return;
        try {
            await api.delete(`/wishlists/${id}`);
            fetchWishlists();
        } catch (error) {
            console.error('Error deleting wishlist:', error);
        }
    };

    const removeFromWishlist = async (wishlistId, bookId) => {
        try {
            await api.delete(`/wishlists/${wishlistId}/books/${bookId}`);
            fetchWishlists();
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const handleAddToCart = async (bookId) => {
        try {
            await addToCart(bookId, 1);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const startEditing = (list) => {
        setEditingId(list.id);
        setEditName(list.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
    };

    if (loading) return <div className="loading-state">Loading your wishlists...</div>;

    return (
        <div className="wishlist-page container">
            <div className="wishlist-header">
                <h1>My Wishlists</h1>
                {!showCreateForm && (
                    <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                        <Plus size={18} /> New Wishlist
                    </button>
                )}
            </div>

            {showCreateForm && (
                <form className="create-wishlist-form card" onSubmit={handleCreateWishlist}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Wishlist name (e.g. Sci-Fi Favorites)"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        autoFocus
                    />
                    <div className="create-form-actions">
                        <button type="submit" className="btn btn-primary" disabled={creating || !newListName.trim()}>
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                        <button type="button" className="btn btn-outline" onClick={() => { setShowCreateForm(false); setNewListName(''); }}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {wishlists.length > 0 ? (
                <div className="wishlist-grid">
                    {wishlists.map(list => (
                        <div key={list.id} className="wishlist-card card">
                            <div className="wishlist-card-header">
                                {editingId === list.id ? (
                                    <div className="edit-name-row">
                                        <input
                                            type="text"
                                            className="input edit-name-input"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleRenameWishlist(list.id);
                                                if (e.key === 'Escape') cancelEditing();
                                            }}
                                            autoFocus
                                        />
                                        <button className="icon-action save" onClick={() => handleRenameWishlist(list.id)} title="Save">
                                            <Check size={18} />
                                        </button>
                                        <button className="icon-action cancel" onClick={cancelEditing} title="Cancel">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2>{list.name}</h2>
                                        <div className="wishlist-card-actions">
                                            <button className="icon-action" onClick={() => startEditing(list)} title="Rename">
                                                <Edit3 size={16} />
                                            </button>
                                            <button className="icon-action delete" onClick={() => handleDeleteWishlist(list.id)} title="Delete wishlist">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <span className="wishlist-count">{list.books?.length || 0} books</span>

                            {list.books && list.books.length > 0 ? (
                                <div className="wishlist-items">
                                    {list.books.map(book => (
                                        <div key={book.id} className="wishlist-item">
                                            <img src={book.coverImageUrl || 'https://via.placeholder.com/80x120'} alt={book.title} className="wishlist-img" />
                                            <div className="wishlist-info">
                                                <h4>{book.title}</h4>
                                                <p className="book-author">{book.author}</p>
                                                <p className="price">${book.price?.toFixed(2)}</p>
                                                <div className="wishlist-actions">
                                                    <button onClick={() => handleAddToCart(book.id)} className="btn btn-sm btn-primary">
                                                        <ShoppingCart size={14} /> Add to Cart
                                                    </button>
                                                    <button onClick={() => removeFromWishlist(list.id, book.id)} className="btn btn-sm btn-outline btn-danger-outline">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-list-msg">No books in this wishlist yet.</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <Heart size={64} strokeWidth={1} />
                    <h2>No wishlists yet</h2>
                    <p>Create your first wishlist to start saving books you love.</p>
                    {!showCreateForm && (
                        <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                            <Plus size={18} /> Create Wishlist
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Wishlist;

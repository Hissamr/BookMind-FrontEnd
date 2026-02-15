import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './BookCard.css';

const BookCard = ({ book }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart(book.id, 1);
    };

    return (
        <div className="book-card" onClick={() => navigate(`/books/${book.id}`)}>
            <div className="book-image-container">
                <img src={book.coverImageUrl || 'https://via.placeholder.com/150'} alt={book.title} className="book-image" />
                <div className="book-overlay">
                    <button className="add-to-cart-btn" onClick={handleAddToCart}>
                        <ShoppingCart size={18} /> Add
                    </button>
                </div>
            </div>
            <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">{book.author}</p>
                <div className="book-footer">
                    <span className="book-price">${book.price?.toFixed(2)}</span>
                    <span className="book-rating">★ {book.averageRating?.toFixed(1) || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default BookCard;

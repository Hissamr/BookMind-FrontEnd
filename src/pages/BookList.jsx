import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import './BookList.css';

const BookList = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('All');

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        let result = books;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(book =>
                book.title.toLowerCase().includes(lowerQuery) ||
                book.author.toLowerCase().includes(lowerQuery)
            );
        }

        if (selectedGenre !== 'All') {
            result = result.filter(book => book.genre === selectedGenre);
        }

        setFilteredBooks(result);
    }, [searchQuery, selectedGenre, books]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/books');
            setBooks(response.data);
            setFilteredBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const genres = ['All', ...new Set(books.map(book => book.genre).filter(Boolean))];

    return (
        <div className="book-list-page container">
            <div className="list-header">
                <h1>Explore Books</h1>

                <div className="filters">
                    <div className="search-bar">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title or author..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input search-input"
                        />
                    </div>

                    <div className="genre-filter">
                        <Filter size={20} className="filter-icon" />
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="input select-input"
                        >
                            {genres.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading library...</div>
            ) : filteredBooks.length > 0 ? (
                <div className="book-grid">
                    {filteredBooks.map(book => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    No books found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default BookList;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import './Home.css';

const Home = () => {
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [topRatedBooks, setTopRatedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const [featuredRes, topRatedRes] = await Promise.all([
                    api.get('/books'), // Just taking recent ones as featured for now
                    api.get('/books/top-rated')
                ]);
                setFeaturedBooks(featuredRes.data.slice(0, 4));
                setTopRatedBooks(topRatedRes.data.slice(0, 4));
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    return (
        <div className="home-page">
            <section className="hero">
                <div className="container hero-content">
                    <h1>Discover Your Next <span className="text-gradient">Favorite Book</span></h1>
                    <p>Explore our vast collection of stories, knowledge, and adventures.</p>
                    <Link to="/books" className="btn btn-primary btn-lg">
                        Shop Now <ArrowRight size={20} className="ml-2" />
                    </Link>
                </div>
            </section>

            <section className="section container">
                <div className="section-header">
                    <h2>Featured Books</h2>
                    <Link to="/books" className="link-arrow">View All <ArrowRight size={16} /></Link>
                </div>
                <div className="book-grid">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        featuredBooks.map(book => <BookCard key={book.id} book={book} />)
                    )}
                </div>
            </section>

            <section className="section container">
                <div className="section-header">
                    <h2>Top Rated</h2>
                    <Link to="/books/top-rated" className="link-arrow">View All <ArrowRight size={16} /></Link>
                </div>
                <div className="book-grid">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        topRatedBooks.map(book => <BookCard key={book.id} book={book} />)
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import api from '../../services/api';
import './Admin.css';

const emptyBook = {
    title: '', author: '', description: '', genre: '',
    price: '', available: true, coverImageUrl: '',
    isbn: '', publisher: '', language: '', pages: '',
    publicationYear: '', averageRating: ''
};

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ ...emptyBook });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Summary state — tracks per-book action in progress
    const [summaryLoading, setSummaryLoading] = useState({}); // { bookId: 'generating' | 'deleting' }
    const [generatingAll, setGeneratingAll] = useState(false);

    useEffect(() => { fetchBooks(); }, []);

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            setBooks(res.data);
        } catch (err) {
            console.error('Error fetching books:', err);
        } finally {
            setLoading(false);
        }
    };

    // Force regenerate summary for a single book (admin only)
    const handleGenerateSummary = async (bookId) => {
        setSummaryLoading(prev => ({ ...prev, [bookId]: 'generating' }));
        try {
            await api.post(`/books/${bookId}/summary/generate`);
        } catch (err) {
            console.error('Error generating summary:', err);
            alert('Failed to generate summary.');
        } finally {
            setSummaryLoading(prev => {
                const next = { ...prev };
                delete next[bookId];
                return next;
            });
        }
    };

    // Delete cached summary for a single book (admin only)
    const handleDeleteSummary = async (bookId) => {
        setSummaryLoading(prev => ({ ...prev, [bookId]: 'deleting' }));
        try {
            await api.delete(`/books/${bookId}/summary`);
        } catch (err) {
            console.error('Error deleting summary:', err);
            alert('Failed to delete summary.');
        } finally {
            setSummaryLoading(prev => {
                const next = { ...prev };
                delete next[bookId];
                return next;
            });
        }
    };

    // Batch generate summaries for all books missing one (admin only)
    const handleGenerateAll = async () => {
        setGeneratingAll(true);
        try {
            const res = await api.post('/books/summaries/generate-all');
            const count = res.data?.count ?? res.data;
            alert(`Generated summaries for ${count} book(s).`);
        } catch (err) {
            console.error('Error generating all summaries:', err);
            alert('Failed to generate all summaries.');
        } finally {
            setGeneratingAll(false);
        }
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ ...emptyBook });
        setShowModal(true);
    };

    const openEdit = (book) => {
        setEditing(book);
        setForm({
            title: book.title || '',
            author: book.author || '',
            description: book.description || '',
            genre: book.genre || '',
            price: book.price || '',
            available: book.available ?? true,
            coverImageUrl: book.coverImageUrl || '',
            isbn: book.isbn || '',
            publisher: book.publisher || '',
            language: book.language || '',
            pages: book.pages || '',
            publicationYear: book.publicationYear || '',
            averageRating: book.averageRating || ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price) || 0,
                pages: form.pages ? parseInt(form.pages) : null,
                publicationYear: form.publicationYear ? parseInt(form.publicationYear) : null,
                averageRating: form.averageRating ? parseFloat(form.averageRating) : null
            };

            if (editing) {
                await api.put(`/books/${editing.id}`, payload);
            } else {
                await api.post('/books', payload);
            }
            setShowModal(false);
            fetchBooks();
        } catch (err) {
            console.error('Error saving book:', err);
            alert('Failed to save book. Check console for details.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/books/${id}`);
            setDeleteConfirm(null);
            fetchBooks();
        } catch (err) {
            console.error('Error deleting book:', err);
            alert('Failed to delete book.');
        }
    };

    const filtered = books.filter(b =>
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase()) ||
        b.genre?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="admin-loading">Loading books...</div>;

    return (
        <div>
            <div className="admin-section-header">
                <h2>Book Management</h2>
                <div className="filters-bar">
                    <div className="admin-search">
                        <Search size={18} />
                        <input
                            placeholder="Search books..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn-ai"
                        onClick={handleGenerateAll}
                        disabled={generatingAll}
                    >
                        {generatingAll ? (
                            <><Loader2 size={18} className="btn-spinner" /> Generating…</>
                        ) : (
                            <><Sparkles size={18} /> Generate All Summaries</>
                        )}
                    </button>
                    <button className="btn-success" onClick={openAdd}>
                        <Plus size={18} /> Add Book
                    </button>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Cover</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Genre</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th>Available</th>
                            <th>AI Summary</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(book => (
                            <tr key={book.id}>
                                <td>
                                    {book.coverImageUrl ? (
                                        <img src={book.coverImageUrl} alt="" className="book-thumb" />
                                    ) : (
                                        <div className="book-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BookOpen size={16} color="var(--text-muted)" />
                                        </div>
                                    )}
                                </td>
                                <td><strong>{book.title}</strong></td>
                                <td>{book.author}</td>
                                <td>{book.genre}</td>
                                <td>${book.price?.toFixed(2)}</td>
                                <td>⭐ {book.averageRating?.toFixed(1) || '—'}</td>
                                <td>
                                    <span className={`status-badge ${book.available ? 'delivered' : 'cancelled'}`}>
                                        {book.available ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>
                                    <div className="summary-actions">
                                        {summaryLoading[book.id] ? (
                                            <span className="summary-loading-label">
                                                <Loader2 size={14} className="btn-spinner" />
                                                {summaryLoading[book.id] === 'generating' ? 'Generating…' : 'Deleting…'}
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    className="btn-icon ai-generate-btn"
                                                    onClick={() => handleGenerateSummary(book.id)}
                                                    title="Force Regenerate Summary"
                                                >
                                                    <Sparkles size={14} />
                                                </button>
                                                <button
                                                    className="btn-icon danger"
                                                    onClick={() => handleDeleteSummary(book.id)}
                                                    title="Delete Summary"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-icon" onClick={() => openEdit(book)} title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        <button className="btn-icon danger" onClick={() => setDeleteConfirm(book)} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="9" className="admin-empty">No books found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>
                            <BookOpen size={20} />
                            {editing ? 'Edit Book' : 'Add New Book'}
                        </h2>

                        <div className="form-group">
                            <label>Title</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Author</label>
                                <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Genre</label>
                                <input value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>ISBN</label>
                                <input value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} placeholder="978-0-00-000000-0" />
                            </div>
                            <div className="form-group">
                                <label>Publisher</label>
                                <input value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Price ($)</label>
                                <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Pages</label>
                                <input type="number" value={form.pages} onChange={e => setForm({ ...form, pages: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Publication Year</label>
                                <input type="number" value={form.publicationYear} onChange={e => setForm({ ...form, publicationYear: e.target.value })} placeholder="2024" />
                            </div>
                            <div className="form-group">
                                <label>Language</label>
                                <input value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} placeholder="English" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Average Rating</label>
                                <input type="number" step="0.1" min="0" max="5" value={form.averageRating} onChange={e => setForm({ ...form, averageRating: e.target.value })} placeholder="4.5" />
                            </div>
                            <div className="form-group">
                                <label>Available</label>
                                <select value={form.available} onChange={e => setForm({ ...form, available: e.target.value === 'true' })}>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Cover Image URL</label>
                            <input value={form.coverImageUrl} onChange={e => setForm({ ...form, coverImageUrl: e.target.value })} placeholder="https://..." />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-success" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : (editing ? 'Update Book' : 'Add Book')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
                        <h2><Trash2 size={20} /> Delete Book</h2>
                        <p>Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?</p>
                        <p className="warn-text">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooks;

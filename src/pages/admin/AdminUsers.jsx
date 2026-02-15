import { useState, useEffect } from 'react';
import { Search, Users as UsersIcon, Mail, Calendar } from 'lucide-react';
import api from '../../services/api';
import './Admin.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = users.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="admin-loading">Loading users...</div>;

    return (
        <div>
            <div className="admin-section-header">
                <h2>User Management</h2>
                <div className="filters-bar">
                    <div className="admin-search">
                        <Search size={18} />
                        <input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Roles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? filtered.map(user => (
                            <tr key={user.id}>
                                <td>#{user.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <UsersIcon size={16} color="var(--text-muted)" />
                                        <strong>{user.username}</strong>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Mail size={14} color="var(--text-muted)" />
                                        {user.email}
                                    </div>
                                </td>
                                <td>
                                    {user.roles?.map((role, i) => (
                                        <span
                                            key={i}
                                            className={`role-badge ${role.includes('ADMIN') ? 'admin' : 'user'}`}
                                        >
                                            {role.replace('ROLE_', '')}
                                        </span>
                                    ))}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="admin-empty">No users found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;

// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Search, Trash2, Eye, Mail, Phone, Calendar } from 'lucide-react';
import styles from './users.module.css';

interface User {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    created_at: string;
    updated_at: string;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = users.filter(user =>
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            // Fetch user data from admin API
            const response = await fetch('/api/admin/users/list');
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch users');
            }
            const { users: mergedUsers } = await response.json();

            console.log('Fetched merged users:', mergedUsers);
            setUsers(mergedUsers);
            setFilteredUsers(mergedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This will also delete their bookings and reviews.')) {
            return;
        }
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId })
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error('Admin API delete error:', json);
                throw new Error(json?.error || 'Failed to delete user');
            }

            alert('User deleted successfully!');
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user via admin API:', error);
            alert(`Failed to delete user: ${error.message || 'Unknown error'}`);
        }
    };

    const viewUserDetails = (user: User) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>User Management</h1>
                    <p className={styles.pageSubtitle}>
                        Manage all registered users ({filteredUsers.length} total)
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className={styles.searchContainer}>
                <Search size={20} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* Users Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={styles.emptyState}>
                                    <Users size={48} />
                                    <p>No users found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>
                                                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <span>{user.full_name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || 'N/A'}</td>
                                    <td>{formatDate(user.created_at)}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button
                                                onClick={() => viewUserDetails(user)}
                                                className={styles.actionBtn}
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                title="Delete User"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Details Modal */}
            {showModal && selectedUser && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>User Details</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className={styles.closeButton}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.detailRow}>
                                <Users size={20} />
                                <div>
                                    <label>Full Name</label>
                                    <p>{selectedUser.full_name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className={styles.detailRow}>
                                <Mail size={20} />
                                <div>
                                    <label>Email</label>
                                    <p>{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className={styles.detailRow}>
                                <Phone size={20} />
                                <div>
                                    <label>Phone</label>
                                    <p>{selectedUser.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div className={styles.detailRow}>
                                <Calendar size={20} />
                                <div>
                                    <label>Joined Date</label>
                                    <p>{formatDate(selectedUser.created_at)}</p>
                                </div>
                            </div>

                            <div className={styles.detailRow}>
                                <Calendar size={20} />
                                <div>
                                    <label>Last Updated</label>
                                    <p>{formatDate(selectedUser.updated_at)}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                onClick={() => setShowModal(false)}
                                className={styles.secondaryButton}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteUser(selectedUser.id);
                                    setShowModal(false);
                                }}
                                className={styles.dangerButton}
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
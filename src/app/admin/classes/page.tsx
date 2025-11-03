// src/app/admin/classes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar, Plus, Edit2, Trash2, Clock, Users } from 'lucide-react';
import styles from './classes.module.css';

interface Class {
    id: number;
    name: string;
    description: string;
    schedule: string;
    duration_minutes: number;
    trainer_name: string;
    max_capacity?: number;
    category?: string;
    created_at: string;
}

export default function ClassesManagement() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [schedule, setSchedule] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('60');
    const [trainerName, setTrainerName] = useState('');
    const [capacity, setCapacity] = useState('20');
    const [category, setCategory] = useState('General');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .order('schedule', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Fetched classes:', data);
            setClasses(data || []);
            // derive categories for the admin filter
            const derived = ['All', ...new Set((data || []).map((c: any) => c.category || 'General'))];
            setCategories(derived as string[]);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (classData?: Class) => {
        if (classData) {
            setEditingClass(classData);
            setName(classData.name);
            setDescription(classData.description);
            setSchedule(classData.schedule);
            setDurationMinutes(String(classData.duration_minutes));
            setTrainerName(classData.trainer_name);
            setCapacity(String(classData.max_capacity || 20));
            setCategory(classData.category || 'General');
        } else {
            setEditingClass(null);
            setName('');
            setDescription('');
            setSchedule('');
            setDurationMinutes('60');
            setTrainerName('');
            setCapacity('20');
            setCategory('General');
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingClass(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = {
            name,
            description,
            schedule,
            duration_minutes: parseInt(durationMinutes) || 60,
            trainer_name: trainerName,
            max_capacity: parseInt(capacity) || 20,
            category: category || 'General'
        };

        console.log('Submitting form data (via admin API):', formData);

        try {
            const url = '/api/admin/classes';
            const method = editingClass ? 'PUT' : 'POST';
            const payload = editingClass ? { id: editingClass.id, ...formData } : formData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error('Admin API error:', json);
                throw new Error(json?.error || 'Failed to save class');
            }

            alert(editingClass ? 'Class updated successfully!' : 'Class created successfully!');
            handleCloseModal();
            fetchClasses();
        } catch (error: any) {
            console.error('Error saving class via admin API:', error);
            alert(`Failed to save class: ${error.message || 'Unknown error'}`);
        }
    };

    const handleDelete = async (classId: number) => {
        if (!confirm('Are you sure you want to delete this class? All bookings and reviews for this class will also be deleted.')) {
            return;
        }
        try {
            const res = await fetch('/api/admin/classes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: classId })
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error('Admin API delete error:', json);
                throw new Error(json?.error || 'Failed to delete class');
            }

            alert('Class deleted successfully!');
            fetchClasses();
        } catch (error: any) {
            console.error('Error deleting class via admin API:', error);
            alert(`Failed to delete class: ${error.message || 'Unknown error'}`);
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // filter classes by selected category (admin)
    const filteredClasses = selectedCategory === 'All'
        ? classes
        : classes.filter((c) => (c as any).category === selectedCategory);

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading classes...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Class Management</h1>
                    <p className={styles.pageSubtitle}>
                        Manage fitness classes ({classes.length} total)
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className={styles.primaryButton}
                >
                    <Plus size={20} />
                    Add New Class
                </button>
            </div>

            {/* Category filter for admin */}
            <div className={styles.categoryFilter} style={{ marginBottom: 16 }}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`${styles.categoryButton || ''} ${selectedCategory === cat ? styles.active || '' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                        style={{ marginRight: 8 }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className={styles.cardsGrid}>
                {classes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Calendar size={64} />
                        <p>No classes found</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className={styles.primaryButton}
                        >
                            Create First Class
                        </button>
                    </div>
                ) : (
                    filteredClasses.map((classItem) => (
                        <div key={classItem.id} className={styles.classCard}>
                            <div className={styles.classCardHeader}>
                                <h3>{classItem.name}</h3>
                                {classItem.category && (
                                    <small style={{ marginLeft: 8, color: '#666' }}>{classItem.category}</small>
                                )}
                                <div className={styles.cardActions}>
                                    <button
                                        onClick={() => handleOpenModal(classItem)}
                                        className={styles.iconButton}
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(classItem.id)}
                                        className={`${styles.iconButton} ${styles.deleteBtn}`}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <p className={styles.classDescription}>{classItem.description}</p>

                            <div className={styles.classDetails}>
                                <div className={styles.detailItem}>
                                    <Calendar size={16} />
                                    <span>{formatDateTime(classItem.schedule)}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <Clock size={16} />
                                    <span>{classItem.duration_minutes} min</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <Users size={16} />
                                    <span>Capacity: {classItem.max_capacity || 20}</span>
                                </div>
                            </div>

                            <div className={styles.trainerInfo}>
                                <strong>Trainer:</strong> {classItem.trainer_name}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
                            <button onClick={handleCloseModal} className={styles.closeButton}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Class Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="e.g., Morning Yoga"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Description *</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows={3}
                                        placeholder="Describe the class..."
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Schedule *</label>
                                        <input
                                            type="datetime-local"
                                            value={schedule}
                                            onChange={(e) => setSchedule(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Duration (minutes) *</label>
                                        <input
                                            type="number"
                                            value={durationMinutes}
                                            onChange={(e) => setDurationMinutes(e.target.value)}
                                            required
                                            min="15"
                                            max="180"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Trainer Name *</label>
                                        <input
                                            type="text"
                                            value={trainerName}
                                            onChange={(e) => setTrainerName(e.target.value)}
                                            required
                                            placeholder="Trainer's name"
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Capacity *</label>
                                        <input
                                            type="number"
                                            value={capacity}
                                            onChange={(e) => setCapacity(e.target.value)}
                                            required
                                            min="1"
                                            max="100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className={styles.secondaryButton}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.primaryButton}>
                                    {editingClass ? 'Update Class' : 'Create Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
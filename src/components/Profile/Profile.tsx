// src/components/Profile/Profile.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { UserProfile, ProfileFormData } from '@/types/profile';
import styles from './Profile.module.css';
import { User, Phone, Calendar, Target, Heart, UserCheck, Save, Edit, Camera, Loader2, Trash2 } from 'lucide-react';

export default function Profile() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [deletingAvatar, setDeletingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);
    const [avatarKey, setAvatarKey] = useState(0);
    const router = useRouter();

    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: '',
        phone: '',
        date_of_birth: '',
        fitness_goal: '',
        preferred_class_types: [],
        emergency_contact_name: '',
        emergency_contact_phone: ''
    });

    const fitnessGoals = [
        'Weight Loss',
        'Muscle Building',
        'General Fitness',
        'Strength Training',
        'Cardio Improvement',
        'Flexibility & Mobility',
        'Sports Performance',
        'Stress Relief'
    ];

    const classTypes = [
        'Yoga',
        'HIIT',
        'Cardio',
        'Strength',
        'Pilates',
        'Spin',
        'Boxing',
        'Dance',
        'Martial Arts',
        'Meditation'
    ];

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                router.push('/signup');
                return;
            }

            fetchProfile(session.user.id);
        };

        checkAuth();
    }, [router]);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (data) {
                setProfile(data);
                setFormData({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    date_of_birth: data.date_of_birth || '',
                    fitness_goal: data.fitness_goal || '',
                    preferred_class_types: data.preferred_class_types || [],
                    emergency_contact_name: data.emergency_contact_name || '',
                    emergency_contact_phone: data.emergency_contact_phone || ''
                });
                setImageError(false);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                router.push('/signup');
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: session.user.id,
                    ...formData,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            await fetchProfile(session.user.id);
            setEditing(false);
            alert('Profile updated successfully! 🎉');

        } catch (error: any) {
            console.error('Error saving profile:', error);
            setError('Failed to save profile: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            if (file.size > 400 * 1024) {
                alert('File size too large. Please choose an image under 400KB.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (JPEG, PNG, WebP).');
                return;
            }

            setUploading(true);
            setImageError(false);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                router.push('/signup');
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

            await deleteExistingAvatar();

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.user.id);

            if (updateError) throw updateError;

            setAvatarKey(prev => prev + 1);
            await fetchProfile(session.user.id);
            alert('Profile picture updated successfully! 🎉');

        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            alert('Failed to upload profile picture: ' + error.message);
        } finally {
            setUploading(false);
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const deleteExistingAvatar = async () => {
        if (!profile?.avatar_url) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const urlParts = profile.avatar_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const fullPath = `${session.user.id}/${fileName}`;

            await supabase.storage
                .from('avatars')
                .remove([fullPath]);

        } catch (error) {
            console.error('Error deleting old avatar:', error);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!profile?.avatar_url) {
            alert('No profile picture to delete.');
            return;
        }

        if (!confirm('Are you sure you want to remove your profile picture?')) {
            return;
        }

        setDeletingAvatar(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                router.push('/signup');
                return;
            }

            await deleteExistingAvatar();

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    avatar_url: null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', session.user.id);

            if (updateError) throw updateError;

            setAvatarKey(prev => prev + 1);
            await fetchProfile(session.user.id);
            alert('Profile picture removed successfully!');

        } catch (error: any) {
            console.error('Error deleting avatar:', error);
            alert('Failed to remove profile picture: ' + error.message);
        } finally {
            setDeletingAvatar(false);
        }
    };

    const toggleClassType = (classType: string) => {
        setFormData(prev => ({
            ...prev,
            preferred_class_types: prev.preferred_class_types.includes(classType)
                ? prev.preferred_class_types.filter(type => type !== classType)
                : [...prev.preferred_class_types, classType]
        }));
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleImageLoad = () => {
        setImageError(false);
    };

    if (loading) {
        return (
            <div className={styles.profileContainer}>
                <div className={styles.loadingState}>
                    <Loader2 className={styles.spinner} size={48} />
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profileContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    My <span className={styles.gradientText}>Profile</span>
                </h1>
                <p className={styles.subtitle}>
                    Manage your personal information and fitness preferences.
                </p>
            </div>

            {error && (
                <div className={styles.errorBanner}>
                    {error}
                </div>
            )}

            <div className={styles.profileContent}>
                {/* Avatar Section */}
                <div className={styles.avatarSection}>
                    <div className={styles.avatarContainer}>
                        <div className={styles.avatarWrapper}>
                            {profile?.avatar_url && !imageError ? (
                                <img
                                    key={avatarKey}
                                    src={`${profile.avatar_url}?t=${avatarKey}`}
                                    alt="Profile"
                                    className={styles.avatar}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    <User size={48} />
                                    {imageError && (
                                        <div className={styles.imageErrorText}>
                                            Failed to load image
                                        </div>
                                    )}
                                </div>
                            )}

                            {(uploading || deletingAvatar) && (
                                <div className={styles.uploadOverlay}>
                                    <Loader2 className={styles.spinner} size={24} />
                                    <span>{uploading ? 'Uploading...' : 'Removing...'}</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.avatarActions}>
                            <label className={styles.avatarUpload}>
                                <Camera size={16} />
                                {profile?.avatar_url ? 'Change Photo' : 'Upload Photo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={uploading || deletingAvatar}
                                    style={{ display: 'none' }}
                                />
                            </label>

                            {profile?.avatar_url && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    disabled={uploading || deletingAvatar}
                                    className={styles.deleteAvatarButton}
                                >
                                    {deletingAvatar ? (
                                        <Loader2 className={styles.spinner} size={16} />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                    {deletingAvatar ? 'Removing...' : 'Remove'}
                                </button>
                            )}
                        </div>

                        <div className={styles.fileInfo}>
                            <p>Maximum file size: 400KB</p>
                            <p>Supported formats: JPEG, PNG, WebP</p>
                        </div>
                    </div>
                </div>

                {/* Profile Form */}
                <div className={styles.formSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Personal Information</h2>
                        <button
                            onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                            disabled={saving || uploading || deletingAvatar}
                            className={styles.editButton}
                        >
                            {saving ? (
                                <Loader2 className={styles.spinner} size={16} />
                            ) : editing ? (
                                <Save size={16} />
                            ) : (
                                <Edit size={16} />
                            )}
                            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <User size={16} />
                                Full Name
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                    className={styles.input}
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <div className={styles.displayValue}>
                                    {profile?.full_name || 'Not set'}
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <Phone size={16} />
                                Phone Number
                            </label>
                            {editing ? (
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className={styles.input}
                                    placeholder="Enter your phone number"
                                />
                            ) : (
                                <div className={styles.displayValue}>
                                    {profile?.phone || 'Not set'}
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <Calendar size={16} />
                                Date of Birth
                            </label>
                            {editing ? (
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                                    className={styles.input}
                                />
                            ) : (
                                <div className={styles.displayValue}>
                                    {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not set'}
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <Target size={16} />
                                Fitness Goal
                            </label>
                            {editing ? (
                                <select
                                    value={formData.fitness_goal}
                                    onChange={(e) => setFormData(prev => ({ ...prev, fitness_goal: e.target.value }))}
                                    className={styles.input}
                                >
                                    <option value="">Select your fitness goal</option>
                                    {fitnessGoals.map(goal => (
                                        <option key={goal} value={goal}>{goal}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className={styles.displayValue}>
                                    {profile?.fitness_goal || 'Not set'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Heart size={16} />
                            Preferred Class Types
                        </label>
                        {editing ? (
                            <div className={styles.classTypesGrid}>
                                {classTypes.map(classType => (
                                    <button
                                        key={classType}
                                        type="button"
                                        onClick={() => toggleClassType(classType)}
                                        className={`${styles.classTypeButton} ${formData.preferred_class_types.includes(classType) ? styles.selected : ''
                                            }`}
                                    >
                                        {classType}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.displayValue}>
                                {profile?.preferred_class_types?.length ? (
                                    <div className={styles.classTypesDisplay}>
                                        {profile.preferred_class_types.join(', ')}
                                    </div>
                                ) : (
                                    'Not set'
                                )}
                            </div>
                        )}
                    </div>

                    <div className={styles.sectionHeader}>
                        <h2 style={{ paddingTop: '1.25rem' }}>Emergency Contact</h2>
                    </div>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <UserCheck size={16} />
                                Emergency Contact Name
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.emergency_contact_name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                                    className={styles.input}
                                    placeholder="Enter emergency contact name"
                                />
                            ) : (
                                <div className={styles.displayValue}>
                                    {profile?.emergency_contact_name || 'Not set'}
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <Phone size={16} />
                                Emergency Contact Phone
                            </label>
                            {editing ? (
                                <input
                                    type="tel"
                                    value={formData.emergency_contact_phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                                    className={styles.input}
                                    placeholder="Enter emergency contact phone"
                                />
                            ) : (
                                <div className={styles.displayValue}>
                                    {profile?.emergency_contact_phone || 'Not set'}
                                </div>
                            )}
                        </div>
                    </div>

                    {editing && (
                        <div className={styles.formActions}>
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving || uploading || deletingAvatar}
                                className={styles.saveButton}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className={styles.spinner} size={16} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save Profile
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    if (profile) {
                                        setFormData({
                                            full_name: profile.full_name || '',
                                            phone: profile.phone || '',
                                            date_of_birth: profile.date_of_birth || '',
                                            fitness_goal: profile.fitness_goal || '',
                                            preferred_class_types: profile.preferred_class_types || [],
                                            emergency_contact_name: profile.emergency_contact_name || '',
                                            emergency_contact_phone: profile.emergency_contact_phone || ''
                                        });
                                    }
                                }}
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
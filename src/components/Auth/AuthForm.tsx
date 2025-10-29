'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import styles from './AuthForm.module.css';

export default function AuthForm() {
    const [isSigningUp, setIsSigningUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isSigningUp) {
                // Sign Up Logic
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });

                if (error) throw error;

                setMessage('Account created successfully! Please log in.');
                setIsSigningUp(false);
                // Clear form
                setEmail('');
                setPassword('');
                setFullName('');
            } else {
                // Log In Logic
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) throw error;

                setMessage('Logged in successfully! Redirecting...');

                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <h2 className={styles.title}>
                    {isSigningUp ? 'Create Your Account' : 'Welcome Back'}
                </h2>
                <p className={styles.subtitle}>
                    {isSigningUp
                        ? 'Join 24 Fitness and start your journey.'
                        : 'Log in to access your account.'}
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {isSigningUp && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="fullName">Full Name</label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                placeholder="John Doe"
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading
                            ? 'Processing...'
                            : isSigningUp
                                ? 'Sign Up'
                                : 'Log In'}
                    </button>
                </form>

                {message && (
                    <p className={`${styles.message} ${message.includes('Error') ? styles.error : styles.success}`}>
                        {message}
                    </p>
                )}

                <div className={styles.toggleMode}>
                    <button
                        onClick={() => {
                            setIsSigningUp(!isSigningUp);
                            setMessage('');
                            setEmail('');
                            setPassword('');
                            setFullName('');
                        }}
                        className={styles.toggleButton}
                    >
                        {isSigningUp
                            ? 'Already have an account? Log In'
                            : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
        </div>
    );
}
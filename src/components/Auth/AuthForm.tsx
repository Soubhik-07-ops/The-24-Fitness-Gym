'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// 1. IMPORT PATH UPDATED
import { supabase } from '@/lib/supabaseClient';
import styles from './AuthForm.module.css';

export default function AuthForm() {
    const [isSigningUp, setIsSigningUp] = useState(true); // Toggle between Sign Up and Log In
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // To show success or error messages
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(''); // Clear previous messages

        try {
            if (isSigningUp) {
                // Sign Up Logic
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });

                if (error) throw error;
                setMessage('Account created successfully! Please log in.');
                setIsSigningUp(false); // Switch to log in view
            } else {
                // Log In Logic
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) throw error;

                // 2. REDIRECT LOGIC ADDED
                setMessage('Logged in successfully! Redirecting...');

                // Redirect to homepage after a short delay
                setTimeout(() => {
                    router.push('/'); // Go to homepage
                    router.refresh(); // Force a refresh to update server components
                }, 1000);
            }
        } catch (error: any) {
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

                {message && <p className={styles.message}>{message}</p>}

                <div className={styles.toggleMode}>
                    <button
                        onClick={() => setIsSigningUp(!isSigningUp)}
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
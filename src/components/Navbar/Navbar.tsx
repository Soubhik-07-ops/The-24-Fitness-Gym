'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Dumbbell } from 'lucide-react'
import styles from './Navbar.module.css'
import { supabase } from '@/lib/supabaseClient'
import { type User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

    const menuItems = ['Home', 'Features', 'Membership', 'Trainers', 'Contact']

    // ✅ Handle mount + auth + responsive behavior
    useEffect(() => {
        setMounted(true)

        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
        }
        getSession()

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            router.refresh()
        })

        // ✅ Listen for resize AFTER mount
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isOpen) {
                setIsOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)

        return () => {
            authListener.subscription.unsubscribe()
            window.removeEventListener('resize', handleResize)
        }
    }, [router, isOpen]) // <— add `isOpen` here to respond to state changes

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setIsOpen(false)
        router.push('/')
    }

    if (!mounted) return null

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {/* Logo */}
                <div className={styles.logo} onClick={() => router.push('/')}>
                    <Dumbbell size={28} color="#f97316" />
                    <span className={styles.logoText}>24 FITNESS</span>
                </div>

                {/* Desktop Menu */}
                <div className={styles.desktopMenu}>
                    {menuItems.map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className={styles.menuItem}>
                            {item}
                        </a>
                    ))}
                    {user && (
                        <a href="/dashboard" className={styles.menuItem}>
                            Dashboard
                        </a>
                    )}
                    {user ? (
                        <button onClick={handleLogout} className={styles.joinButton}>
                            Log Out
                        </button>
                    ) : (
                        <a href="/signup" className={styles.joinButton}>
                            Join Now
                        </a>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className={styles.mobileMenuButton}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className={styles.mobileMenu}
                    >
                        <div className={styles.mobileMenuInner}>
                            {menuItems.map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className={styles.mobileMenuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item}
                                </a>
                            ))}
                            {user && (
                                <a
                                    href="/dashboard"
                                    className={styles.mobileMenuItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    Dashboard
                                </a>
                            )}
                            <div className={styles.mobileButtonContainer}>
                                {user ? (
                                    <button onClick={handleLogout} className={styles.mobileJoinButton}>
                                        Log Out
                                    </button>
                                ) : (
                                    <a href="/signup" className={styles.mobileJoinButton}>
                                        Join Now
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}

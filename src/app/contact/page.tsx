'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ContactBox from '@/components/Contact/ContactBox';
import { Mail, Phone, Clock, MessageSquare, HelpCircle, Shield, Zap, MapPin } from 'lucide-react';
import styles from './contact.module.css';

export default function ContactPage() {
    const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

    useEffect(() => {
        const check = async () => {
            const { data } = await supabase.auth.getUser();
            setIsAuthed(!!data.user);
        };
        check();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            check();
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    return (
        <>
            <Navbar />
            <main className={styles.contactPage}>
                {/* Hero Section */}
                <section className={styles.heroSection}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.heroTitle}>Get In Touch</h1>
                        <p className={styles.heroSubtitle}>
                            Have questions? We're here to help! Reach out to our team and we'll get back to you as soon as possible.
                        </p>
                    </div>
                </section>

                {/* Info Cards Section */}
                <section className={styles.infoSection}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>
                                <MessageSquare size={32} />
                            </div>
                            <h3 className={styles.infoTitle}>Quick Response</h3>
                            <p className={styles.infoText}>
                                Our team typically responds within 24 hours. We're committed to helping you with any questions or concerns.
                            </p>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>
                                <Shield size={32} />
                            </div>
                            <h3 className={styles.infoTitle}>Secure & Private</h3>
                            <p className={styles.infoText}>
                                Your messages are encrypted and secure. We respect your privacy and handle all communications with care.
                            </p>
                        </div>

                        <div className={styles.infoCard}>
                            <div className={styles.infoIcon}>
                                <Zap size={32} />
                            </div>
                            <h3 className={styles.infoTitle}>Real-Time Chat</h3>
                            <p className={styles.infoText}>
                                Once your request is approved, chat directly with our admin team in real-time for instant support.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Form Section */}
                <section className={styles.formSection}>
                    {isAuthed === null ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loadingSpinner}></div>
                            <p className={styles.loadingText}>Loading...</p>
                        </div>
                    ) : (
                        <ContactBox isAuthed={isAuthed} />
                    )}
                </section>

                {/* Contact Details Section */}
                <section className={styles.detailsSection}>
                    <div className={styles.detailsGrid}>
                        <div className={styles.detailCard}>
                            <MapPin className={styles.detailIcon} size={24} />
                            <h4 className={styles.detailTitle}>Visit Us</h4>
                            <a href="https://maps.app.goo.gl/uoNrsabeKA6xAAMp6" target="_blank" rel="noopener noreferrer" className={styles.detailLink}>
                                Digwadih no. 10 near gobinda sweets old sbi building
                            </a>
                        </div>

                        <div className={styles.detailCard}>
                            <Mail className={styles.detailIcon} size={24} />
                            <h4 className={styles.detailTitle}>Email Us</h4>
                            <a href="mailto:The24ditness8055@gmail.com" className={styles.detailLink}>The24ditness8055@gmail.com</a>
                        </div>

                        <div className={styles.detailCard}>
                            <Phone className={styles.detailIcon} size={24} />
                            <h4 className={styles.detailTitle}>Call Us</h4>
                            <a href="tel:8084548055" className={styles.detailLink}>8084548055</a>
                            <p className={styles.detailText}>Available 24/6</p>
                        </div>

                        <div className={styles.detailCard}>
                            <Clock className={styles.detailIcon} size={24} />
                            <h4 className={styles.detailTitle}>Response Time</h4>
                            <p className={styles.detailText}>Within 24 hours</p>
                            <p className={styles.detailText}>Monday - Saturday</p>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}



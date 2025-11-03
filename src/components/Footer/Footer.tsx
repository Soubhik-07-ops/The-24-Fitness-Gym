'use client'

import { Dumbbell, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.mainFooter}>
                    {/* Brand Section */}
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <Dumbbell size={32} color="#f97316" />
                            <span className={styles.logoText}>THE 24 FITNESS</span>
                        </div>
                        <p className={styles.description}>
                            Your premier the 24/7 fitness destination. Transform your body,
                            mind, and life with state-of-the-art equipment and expert guidance.
                        </p>
                        <div className={styles.socialLinks}>
                            <a href="#" className={styles.socialLink} aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="Twitter">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="YouTube">
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.footerSection}>
                        <h3>Quick Links</h3>
                        <div className={styles.footerLinks}>
                            <a href="#home" className={styles.footerLink}>Home</a>
                            <a href="#features" className={styles.footerLink}>Features</a>
                            <a href="#membership" className={styles.footerLink}>Membership</a>
                            <a href="#trainers" className={styles.footerLink}>Trainers</a>
                            <a href="#testimonials" className={styles.footerLink}>Success Stories</a>
                        </div>
                    </div>

                    {/* Programs */}
                    <div className={styles.footerSection}>
                        <h3>Programs</h3>
                        <div className={styles.footerLinks}>
                            <a href="#" className={styles.footerLink}>Personal Training</a>
                            <a href="#" className={styles.footerLink}>Group Classes</a>
                            <a href="#" className={styles.footerLink}>Nutrition Coaching</a>
                            <a href="#" className={styles.footerLink}>Recovery Services</a>
                            <a href="#" className={styles.footerLink}>Corporate Wellness</a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.footerSection}>
                        <h3>Contact Us</h3>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <MapPin size={18} />
                                <span>123 Fitness Street, Gym City, GC 12345</span>
                            </div>
                            <div className={styles.contactItem}>
                                <Phone size={18} />
                                <span>(555) 123-4567</span>
                            </div>
                            <div className={styles.contactItem}>
                                <Mail size={18} />
                                <span>info@24fitnessgym.com</span>
                            </div>
                            <div className={styles.contactItem}>
                                <Dumbbell size={18} />
                                <span>Open 24/6 • 313 Days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className={styles.bottomFooter}>
                    <div className={styles.copyright}>
                        © 2024 The 24 Fitness Gym. All rights reserved.
                    </div>
                    <div className={styles.legalLinks}>
                        <a href="#" className={styles.legalLink}>Privacy Policy</a>
                        <a href="#" className={styles.legalLink}>Terms of Service</a>
                        <a href="#" className={styles.legalLink}>Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
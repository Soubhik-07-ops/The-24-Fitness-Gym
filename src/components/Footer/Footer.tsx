'use client'

import Link from 'next/link'
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
                            <a href="https://www.facebook.com/share/1GfHNP7Pus/" className={styles.socialLink} aria-label="Facebook" target="_blank">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className={styles.socialLink} aria-label="Twitter" target="_blank">
                                <Twitter size={20} />
                            </a>
                            <a href="https://www.instagram.com/healthy_hustler_27?utm_source=qr&igsh=ZndlOHZmN2Fzd2M2" className={styles.socialLink} aria-label="Instagram" target="_blank">
                                <Instagram size={20} />
                            </a>
                            <a href="https://youtube.com/@the24fitness?si=9hOxMV5hvG9Wd7rV" className={styles.socialLink} aria-label="YouTube" target="_blank">
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.footerSection}>
                        <h3>Quick Links</h3>
                        <div className={styles.footerLinks}>
                            <Link href="/" className={styles.footerLink}>Home</Link>
                            <Link href="/features" className={styles.footerLink}>Features</Link>
                            <Link href="/membership" className={styles.footerLink}>Membership</Link>
                            <Link href="/trainers" className={styles.footerLink}>Trainers</Link>
                            <Link href="/contact" className={styles.footerLink}>Contact</Link>
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
                                <a href="https://maps.app.goo.gl/uoNrsabeKA6xAAMp6" target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                                    Digwadih No. 10, near Gobinda sweets, Old SBI Building
                                </a>
                            </div>
                            <div className={styles.contactItem}>
                                <Phone size={18} />
                                <a href="tel:8084548055" className={styles.contactLink}>8084548055</a>
                            </div>
                            <div className={styles.contactItem}>
                                <Mail size={18} />
                                <a href="mailto:The24ditness8055@gmail.com" className={styles.contactLink}>The24ditness8055@gmail.com</a>
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
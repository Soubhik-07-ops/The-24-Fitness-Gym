import { Metadata } from 'next'
import styles from './Contact.module.css'
import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'

export const metadata: Metadata = {
    title: 'Contact Us - Get in Touch',
    description: 'Reach out to our fitness experts. We are here to answer your questions and help you start your fitness journey.',
}

export default function ContactPage() {
    return (
        <>
            <Navbar />
            <main className={styles.contactPage}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>
                            Get In <span className={styles.highlight}>Touch</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Have questions? We are here to help. Reach out to our team and start your fitness journey today.
                        </p>
                    </div>

                    <div className={styles.contactContent}>
                        <div className={styles.contactInfo}>
                            <h2 className={styles.infoTitle}>Contact Information</h2>
                            <div className={styles.infoItem}>
                                <h3>Address</h3>
                                <p>123 Fitness Street<br />Sports City, FC 12345</p>
                            </div>
                            <div className={styles.infoItem}>
                                <h3>Phone</h3>
                                <p>(555) 123-4567</p>
                            </div>
                            <div className={styles.infoItem}>
                                <h3>Email</h3>
                                <p>info@fitnessgym.com</p>
                            </div>
                            <div className={styles.infoItem}>
                                <h3>Hours</h3>
                                <p>24/7 Access for Members<br />Staffed: 5:00 AM - 11:00 PM</p>
                            </div>
                        </div>

                        <div className={styles.contactForm}>
                            <h2 className={styles.formTitle}>Send us a Message</h2>
                            <form className={styles.form}>
                                <div className={styles.formGroup}>
                                    <input type="text" placeholder="Your Name" className={styles.formInput} />
                                </div>
                                <div className={styles.formGroup}>
                                    <input type="email" placeholder="Your Email" className={styles.formInput} />
                                </div>
                                <div className={styles.formGroup}>
                                    <input type="text" placeholder="Subject" className={styles.formInput} />
                                </div>
                                <div className={styles.formGroup}>
                                    <textarea placeholder="Your Message" rows={5} className={styles.formTextarea}></textarea>
                                </div>
                                <button type="submit" className={styles.submitButton}>
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
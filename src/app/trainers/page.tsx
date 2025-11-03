import { Metadata } from 'next'
import styles from './Trainers.module.css'
import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'

export const metadata: Metadata = {
    title: 'Our Trainers - Expert Fitness Coaching',
    description: 'Meet our certified personal trainers and fitness experts dedicated to helping you achieve your goals.',
}

export default function TrainersPage() {
    return (
        <>
            <Navbar />
            <main className={styles.trainersPage}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>
                            Meet Our <span className={styles.highlight}>Expert Trainers</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Certified professionals dedicated to helping you achieve your fitness goals with personalized training programs.
                        </p>
                    </div>

                    <div className={styles.trainersGrid}>
                        {/* Trainer cards will go here */}
                        <div className={styles.comingSoon}>
                            <h2>Trainers Section Coming Soon</h2>
                            <p>We're assembling the best team of fitness professionals for you!</p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
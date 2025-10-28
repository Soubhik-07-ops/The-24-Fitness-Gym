'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, Star, Users, Clock, Award } from 'lucide-react'
import styles from './Hero.module.css'

export default function Hero() {
    return (
        <section className={styles.hero}>
            {/* Background Elements */}
            <div className={styles.backgroundElements}>
                <div className={styles.orangeBlob}></div>
                <div className={styles.purpleBlob}></div>
            </div>

            <div className={styles.container}>
                {/* Badge */}
                <motion.div
                    className={styles.badge}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Star size={20} color="#f97316" />
                    <span className={styles.badgeText}>#1 Rated Gym in the City</span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    className={styles.mainHeading}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className={styles.gradientText}>24</span>
                    <br />
                    FITNESS GYM
                </motion.h1>

                <motion.p
                    className={styles.subtitle}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    Transform your body, mind, and life at our premium{' '}
                    <span className={styles.highlight}>24/7 fitness sanctuary</span>.
                    Where every hour is your hour to shine.
                </motion.p>

                {/* Stats */}
                <motion.div
                    className={styles.stats}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <div className={styles.statItem}>
                        <Users size={32} color="#f97316" style={{ margin: '0 auto 0.5rem' }} />
                        <div className={styles.statValue}>5000+</div>
                        <div className={styles.statLabel}>Happy Members</div>
                    </div>
                    <div className={styles.statItem}>
                        <Clock size={32} color="#f97316" style={{ margin: '0 auto 0.5rem' }} />
                        <div className={styles.statValue}>24/7</div>
                        <div className={styles.statLabel}>Open Always</div>
                    </div>
                    <div className={styles.statItem}>
                        <Award size={32} color="#f97316" style={{ margin: '0 auto 0.5rem' }} />
                        <div className={styles.statValue}>15+</div>
                        <div className={styles.statLabel}>Expert Trainers</div>
                    </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    className={styles.buttons}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <button className={styles.primaryButton}>
                        Start Free Trial
                        <ArrowRight size={20} />
                    </button>

                    <button className={styles.secondaryButton}>
                        <Play size={20} />
                        Virtual Tour
                    </button>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className={styles.scrollIndicator}
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className={styles.scrollText}>Scroll to explore</div>
                <div className={styles.scrollBar}>
                    <motion.div
                        className={styles.scrollDot}
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </section>
    )
}
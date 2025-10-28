'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import {
    Clock,
    Users,
    Dumbbell,
    Heart,
    Trophy,
    Shield,
    Zap,
    Activity
} from 'lucide-react'
import styles from './Features.module.css'

const features = [
    {
        icon: Clock,
        title: '24/7 Smart Access',
        description: 'Biometric entry system with mobile app control. Work out whenever inspiration strikes.',
        color: 'iconContainerBlue'
    },
    {
        icon: Dumbbell,
        title: 'AI-Powered Equipment',
        description: 'Smart machines that track your progress and adjust resistance automatically.',
        color: 'iconContainerPurple'
    },
    {
        icon: Users,
        title: 'Elite Training Team',
        description: 'Certified experts with specialized training in strength, cardio, and rehabilitation.',
        color: 'iconContainerGreen'
    },
    {
        icon: Activity,
        title: 'Body Composition Scan',
        description: 'Advanced InBody scans to track muscle mass, body fat, and metabolic age.',
        color: 'iconContainerOrange'
    },
    {
        icon: Heart,
        title: 'Recovery Zone',
        description: 'Cryotherapy, massage chairs, and hydro-massage for optimal recovery.',
        color: 'iconContainerRed'
    },
    {
        icon: Trophy,
        title: 'Challenges & Community',
        description: 'Monthly fitness challenges with prizes and a supportive community.',
        color: 'iconContainerYellow'
    },
    {
        icon: Shield,
        title: 'Safety First',
        description: '24/7 security, emergency buttons, and certified staff always on site.',
        color: 'iconContainerGray'
    },
    {
        icon: Zap,
        title: 'Virtual Classes',
        description: 'Live-streamed and on-demand classes for when you cant make it in person.',
        color: 'iconContainerIndigo'
    }
]

export default function Features() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section ref={ref} className={styles.features}>
            {/* Background Decoration */}
            <div className={styles.backgroundDecoration}>
                <div className={styles.decorationCircle + ' ' + styles.circle1}></div>
                <div className={styles.decorationCircle + ' ' + styles.circle2}></div>
            </div>

            <div className={styles.container}>
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className={styles.title}>
                        <span className={styles.gradientText}>Revolutionary</span>{' '}
                        Fitness Experience
                    </h2>
                    <p className={styles.subtitle}>
                        We've reimagined everything about the gym experience with cutting-edge technology
                        and unparalleled member support.
                    </p>
                </motion.div>

                <div className={styles.featuresGrid}>
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className={styles.featureCard}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={styles.featureContent}>
                                <div className={`${styles.iconContainer} ${styles[feature.color]}`}>
                                    <feature.icon size={24} color="white" />
                                </div>
                                <h3 className={styles.featureTitle}>
                                    {feature.title}
                                </h3>
                                <p className={styles.featureDescription}>
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
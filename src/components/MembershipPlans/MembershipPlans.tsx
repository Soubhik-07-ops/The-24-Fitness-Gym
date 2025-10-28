'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './MembershipPlans.module.css'

const plans = [
    {
        name: 'Basic',
        price: '$29',
        period: '/month',
        popular: false,
        features: [
            '24/7 Gym Access',
            'Standard Equipment',
            'Locker Room Access',
            'Free Wi-Fi',
            'Basic Fitness Assessment'
        ]
    },
    {
        name: 'Premium',
        price: '$49',
        period: '/month',
        popular: true,
        features: [
            'All Basic Features',
            'Premium Equipment Access',
            'Group Classes',
            'Personal Trainer Discount',
            'Nutrition Guidance',
            'Progress Tracking'
        ]
    },
    {
        name: 'Elite',
        price: '$79',
        period: '/month',
        popular: false,
        features: [
            'All Premium Features',
            'Unlimited Personal Training',
            'Advanced Body Analysis',
            'Recovery Services',
            'Priority Booking',
            'Elite Member Events'
        ]
    }
]

export default function MembershipPlans() {
    const ref = useRef<HTMLElement | null>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    const SWITCH_WIDTH = 1024
    const [isSwipeable, setIsSwipeable] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const onResize = () => setIsSwipeable(window.innerWidth < SWITCH_WIDTH)
        onResize()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    // 👇 Auto-center Premium card when visible
    useEffect(() => {
        if (!isInView || !gridRef.current) return

        const timer = setTimeout(() => {
            if (isSwipeable && gridRef.current) {
                const cards = gridRef.current.querySelectorAll<HTMLElement>(`.${styles.planCard}`)
                const premiumIndex = plans.findIndex((p) => p.popular)
                const premiumCard = cards[premiumIndex]
                if (premiumCard && gridRef.current) {
                    gridRef.current.scrollTo({
                        left: premiumCard.offsetLeft - (gridRef.current.clientWidth - premiumCard.clientWidth) / 2,
                        behavior: 'smooth'
                    })
                    setActiveIndex(premiumIndex)
                }
            } else {
                setActiveIndex(plans.findIndex((p) => p.popular))
            }
        }, 400)

        return () => clearTimeout(timer)
    }, [isInView, isSwipeable])

    // 👇 Track which card is centered in swipe mode
    useEffect(() => {
        if (!isSwipeable || !gridRef.current) return
        const container = gridRef.current
        const cards = Array.from(container.querySelectorAll<HTMLElement>(`.${styles.planCard}`))
        if (!cards.length) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = cards.indexOf(entry.target as HTMLElement)
                        if (idx >= 0) setActiveIndex(idx)
                    }
                })
            },
            { root: container, threshold: 0.6 }
        )

        cards.forEach((c) => observer.observe(c))
        return () => observer.disconnect()
    }, [isSwipeable])

    const scrollToIndex = (idx: number) => {
        if (!gridRef.current) return
        const cards = Array.from(gridRef.current.querySelectorAll<HTMLElement>(`.${styles.planCard}`))
        const target = cards[idx]
        if (!target) return
        gridRef.current.scrollTo({
            left: target.offsetLeft - (gridRef.current.clientWidth - target.clientWidth) / 2,
            behavior: 'smooth'
        })
    }

    const next = () => scrollToIndex(Math.min(activeIndex + 1, plans.length - 1))
    const prev = () => scrollToIndex(Math.max(activeIndex - 1, 0))

    return (
        <section ref={ref} className={styles.membership}>
            <div className={styles.backgroundElements}>
                <div className={`${styles.floatingCircle} ${styles.circle1}`} />
                <div className={`${styles.floatingCircle} ${styles.circle2}`} />
                <div className={`${styles.floatingCircle} ${styles.circle3}`} />
            </div>

            <div className={styles.container}>
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className={styles.title}>Membership Plans</h2>
                    <p className={styles.subtitle}>
                        Choose the perfect plan that fits your fitness goals and budget. All plans include 24/7 access to our premium facilities.
                    </p>
                </motion.div>

                <div className={styles.controlsRow}>
                    <div
                        ref={gridRef}
                        className={`${styles.plansGrid} ${isSwipeable ? styles.swipeMode : styles.gridMode}`}
                    >
                        {plans.map((plan, idx) => (
                            <article
                                key={plan.name}
                                className={`${styles.planCard} ${plan.popular ? styles.planCardPopular : ''}`}
                            >
                                {plan.popular && (
                                    <div className={styles.popularBadge}>
                                        <Star size={16} fill="currentColor" />
                                        Most Popular
                                    </div>
                                )}
                                <div className={styles.planHeader}>
                                    <h3 className={styles.planName}>{plan.name}</h3>
                                    <div className={styles.planPrice}>
                                        <span className={styles.price}>{plan.price}</span>
                                        <span className={styles.period}>{plan.period}</span>
                                    </div>
                                </div>
                                <div className={styles.featuresList}>
                                    {plan.features.map((f) => (
                                        <div key={f} className={styles.featureItem}>
                                            <Check size={18} className={styles.featureIcon} />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className={`${styles.getStartedButton} ${plan.popular ? styles.buttonPopular : plan.name === 'Basic' ? styles.buttonBasic : styles.buttonElite
                                        }`}
                                >
                                    Get Started
                                </button>
                            </article>
                        ))}
                    </div>
                </div>

                {isSwipeable && (
                    <div className={styles.swipeControls}>
                        <button className={styles.navButton} onClick={prev} disabled={activeIndex === 0}>
                            <ChevronLeft />
                        </button>
                        <div className={styles.dots}>
                            {plans.map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
                                    onClick={() => scrollToIndex(i)}
                                />
                            ))}
                        </div>
                        <button
                            className={styles.navButton}
                            onClick={next}
                            disabled={activeIndex === plans.length - 1}
                        >
                            <ChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}

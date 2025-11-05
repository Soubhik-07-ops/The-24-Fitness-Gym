import Features from '@/components/Features/Features'
import Footer from '@/components/Footer/Footer'
import Navbar from '@/components/Navbar/Navbar'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Features - Our Premium Gym Facilities',
    description: 'Discover our revolutionary fitness experience with AI-powered equipment, 24/7 smart access, and elite training facilities.',
}

export default function FeaturesPage() {
    return (
        <>
            <Navbar />
            <main>
                <Features />
                {/* You can add more sections specific to the features page here */}
            </main>
            <Footer />
        </>
    )
}
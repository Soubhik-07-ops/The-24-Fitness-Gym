// src/app/dashboard/page.tsx

import Dashboard from '@/components/Dashboard/Dashboard';
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/Navbar/Navbar';

export default function DashboardPage() {
    return (
        <>
            <Navbar />
            <main>
                <Dashboard />
            </main>
            <Footer />
        </>
    );
}
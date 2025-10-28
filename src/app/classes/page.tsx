// src/app/classes/page.tsx

import ClassList from '@/components/Classes/ClassList';
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/Navbar/Navbar';

export default function ClassesPage() {
    return (
        <>
            <Navbar />
            <main>
                <ClassList />
            </main>
            <Footer />
        </>

    );
}
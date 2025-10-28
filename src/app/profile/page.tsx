import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/Navbar";
import Profile from "@/components/Profile/Profile";

export default function profilePage() {
    return (
        <>
            <Navbar />
            <main>
                <Profile />
            </main>
            <Footer />
        </>
    );
}
// src/app/page.tsx (HOME PAGE WITH NAVBAR/FOOTER)
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import Features from '@/components/Features/Features';
import Testimonials from '@/components/Testimonials/Testimonials';
import Hero from '@/components/Hero_section/Hero';
import CTASection from '@/components/CTASection/CTASection';
import MembershipPlans from '@/components/MembershipPlans/MembershipPlans';
import Stats from '@/components/Stats/Stats';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <MembershipPlans />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
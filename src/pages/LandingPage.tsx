import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import ServicesSection from '../components/ServicesSection'
import BarbersSection from '../components/BarbersSection'
import GallerySection from '../components/GallerySection'
import ReviewsSection from '../components/ReviewsSection'
import LocationSection from '../components/LocationSection'
import Footer from '../components/Footer'
import BookNowButton from '../components/BookNowButton'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-primary text-surface font-arabic">
      <Navbar />
      <main>
        <HeroSection />
        <GallerySection />
        <ReviewsSection />
        <BarbersSection />
        <ServicesSection />
        <LocationSection />
      </main>
      <Footer />

      {/* Sticky floating Book Now — mobile only (T-23) */}
      <div className="fixed bottom-5 inset-x-0 flex justify-center z-40 sm:hidden pointer-events-none">
        <div className="pointer-events-auto">
          <BookNowButton size="default" className="shadow-[0_0_30px_rgba(201,168,76,0.4)]" />
        </div>
      </div>
    </div>
  )
}
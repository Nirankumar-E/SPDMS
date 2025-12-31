import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import MainContent from '@/components/layout/main-content';
import RightSidebar from '@/components/layout/right-sidebar';
import HelplineBar from '@/components/layout/helpline-bar';
import MobileAppBanner from '@/components/layout/mobile-app-banner';
import Footer from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-2">
            <LeftSidebar />
          </aside>
          <section className="lg:col-span-7">
            <MainContent />
          </section>
          <aside className="lg:col-span-3">
            <RightSidebar />
          </aside>
        </div>
      </main>
      <HelplineBar />
      <MobileAppBanner />
      <Footer />
    </div>
  );
}

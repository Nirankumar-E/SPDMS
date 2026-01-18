'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import MainContent from '@/components/layout/main-content';
import RightSidebar from '@/components/layout/right-sidebar';
import HelplineBar from '@/components/layout/helpline-bar';
import MobileAppBanner from '@/components/layout/mobile-app-banner';
import Footer from '@/components/layout/footer';
import { translations, Language } from '@/lib/i18n';

export default function Home() {
  const [language, setLanguage] = useState<Language>('TA');
  const i18n = translations[language];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        i18n={i18n.header}
      />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-2 order-2 lg:order-1">
            <LeftSidebar i18n={i18n.leftSidebar} />
          </aside>
          <section className="lg:col-span-7 order-1 lg:order-2">
            <MainContent i18n={i18n.mainContent} />
          </section>
          <aside className="lg:col-span-3 order-3">
            <RightSidebar i18n={i18n.rightSidebar} />
          </aside>
        </div>
      </main>
      <HelplineBar i18n={i18n.helpline} />
      <MobileAppBanner i18n={i18n.mobileApp} />
      <Footer i18n={i18n.footer} />
    </div>
  );
}

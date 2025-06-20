
"use client"; // Convert to client component to manage state

import { useState, useEffect } from 'react';
import ClientPage from './client-page';
import { Header } from '@/components/routeai/Header';
import { Footer } from '@/components/routeai/Footer';
import { AppInitialLoad } from '@/components/routeai/AppInitialLoad';

export default function Home() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000); // Show loading screen for 3 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  if (isInitialLoading) {
    return <AppInitialLoad />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 md:px-8 md:py-10">
        <ClientPage />
      </main>
      <Footer />
    </div>
  );
}

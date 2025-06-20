import ClientPage from './client-page';
import { Header } from '@/components/routeai/Header';
import { Footer } from '@/components/routeai/Footer';

export default function Home() {
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

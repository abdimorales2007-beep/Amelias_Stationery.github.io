import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Settings, Product } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import CategoryShowcase from './components/CategoryShowcase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSessionAuthorized, setIsSessionAuthorized] = useState(() => {
    return sessionStorage.getItem('admin_authorized') === 'true';
  });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && user.email === 'abdimorales2007@gmail.com' && isSessionAuthorized) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      }
    }, (error) => {
      console.error('Settings snapshot error:', error);
    });

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      console.log('Products snapshot received:', snapshot.size, 'documents');
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    }, (error) => {
      console.error('Products snapshot error:', error);
      // If any error occurs with the ordered query, try the simple one
      const fallbackQ = query(collection(db, 'products'));
      onSnapshot(fallbackQ, (snapshot) => {
        console.log('Fallback products snapshot received:', snapshot.size, 'documents');
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsData);
      }, (err) => {
        console.error('Fallback products error:', err);
      });
    });

    // Safety timeout to ensure loading screen doesn't get stuck
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
      unsubscribeProducts();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const getMapUrl = (link: string | undefined, address: string | undefined) => {
    const defaultMap = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.661647413661!2d-99.167406!3d19.42702!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI1JzM3LjIiTiA5OcKwMTAnMDIuNyJX!5e0!3m2!1sen!2smx!4v1625561234567!5m2!1sen!2smx";
    const searchEmbed = (query: string) => `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

    if (!link || link.trim() === '') {
      return address ? searchEmbed(address) : defaultMap;
    }

    // If it's an iframe embed code
    if (link.includes('<iframe')) {
      const match = link.match(/src="([^"]+)"/);
      if (match) return match[1];
    }

    // If it's already an embed URL
    if (link.includes('google.com/maps/embed')) {
      return link;
    }

    // If it's a regular Google Maps link, it's better to use the address if available
    // because embedding a full URL in the 'q' parameter often fails to show the specific place.
    if (link.includes('google.com/maps') || link.includes('maps.app.goo.gl')) {
      if (address && address.trim() !== '') {
        return searchEmbed(address);
      }
      // If no address, try to extract something from the link or just use it as is
      return searchEmbed(link);
    }

    // If it's just text, use it as a search query
    return searchEmbed(link);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setIsSessionAuthorized(false);
      sessionStorage.removeItem('admin_authorized');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsSessionAuthorized(true);
    setIsAdmin(true);
    sessionStorage.setItem('admin_authorized', 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center mesh-gradient p-6 text-center">
        <div className="w-16 h-16 border-4 border-terracotta border-t-transparent rounded-full animate-spin mb-6"></div>
        <div className="text-terracotta font-serif text-2xl mb-2">Cargando Amelia's Stationery...</div>
        <p className="text-brown-dark/40 text-sm max-w-xs">Estamos preparando tu experiencia creativa. Si tarda demasiado, intenta refrescar la página.</p>
        <button 
          onClick={() => setLoading(false)}
          className="mt-8 text-xs text-brown-dark/30 underline hover:text-terracotta transition-colors"
        >
          Saltar espera
        </button>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} settings={settings} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <>
                <Hero settings={settings} />
                <CategoryShowcase products={products} />
                <div id="ubicacion" className="scroll-mt-20">
                  <section className="py-20 px-4 max-w-7xl mx-auto">
                    <h2 className="text-4xl font-serif text-center mb-12">Nuestra Ubicación</h2>
                    <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                      <iframe
                        src={getMapUrl(settings?.googleMapsLink, settings?.address)}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </section>
                </div>
              </>
            } />
            <Route path="/productos" element={<ProductGrid products={products} whatsappNumber={settings?.whatsappNumber} />} />
            <Route path="/admin" element={isAdmin ? <AdminPanel settings={settings} products={products} onLogout={handleLogout} /> : <AdminLogin onLogin={handleAdminLoginSuccess} />} />
          </Routes>
        </main>
        <Footer settings={settings} />
        <WhatsAppButton whatsappNumber={settings?.whatsappNumber} />
      </div>
    </Router>
  );
}

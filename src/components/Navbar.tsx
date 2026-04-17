import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Menu, X, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from '../types';

function LogoImage({ url }: { url?: string }) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [url]);

  if (!url || error) {
    return <div className="text-xs font-bold text-terracotta">Amelia</div>;
  }

  return (
    <img 
      src={url} 
      alt="Amelia's Stationery Logo" 
      className="w-full h-full object-cover"
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}

export default function Navbar({ user, settings }: { user: User | null, settings: Settings | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', to: '/' },
    { name: 'Productos', to: '/productos' },
    { name: 'Ubicación', to: '/#ubicacion' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 text-left">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-terracotta/20 group-hover:border-terracotta transition-all duration-500 shadow-lg shadow-brown-dark/5 bg-white flex items-center justify-center">
                <LogoImage url={settings?.logoUrl} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-2xl md:text-3xl font-serif text-brown-dark italic leading-none">Amelia's</span>
                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-brown-dark/60 font-bold mt-1">Stationery</span>
              </div>
            </Link>
          </div>

          {/* Desktop Right Links */}
          <div className="hidden md:flex items-center justify-end space-x-8">
            {navLinks.map((link) => (
              link.to.startsWith('/#') ? (
                <a
                  key={link.name}
                  href={link.to}
                  className="text-sm font-medium text-brown-dark hover:text-pink-vibrant transition-colors uppercase tracking-widest"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.to}
                  className="text-sm font-medium text-brown-dark hover:text-pink-vibrant transition-colors uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              )
            ))}
            <Link
              to="/admin"
              className="text-sm font-medium text-brown-dark hover:text-pink-vibrant transition-colors uppercase tracking-widest"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-brown-dark hover:bg-brown-dark/5 rounded-full transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-brown-dark/5 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                link.to.startsWith('/#') ? (
                  <a
                    key={link.name}
                    href={link.to}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium text-brown-dark hover:text-pink-vibrant transition-colors uppercase tracking-widest"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium text-brown-dark hover:text-pink-vibrant transition-colors uppercase tracking-widest"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block text-lg font-medium text-brown-dark hover:text-pink-vibrant transition-colors uppercase tracking-widest"
              >
                Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

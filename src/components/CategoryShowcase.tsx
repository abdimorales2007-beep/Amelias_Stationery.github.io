import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function CategoryShowcase({ products }: { products: Product[] }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category || 'General'))).sort();

  // Auto-rotate categories
  useEffect(() => {
    if (categories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % categories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [categories.length]);

  if (categories.length === 0) return null;

  const currentCategory = categories[currentIndex];
  
  // Find a representative image for the category
  const categoryImage = products.find(p => (p.category || 'General') === currentCategory)?.imageUrl || 'https://picsum.photos/seed/stationery/1200/600';

  const handleCategoryClick = () => {
    navigate(`/productos?category=${encodeURIComponent(currentCategory)}`);
  };

  return (
    <section className="py-24 px-4 bg-cream/30 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-brown-dark mb-4 italic">Nuestras Colecciones</h2>
          <p className="text-lg text-brown-dark/60 max-w-2xl mx-auto">
            Explora por categorías y encuentra exactamente lo que necesitas para tu creatividad.
          </p>
        </div>

        <div className="relative h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCategory}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 cursor-pointer"
              onClick={handleCategoryClick}
            >
              {/* Background Image */}
              <img
                src={categoryImage}
                alt={currentCategory}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/90 via-brown-dark/40 to-transparent flex flex-col items-center justify-center text-center p-8">
                <motion.span
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-terracotta font-bold tracking-[0.3em] uppercase text-sm mb-4"
                >
                  Descubre
                </motion.span>
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-5xl md:text-7xl font-serif text-white mb-8 italic"
                >
                  {currentCategory}
                </motion.h3>
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white text-brown-dark rounded-full font-bold hover:bg-terracotta hover:text-white transition-all flex items-center space-x-2 group/btn"
                >
                  <span>Ver Productos</span>
                  <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {categories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-terracotta w-8' : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>

          {/* Side Controls */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-brown-dark transition-all opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % categories.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-brown-dark transition-all opacity-0 group-hover:opacity-100 hidden md:block"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </section>
  );
}

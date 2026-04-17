import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import ProductModal from './ProductModal';

export default function ProductGrid({ products, whatsappNumber }: { products: Product[], whatsappNumber?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Update selected category when URL changes
  useEffect(() => {
    setSelectedCategory(searchParams.get('category'));
  }, [searchParams]);

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category || 'General'))).sort();

  // Filter products based on selected category
  const filteredProducts = selectedCategory 
    ? products.filter(p => (p.category || 'General') === selectedCategory)
    : products;

  const handleCategoryChange = (category: string | null) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
    setSelectedCategory(category);
  };

  return (
    <section id="productos" className="py-32 px-4 mesh-gradient min-h-screen relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-vibrant/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-vibrant/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif text-brown-dark mb-6 italic tracking-tight"
          >
            {selectedCategory ? selectedCategory : 'Nuestro Catálogo'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-brown-dark/70 max-w-2xl mx-auto font-medium"
          >
            {selectedCategory 
              ? `Explora nuestra colección de ${selectedCategory.toLowerCase()}.`
              : 'Una selección cuidadosamente elegida de artículos de papelería y servicios.'}
          </motion.p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-20">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
              !selectedCategory 
                ? 'bg-terracotta text-white shadow-xl shadow-terracotta/30' 
                : 'bg-white/80 backdrop-blur-md text-brown-dark/60 hover:bg-white hover:text-brown-dark'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category 
                  ? 'bg-terracotta text-white shadow-xl shadow-terracotta/30' 
                  : 'bg-white/80 backdrop-blur-md text-brown-dark/60 hover:bg-white hover:text-brown-dark'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedCategory || 'all'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                  onClick={() => setSelectedProduct(product)}
                />
              ))
            ) : (
              <div className="col-span-full py-32 text-center">
                <div className="text-brown-dark/30 italic text-2xl font-serif">
                  Próximamente nuevos productos en esta categoría...
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Product Modal */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        whatsappNumber={whatsappNumber}
      />
    </section>
  );
}

import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { X, ShoppingBag, MessageCircle } from 'lucide-react';

export default function ProductModal({ product, onClose, whatsappNumber }: { product: Product | null, onClose: () => void, whatsappNumber?: string }) {
  if (!product) return null;

  // Clean the number and ensure it starts with 52 (Mexico) if it's 10 digits
  const cleanNumber = (whatsappNumber || '5588057032').replace(/\D/g, '');
  const formattedNumber = cleanNumber.length === 10 ? `52${cleanNumber}` : cleanNumber;

  const whatsappMessage = `Hola, me interesa este producto: ${product.name} (${product.imageUrl})`;
  const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brown-dark/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-brown-dark transition-all"
            >
              <X size={24} />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-1/2 h-[300px] md:h-auto relative overflow-hidden group">
              <motion.img
                layoutId={`image-${product.id}`}
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/stationery/800/800';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/40 to-transparent" />
            </div>

            {/* Details Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-cream/30">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-terracotta font-bold tracking-[0.3em] uppercase text-xs mb-4"
              >
                {product.category || 'General'}
              </motion.span>
              
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-serif text-brown-dark mb-6 italic"
              >
                {product.name}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-brown-dark/70 leading-relaxed mb-10"
              >
                {product.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:bg-brown-dark transition-all flex items-center justify-center space-x-3 group/btn shadow-lg shadow-terracotta/20"
                >
                  <MessageCircle size={20} />
                  <span>Consultar por WhatsApp</span>
                </a>
                
                <button
                  onClick={onClose}
                  className="px-8 py-4 bg-white border-2 border-brown-dark/10 text-brown-dark rounded-full font-bold hover:bg-brown-dark/5 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Cerrar</span>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-12 pt-8 border-t border-brown-dark/5 flex items-center space-x-4 text-brown-dark/40"
              >
                <ShoppingBag size={18} />
                <span className="text-xs uppercase tracking-widest font-bold">Disponibilidad inmediata en tienda</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

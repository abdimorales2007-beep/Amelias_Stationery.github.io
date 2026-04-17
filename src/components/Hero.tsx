import { motion } from 'motion/react';
import { MapPin, Printer } from 'lucide-react';
import { Settings } from '../types';

export default function Hero({ settings }: { settings: Settings | null }) {
  const handleGetDirections = () => {
    if (!settings) return;
    
    let url = settings.googleMapsLink;
    
    // If it's an iframe, extract the src or use the address
    if (url.includes('<iframe')) {
      const match = url.match(/src="([^"]+)"/);
      if (match) url = match[1];
    }

    // If it's not a direct link or is empty, use the address
    if (!url || url.trim() === '' || url.includes('google.com/maps/embed')) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'Amelia\'s Stationery')}`;
    }

    window.open(url, '_blank');
  };

  const handleSendFiles = () => {
    if (!settings) return;
    
    const cleanNumber = (settings.whatsappNumber || '5588057032').replace(/\D/g, '');
    const formattedNumber = cleanNumber.length === 10 ? `52${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent('Hola, quiero enviar unos archivos para imprimir.');
    
    window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden mesh-gradient py-20 px-4">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-serif text-brown-dark leading-[1.1] mb-10 tracking-tight">
            Tu mundo de <span className="text-pink-vibrant">color</span> <br />
            y <span className="text-green-vibrant">creatividad</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-brown-dark/70 leading-relaxed max-w-3xl mx-auto mb-12 font-sans font-normal">
            Descubre nuestra colección de papelería fina, colores vibrantes y accesorios que hacen de cada día una obra de arte.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetDirections}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-brown-dark text-white rounded-full font-bold shadow-xl shadow-brown-dark/20 hover:bg-brown-dark/90 transition-all"
            >
              <MapPin size={20} />
              <span>Cómo llegar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendFiles}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white text-brown-dark border-2 border-brown-dark/10 rounded-full font-bold shadow-xl shadow-white/10 hover:bg-brown-dark/5 transition-all"
            >
              <Printer size={20} />
              <span>Enviar archivos para imprimir</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

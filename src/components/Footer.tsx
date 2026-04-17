import { Settings } from '../types';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useState, useEffect } from 'react';

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

export default function Footer({ settings }: { settings: Settings | null }) {
  const days = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  return (
    <footer className="bg-brown-dark text-cream pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-xl bg-white flex items-center justify-center">
              <LogoImage url={settings?.logoUrl} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
              Amelia's <span className="text-terracotta">Stationery</span>
            </h2>
          </div>
          <p className="text-cream/60 leading-relaxed">
            Curaduría de papelería fina y artículos de escritorio. El arte de lo cotidiano en cada trazo.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-terracotta transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-terracotta transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-terracotta transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif font-bold text-white">Contacto</h3>
          <ul className="space-y-4">
            <li className="flex items-center space-x-3 text-cream/70">
              <Phone size={18} className="text-terracotta" />
              <span>{settings?.whatsappNumber || '+52 123 456 7890'}</span>
            </li>
            <li className="flex items-start space-x-3 text-cream/70">
              <MapPin size={18} className="text-terracotta mt-1" />
              <span>{settings?.address || 'Ciudad de México, México'}</span>
            </li>
          </ul>
          
          {/* Quick Action Buttons in Footer */}
          <div className="flex flex-col space-y-3 pt-4">
            <button 
              onClick={() => {
                let url = settings?.googleMapsLink || '';
                if (url.includes('<iframe')) {
                  const match = url.match(/src="([^"]+)"/);
                  if (match) url = match[1];
                }
                if (!url || url.trim() === '' || url.includes('google.com/maps/embed')) {
                  url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || 'Amelia\'s Stationery')}`;
                }
                window.open(url, '_blank');
              }}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all text-sm font-bold border border-white/10"
            >
              <MapPin size={16} />
              <span>Cómo llegar</span>
            </button>
            
            <button 
              onClick={() => {
                const cleanNumber = (settings?.whatsappNumber || '5588057032').replace(/\D/g, '');
                const formattedNumber = cleanNumber.length === 10 ? `52${cleanNumber}` : cleanNumber;
                const message = encodeURIComponent('Hola, quiero enviar unos archivos para imprimir.');
                window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
              }}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-terracotta/20"
            >
              <Phone size={16} />
              <span>Enviar archivos</span>
            </button>
          </div>
        </div>

        {/* Hours */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif font-bold text-white">Horarios</h3>
          <ul className="space-y-2">
            {days.map((day) => (
              <li key={day.key} className="flex justify-between text-sm text-cream/70 border-b border-white/5 pb-1">
                <span>{day.label}</span>
                <span className="font-medium text-white">
                  {settings?.openingHours?.[day.key as keyof typeof settings.openingHours] || (day.key === 'saturday' || day.key === 'sunday' ? 'Cerrado' : '7:30 - 18:00')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center text-sm text-cream/30">
        <p>© 2026 Amelia's Stationery. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

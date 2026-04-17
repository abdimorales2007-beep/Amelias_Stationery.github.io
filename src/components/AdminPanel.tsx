import { useState, useEffect, ChangeEvent } from 'react';
import { Settings, Product } from '../types';
import { db, logout, storage } from '../firebase';
import { doc, setDoc, collection, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Save, LogOut, Settings as SettingsIcon, Package, Clock, MapPin, Phone, Mail, Edit2, X, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const settingsSchema = z.object({
  googleMapsLink: z.string().min(1, 'El enlace es obligatorio'),
  whatsappNumber: z.string().min(10, 'Mínimo 10 dígitos'),
  address: z.string().min(1, 'La dirección es obligatoria'),
  logoUrl: z.string().url('Debe ser un enlace de imagen válido').optional().or(z.literal('')),
  openingHours: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
  }),
});

const productSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  category: z.string().min(1, 'La categoría es obligatoria'),
  imageUrl: z.string().url('Debe ser un enlace de imagen válido'),
});

export default function AdminPanel({ settings, products, onLogout }: { settings: Settings | null, products: Product[], onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'settings' | 'products'>('settings');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register: registerSettings, handleSubmit: handleSettingsSubmit, reset: resetSettings, setValue: setSettingsValue, watch: watchSettings, formState: { errors: settingsErrors, isDirty: isSettingsDirty } } = useForm<Settings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings || {
      googleMapsLink: '',
      whatsappNumber: '',
      address: 'Ciudad de México, México',
      logoUrl: '',
      openingHours: {
        monday: '7:30 - 18:00',
        tuesday: '7:30 - 18:00',
        wednesday: '7:30 - 18:00',
        thursday: '7:30 - 18:00',
        friday: '7:30 - 18:00',
        saturday: 'Cerrado',
        sunday: 'Cerrado',
      }
    }
  });

  useEffect(() => {
    if (settings && !isSettingsDirty) {
      resetSettings(settings);
    }
  }, [settings, resetSettings, isSettingsDirty]);

  const { register: registerProduct, handleSubmit: handleProductSubmit, reset: resetProduct, setValue: setProductValue, watch: watchProduct, formState: { errors: productErrors } } = useForm<Omit<Product, 'id' | 'createdAt'>>({
    resolver: zodResolver(productSchema)
  });

  const watchedImageUrl = watchProduct('imageUrl');

  const watchedLogoUrl = watchSettings('logoUrl');

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const storageRef = ref(storage, `logos/amelia_logo_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setSettingsValue('logoUrl', url, { shouldDirty: true });
      setSaveStatus({ type: 'success', message: '¡Imagen subida! No olvides guardar los cambios.' });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      const errorMessage = error?.code === 'storage/unauthorized' 
        ? 'No tienes permiso para subir archivos. Verifica tu cuenta.' 
        : `Error al subir la imagen: ${error?.message || 'Error desconocido'}`;
      setSaveStatus({ type: 'error', message: errorMessage });
    }
    setIsSaving(false);
  };

  const handleProductImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const storageRef = ref(storage, `products/product_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setProductValue('imageUrl', url, { shouldDirty: true });
      setSaveStatus({ type: 'success', message: '¡Imagen de producto subida!' });
    } catch (error: any) {
      console.error('Error uploading product image:', error);
      const errorMessage = error?.code === 'storage/unauthorized' 
        ? 'No tienes permiso para subir archivos. Verifica tu cuenta.' 
        : `Error al subir la imagen del producto: ${error?.message || 'Error desconocido'}`;
      setSaveStatus({ type: 'error', message: errorMessage });
    }
    setIsSaving(false);
  };

  const onSaveSettings = async (data: Settings) => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await setDoc(doc(db, 'settings', 'global'), data);
      setSaveStatus({ type: 'success', message: 'Configuración guardada con éxito' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({ type: 'error', message: 'Error al guardar la configuración' });
    }
    setIsSaving(false);
  };

  const onAddProduct = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    console.log('Attempting to save product:', data);
    setIsSaving(true);
    setSaveStatus(null);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), {
          ...data,
          updatedAt: serverTimestamp()
        });
        setSaveStatus({ type: 'success', message: '¡Producto actualizado con éxito!' });
        setEditingId(null);
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp()
        });
        console.log('Product added with ID:', docRef.id);
        setSaveStatus({ type: 'success', message: '¡Producto añadido con éxito al catálogo!' });
      }
      resetProduct();
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (error) {
      console.error('Error saving product:', error);
      setSaveStatus({ type: 'error', message: editingId ? 'Error al actualizar: ' + (error as Error).message : 'Error al añadir: ' + (error as Error).message });
    }
    setIsSaving(false);
  };

  const onEditProduct = (product: Product) => {
    setEditingId(product.id);
    setProductValue('name', product.name);
    setProductValue('description', product.description);
    setProductValue('category', product.category || 'General');
    setProductValue('imageUrl', product.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetProduct();
  };

  const onDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setSaveStatus({ type: 'success', message: 'Producto eliminado' });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setSaveStatus({ type: 'error', message: 'Error al eliminar el producto' });
    }
  };

  return (
    <div className="min-h-screen mesh-gradient pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif text-brown-dark">Panel de Control</h1>
            <p className="text-brown-dark/60 italic">Amelia's Stationery Admin</p>
          </div>
          <button onClick={onLogout} className="flex items-center space-x-2 text-terracotta hover:text-brown-dark transition-colors font-medium">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </header>

        <div className="flex space-x-4 mb-10">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${activeTab === 'settings' ? 'bg-terracotta text-white shadow-lg' : 'bg-white text-brown-dark/60 hover:bg-terracotta/10'}`}
          >
            <SettingsIcon size={18} />
            <span>Configuración</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${activeTab === 'products' ? 'bg-terracotta text-white shadow-lg' : 'bg-white text-brown-dark/60 hover:bg-terracotta/10'}`}
          >
            <Package size={18} />
            <span>Catálogo</span>
          </button>
        </div>

        <AnimatePresence>
          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-2xl text-center font-medium ${
                saveStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {saveStatus.message}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-10 rounded-[40px] shadow-xl border-8 border-white"
            >
              <form onSubmit={handleSettingsSubmit(onSaveSettings)} className="space-y-10">
                <section>
                  <h3 className="text-2xl font-serif text-brown-dark mb-6 flex items-center space-x-2">
                    <MapPin size={24} className="text-terracotta" />
                    <span>Ubicación y Contacto</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-brown-dark/60 uppercase tracking-wider">Enlace Google Maps (Embed o Link)</label>
                      <input {...registerSettings('googleMapsLink')} className="input-field" placeholder="https://www.google.com/maps/embed?..." />
                      {settingsErrors.googleMapsLink && <p className="text-xs text-red-500">{settingsErrors.googleMapsLink.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-brown-dark/60 uppercase tracking-wider">Dirección (Texto)</label>
                      <input {...registerSettings('address')} className="input-field" placeholder="Ciudad de México, México" />
                      {settingsErrors.address && <p className="text-xs text-red-500">{settingsErrors.address.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-brown-dark/60 uppercase tracking-wider">WhatsApp (con código de país)</label>
                      <input {...registerSettings('whatsappNumber')} className="input-field" placeholder="521234567890" />
                      {settingsErrors.whatsappNumber && <p className="text-xs text-red-500">{settingsErrors.whatsappNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-brown-dark/60 uppercase tracking-wider">URL del Logo (Foto de la abuelita)</label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-grow">
                          <input {...registerSettings('logoUrl')} className="input-field" placeholder="https://ejemplo.com/logo.png" />
                        </div>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            title="Subir foto de la abuelita"
                          />
                          <button
                            type="button"
                            className="flex items-center space-x-2 px-4 py-3 bg-pink-vibrant/10 text-pink-vibrant rounded-xl hover:bg-pink-vibrant/20 transition-all font-bold text-sm"
                          >
                            <Upload size={18} />
                            <span>Subir Foto</span>
                          </button>
                        </div>
                      </div>
                      {watchedLogoUrl && (
                        <div className="mt-4 flex items-center space-x-4 p-4 bg-brown-dark/5 rounded-2xl border-2 border-dashed border-brown-dark/10">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                            <img src={watchedLogoUrl} alt="Vista previa" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs text-brown-dark/60 italic">Vista previa del logo (Foto de la abuelita)</p>
                        </div>
                      )}
                      {settingsErrors.logoUrl && <p className="text-xs text-red-500">{settingsErrors.logoUrl.message}</p>}
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-serif text-brown-dark mb-6 flex items-center space-x-2">
                    <Clock size={24} className="text-terracotta" />
                    <span>Horarios de Atención</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                      <div key={day} className="space-y-2">
                        <label className="text-xs font-semibold text-brown-dark/60 uppercase tracking-wider">{day}</label>
                        <input {...registerSettings(`openingHours.${day}` as any)} className="input-field text-sm" placeholder="9:00 - 18:00" />
                      </div>
                    ))}
                  </div>
                </section>

                <div className="pt-6 border-t border-brown-dark/5 flex justify-end items-center space-x-4">
                  {isSettingsDirty && (
                    <span className="text-xs text-terracotta font-bold animate-pulse">Tienes cambios sin guardar</span>
                  )}
                  <button type="submit" disabled={isSaving} className={`btn-primary flex items-center space-x-2 ${isSettingsDirty ? 'scale-105 shadow-2xl' : 'opacity-80'}`}>
                    <Save size={20} />
                    <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="bg-white p-10 rounded-[40px] shadow-xl border-8 border-white">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-serif text-brown-dark flex items-center space-x-2">
                    {editingId ? <Edit2 size={24} className="text-terracotta" /> : <Plus size={24} className="text-terracotta" />}
                    <span>{editingId ? 'Editar Producto' : 'Añadir Nuevo Producto'}</span>
                  </h3>
                  {editingId && (
                    <button onClick={cancelEdit} className="text-brown-dark/40 hover:text-terracotta flex items-center space-x-1 text-sm">
                      <X size={16} />
                      <span>Cancelar Edición</span>
                    </button>
                  )}
                </div>
                <form onSubmit={handleProductSubmit(onAddProduct)} className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-6 items-start">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-brown-dark/60 uppercase tracking-wider">Nombre</label>
                      <input {...registerProduct('name')} className="input-field" placeholder="Cuaderno Artesanal" />
                      {productErrors.name && <p className="text-xs text-red-500">{productErrors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-brown-dark/60 uppercase tracking-wider">Categoría</label>
                      <select {...registerProduct('category')} className="input-field">
                        <option value="">Seleccionar...</option>
                        <option value="Material Escolar">Material Escolar</option>
                        <option value="Escritura">Escritura</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Arte y Diseño">Arte y Diseño</option>
                        <option value="Oficina">Oficina</option>
                        <option value="General">General</option>
                      </select>
                      {productErrors.category && <p className="text-xs text-red-500">{productErrors.category.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-brown-dark/60 uppercase tracking-wider">URL de Imagen</label>
                      <div className="flex items-center space-x-2">
                        <input {...registerProduct('imageUrl')} className="input-field" placeholder="https://..." />
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProductImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <button
                            type="button"
                            className="p-3 bg-pink-vibrant/10 text-pink-vibrant rounded-xl hover:bg-pink-vibrant/20 transition-all"
                            title="Subir imagen"
                          >
                            <Upload size={18} />
                          </button>
                        </div>
                      </div>
                      {productErrors.imageUrl && <p className="text-xs text-red-500">{productErrors.imageUrl.message}</p>}
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <label className="text-xs font-semibold text-brown-dark/60 uppercase tracking-wider mb-2">Vista Previa</label>
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-brown-dark/10 overflow-hidden bg-cream/30 flex items-center justify-center">
                        {watchedImageUrl ? (
                          <img src={watchedImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error'} />
                        ) : (
                          <Package size={24} className="text-brown-dark/20" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2 md:col-span-3">
                      <label className="text-xs font-semibold text-brown-dark/60 uppercase tracking-wider">Descripción Breve</label>
                      <input {...registerProduct('description')} className="input-field" placeholder="Papel de 120g con costura expuesta..." />
                      {productErrors.description && <p className="text-xs text-red-500">{productErrors.description.message}</p>}
                    </div>
                    <button type="submit" disabled={isSaving} className="btn-primary w-full py-4">
                      {isSaving ? 'Guardando...' : editingId ? 'Actualizar Producto' : 'Añadir al Catálogo'}
                    </button>
                  </div>
                </form>

                <div className="mt-10 pt-10 border-t border-brown-dark/5">
                  <h4 className="text-sm font-semibold text-brown-dark/40 uppercase tracking-widest mb-6">Sugerencias Rápidas (Haz clic para llenar el formulario)</h4>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'Cuaderno Profesional', cat: 'Material Escolar', desc: '90 hojas, raya o cuadro.', img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=800' },
                      { name: 'Lápiz de Grafito #2', cat: 'Escritura', desc: 'Lápiz clásico para escritura.', img: 'https://images.unsplash.com/photo-1512036667332-202bb7517b2d?auto=format&fit=crop&q=80&w=800' },
                      { name: 'Bolígrafo Negro', cat: 'Escritura', desc: 'Tinta de gel o punto medio.', img: 'https://images.unsplash.com/photo-1585336261022-69c6e2916e48?auto=format&fit=crop&q=80&w=800' },
                      { name: 'Servicio de Copias', cat: 'Servicios', desc: 'Fotocopias B/N y Color.', img: 'https://images.unsplash.com/photo-1563206767-5b18f218e0de?auto=format&fit=crop&q=80&w=800' },
                      { name: 'Permisos de Conducir', cat: 'Servicios', desc: 'Gestión e impresión de formatos.', img: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800' },
                      { name: 'Juego de Geometría', cat: 'Material Escolar', desc: 'Regla, escuadras y compás.', img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800' },
                    ].map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setProductValue('name', item.name);
                          setProductValue('category', item.cat);
                          setProductValue('description', item.desc);
                          setProductValue('imageUrl', item.img);
                        }}
                        className="px-4 py-2 bg-cream rounded-full text-xs font-medium text-brown-dark hover:bg-terracotta hover:text-white transition-all border border-brown-dark/5"
                      >
                        + {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="card group relative">
                    <div className="aspect-square">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-serif font-bold text-brown-dark">{product.name}</h4>
                        <span className="text-[10px] uppercase tracking-widest text-brown-dark/40 font-bold">{product.category}</span>
                      </div>
                      <p className="text-xs text-brown-dark/60 mb-4">{product.description}</p>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="text-terracotta hover:text-brown-dark transition-colors flex items-center space-x-1 text-sm font-medium"
                        >
                          <Edit2 size={16} />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700 transition-colors flex items-center space-x-1 text-sm font-medium"
                        >
                          <Trash2 size={16} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Settings {
  googleMapsLink: string;
  whatsappNumber: string;
  address: string;
  logoUrl?: string;
  openingHours: OpeningHours;
}

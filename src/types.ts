export type ScreenType = 'home' | 'knowledge' | 'products' | 'support';

export interface CropGrowthStage {
  stage: string;
  timing: string;
  fertilizerNeed: string;
  notes: string;
}

export interface CropGuide {
  id: string;
  name: string;
  scientificName: string;
  category: 'Cereals' | 'Vegetables' | 'Fruits' | 'Legumes';
  badgeCategory: string;
  description: string;
  image: string;
  recommendedHeader: string;
  recommendedIcon: string;
  basal: string;
  topDressing: string;
  soilPh: string;
  moistureNeed: string;
  fullGuideDetails: {
    nitrogenPerAcreLbs: number;
    phosphorusPerAcreLbs: number;
    potassiumPerAcreLbs: number;
    optimumSoilPhRange: string;
    stages: CropGrowthStage[];
    commonDeficiencies: {
      nutrient: string;
      symptoms: string;
      solution: string;
    }[];
  };
}

export interface Product {
  id: string;
  name: string;
  category: 'Nitrogen' | 'NPK Blends' | 'Organic' | 'Soil Conditioners' | 'Micronutrients';
  price: number;
  rating: number;
  reviewsCount: number;
  weightOrVolume: string;
  description: string;
  fullDescription: string;
  image: string;
  badge?: string;
  inStock: boolean;
  formulation: 'Granular' | 'Liquid' | 'Slow-Release Pellets' | 'Water-Soluble Powder';
  npkRatio?: string;
  coveragePerBag: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'In Transit' | 'Completed' | 'Processing';
  statusBadge: string;
  statusColor: string;
  statusClass: string;
  badgeClass: string;
  itemsCount: number;
  total: number;
  icon: string;
  items: OrderItem[];
  destination: string;
  trackingNumber: string;
  estimatedDelivery: string;
}

export interface ConsultationBooking {
  id: string;
  fullName: string;
  email: string;
  topic: string;
  preferredDate: string;
  timeSlot?: string;
  acreage?: string;
  notes?: string;
  status: 'Confirmed' | 'Pending';
}

export interface FarmLocation {
  id: string;
  name: string;
  state: string;
  temperatureF: number;
  condition: string;
  humidity: string;
  wind: string;
  forecastSummary: string;
  sprayCondition: 'Optimal' | 'Caution' | 'Unfavorable';
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

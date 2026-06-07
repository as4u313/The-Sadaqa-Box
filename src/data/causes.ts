import { 
  Droplets, 
  Utensils, 
  Users, 
  Moon, 
  BookOpen, 
  Ambulance, 
  Book, 
  HeartPulse, 
  Leaf, 
  HandHeart 
} from 'lucide-react';

export const palette = [
  'feather-green',
  'macaw-blue',
  'cardinal-red',
  'beetle-purple',
  'fox-orange',
  'bee-yellow',
  'humpback-blue',
];

export const colorClasses: Record<string, string> = {
  'bg-feather-green': 'bg-feather-green',
  'bg-macaw-blue': 'bg-macaw-blue',
  'bg-cardinal-red': 'bg-cardinal-red',
  'bg-beetle-purple': 'bg-beetle-purple',
  'bg-fox-orange': 'bg-fox-orange',
  'bg-bee-yellow': 'bg-bee-yellow',
  'bg-humpback-blue': 'bg-humpback-blue',
};

export const causes = [
  {
    id: 'water-well',
    title: 'Water Well Fund',
    subtitle: 'Provide clean water to communities in need.',
    raised: 8560,
    goal: 15000,
    contributors: 42,
    icon: Droplets,
    featured: true
  },
  {
    id: 'feed-family',
    title: 'Feed a Family',
    subtitle: 'Provide nutritious meals to hungry families.',
    raised: 6240,
    goal: 8000,
    icon: Utensils
  },
  {
    id: 'orphans',
    title: 'Orphans Support',
    subtitle: 'Care, education and love for orphans.',
    raised: 5120,
    goal: 8000,
    icon: Users
  },
  {
    id: 'masjid',
    title: 'Masjid Support',
    subtitle: 'Build and maintain houses of Allah.',
    raised: 3780,
    goal: 6000,
    icon: Moon
  },
  {
    id: 'education',
    title: 'Education for All',
    subtitle: 'Sponsor education for deserving students.',
    raised: 4350,
    goal: 6000,
    icon: BookOpen
  },
  {
    id: 'emergency',
    title: 'Emergency Relief',
    subtitle: 'Respond to disasters and urgent needs.',
    raised: 7680,
    goal: 9000,
    icon: Ambulance
  },
  {
    id: 'quran',
    title: 'Quran Sponsorship',
    subtitle: 'Sponsor Qurans for new Muslims and students.',
    raised: 2890,
    goal: 5000,
    icon: Book
  },
  {
    id: 'medical',
    title: 'Medical Aid',
    subtitle: 'Provide medical care and essential supplies.',
    raised: 3410,
    goal: 5000,
    icon: HeartPulse
  },
  {
    id: 'palestine',
    title: 'Palestine Relief',
    subtitle: 'Support our brothers and sisters in Palestine.',
    raised: 9220,
    goal: 12000,
    icon: Leaf
  },
  {
    id: 'sadaqah',
    title: 'Sadaqah Jariyah',
    subtitle: 'Support sustainable projects with lasting rewards.',
    raised: 4760,
    goal: 8000,
    icon: HandHeart
  }
];

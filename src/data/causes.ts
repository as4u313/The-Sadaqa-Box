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
    slug: 'water-well',
    title: 'Water Well Fund',
    subtitle: 'Provide clean water to communities in need.',
    fullDescription: 'Access to safe water is a fundamental human right. Our Water Well Fund builds reliable wells in remote communities, deeply transforming the health, education, and economic potentials of those living there.',
    category: 'Water & Sanitation',
    raised: 8560,
    goal: 15000,
    contributors: 42,
    impactMetrics: [
      { label: 'Wells Built', value: '4' },
      { label: 'People Served', value: '2,500' }
    ],
    updates: [
      { date: 'Oct 14', message: 'Second well completed in rural village.' }
    ],
    relatedGoals: ['feed-family', 'medical'],
    icon: Droplets,
    featured: true
  },
  {
    id: 'feed-family',
    slug: 'feed-family',
    title: 'Feed a Family',
    subtitle: 'Provide nutritious meals to hungry families.',
    fullDescription: 'Your donations help provide essential food packs to families facing extreme poverty and conflict. Each pack contains enough staple foods like rice, flour, and oil to feed a family of five for an entire month.',
    category: 'Food Security',
    raised: 6240,
    goal: 8000,
    contributors: 158,
    impactMetrics: [
      { label: 'Meals Provided', value: '1,200' },
      { label: 'Families Supported', value: '120' }
    ],
    updates: [
      { date: 'Sep 22', message: 'Distributed 50 food packs ahead of winter.' }
    ],
    relatedGoals: ['orphans', 'emergency'],
    icon: Utensils
  },
  {
    id: 'orphans',
    slug: 'orphans',
    title: 'Orphans Support',
    subtitle: 'Care, education and love for orphans.',
    fullDescription: 'Providing comprehensively for the basic needs and education of orphaned children. This fund goes directly to their guardians to ensure they have food, clothes, learning materials, and medical care.',
    category: 'Children & Youth',
    raised: 5120,
    goal: 8000,
    contributors: 89,
    impactMetrics: [
      { label: 'Orphans Sponsored', value: '45' }
    ],
    updates: [
      { date: 'Aug 10', message: 'School supplies distributed for the new academic year.' }
    ],
    relatedGoals: ['education', 'feed-family'],
    icon: Users
  },
  {
    id: 'masjid',
    slug: 'masjid',
    title: 'Masjid Support',
    subtitle: 'Build and maintain houses of Allah.',
    fullDescription: 'Help us maintain and expand local Masjids. These funds go towards upkeep, utility bills, supporting the imams, and community outreach programs established through the Masjid.',
    category: 'Community',
    raised: 3780,
    goal: 6000,
    contributors: 76,
    impactMetrics: [
      { label: 'Masjids Supported', value: '3' }
    ],
    updates: [
      { date: 'Jul 04', message: 'Carpet replacements completed in the main prayer hall.' }
    ],
    relatedGoals: ['quran', 'education'],
    icon: Moon
  },
  {
    id: 'education',
    slug: 'education',
    title: 'Education for All',
    subtitle: 'Sponsor education for deserving students.',
    fullDescription: 'Education is the key to breaking the cycle of poverty. We sponsor school fees, uniforms, and books for students coming from highly disadvantaged backgrounds.',
    category: 'Education',
    raised: 4350,
    goal: 6000,
    contributors: 112,
    impactMetrics: [
      { label: 'Students Enrolled', value: '85' },
      { label: 'Schools Supported', value: '2' }
    ],
    updates: [
      { date: 'May 16', message: 'End of year exams completed successfully.' }
    ],
    relatedGoals: ['orphans', 'quran'],
    icon: BookOpen
  },
  {
    id: 'emergency',
    slug: 'emergency',
    title: 'Emergency Relief',
    subtitle: 'Respond to disasters and urgent needs.',
    fullDescription: 'A rapid response fund dedicated to providing immediate relief during sudden disasters like earthquakes, floods, or conflict outbreaks. We aim to dispatch basic necessities within 48 hours of an emergency.',
    category: 'Disaster Relief',
    raised: 7680,
    goal: 9000,
    contributors: 245,
    impactMetrics: [
      { label: 'Emergencies Responded', value: '5' }
    ],
    updates: [
      { date: 'Nov 02', message: 'Emergency tents deployed to flood victims.' }
    ],
    relatedGoals: ['medical', 'feed-family'],
    icon: Ambulance
  },
  {
    id: 'quran',
    slug: 'quran',
    title: 'Quran Sponsorship',
    subtitle: 'Sponsor Qurans for new Muslims and students.',
    fullDescription: 'We print and distribute high-quality copies of the Quran, accompanied by reliable translations. This program supports local madrasas, new Muslims, and communities seeking to strengthen their faith.',
    category: 'Islamic Education',
    raised: 2890,
    goal: 5000,
    contributors: 54,
    impactMetrics: [
      { label: 'Qurans Distributed', value: '500' }
    ],
    updates: [
      { date: 'Apr 01', message: 'Special Ramadan distribution completed.' }
    ],
    relatedGoals: ['masjid', 'education'],
    icon: Book
  },
  {
    id: 'medical',
    slug: 'medical',
    title: 'Medical Aid',
    subtitle: 'Provide medical care and essential supplies.',
    fullDescription: 'Access to healthcare is critical. We fund life-saving treatments, essential medicines, and mobile clinics in remote areas lacking basic healthcare infrastructure.',
    category: 'Healthcare',
    raised: 3410,
    goal: 5000,
    contributors: 92,
    impactMetrics: [
      { label: 'Patients Treated', value: '340' }
    ],
    updates: [
      { date: 'Dec 12', message: 'Mobile clinic launched in standard medical zone.' }
    ],
    relatedGoals: ['emergency', 'water-well'],
    icon: HeartPulse
  },
  {
    id: 'palestine',
    slug: 'palestine',
    title: 'Palestine Relief',
    subtitle: 'Support our brothers and sisters in Palestine.',
    fullDescription: 'Providing direct medical and food aid to families in Palestine affected by poverty and conflict. Your donation brings hope and essential relief to those facing unimaginable hardship.',
    category: 'Emergency Relief',
    raised: 9220,
    goal: 12000,
    contributors: 310,
    impactMetrics: [
      { label: 'Families Helped', value: '1,500' }
    ],
    updates: [
      { date: 'Jan 05', message: 'Winter supply kits delivered successfully.' }
    ],
    relatedGoals: ['emergency', 'medical'],
    icon: Leaf
  },
  {
    id: 'sadaqah',
    slug: 'sadaqah',
    title: 'Sadaqah Jariyah',
    subtitle: 'Support sustainable projects with lasting rewards.',
    fullDescription: 'Invest in continuous charity that keeps giving long after you have donated. This fund targets sustainable infrastructure like planting trees, building libraries, or establishing long-term income-generating waqf properties.',
    category: 'Sustainable Development',
    raised: 4760,
    goal: 8000,
    contributors: 134,
    impactMetrics: [
      { label: 'Projects Initiated', value: '8' }
    ],
    updates: [
      { date: 'Mar 15', message: 'Tree planting initiative started in deforested area.' }
    ],
    relatedGoals: ['water-well', 'masjid'],
    icon: HandHeart
  }
];

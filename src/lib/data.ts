import { FileText, Users, Building, FileSearch, ShoppingCart, Microscope, User, FilePlus, Milestone, HelpCircle, UserPlus, MapPin, Repeat, Home, LogIn } from 'lucide-react';

export const leftSidebarServices = [
  { name: ' குடிமக்கள் உள்நுழைவு', icon: LogIn, color: 'bg-green-600', href: '/login' },
  { name: 'பயனாளி சேவைகள்', icon: User, color: 'bg-green-600', href: '#' },
  { name: 'குடும்ப அட்டை சேவைகள்', icon: Users, color: 'bg-orange-500', href: '#' },
  { name: 'NFSA சேவைகள்', icon: FileText, color: 'bg-blue-500', href: '#' },
  { name: 'NFSA தொடர்பான படிவங்கள்', icon: FilePlus, color: 'bg-teal-500', href: '#' },
  { name: 'TN-PDS சேவைகள்', icon: Building, color: 'bg-purple-500', href: '#' },
  { name: 'நியாய விலைக் கடை சேவைகள்', icon: ShoppingCart, color: 'bg-red-500', href: '#' },
  { name: 'ஆய்வு மற்றும் கண்காணிப்பு', icon: Microscope, color: 'bg-yellow-600', href: '#' },
];

export const stats = [
  { label: 'மாவட்டங்கள்', value: 38, icon: MapPin },
  { label: 'வட்டங்கள்', value: 307, icon: Milestone },
  { label: 'நியாய விலைக் கடைகள்', value: 35741, icon: Home },
  { label: 'பயனாளிகள்', value: 68987453, icon: Users },
  { label: 'அரிசி விநியோகம் (மெ.டன்)', value: 315000, icon: FileSearch },
  { label: 'சர்க்கரை / மண்ணெண்ணெய்', value: 17800, icon: ShoppingCart },
];

export const citizenServices = {
  title: 'குடிமக்கள் மைய விவரங்கள்',
  color: 'bg-green-100 border-green-600',
  items: [
    { name: 'புதிய குடும்ப அட்டை விண்ணப்பிக்க', icon: FilePlus, href: '/signup' },
    { name: 'குடும்ப அட்டை நிலை', icon: FileSearch, href: '#' },
    { name: 'குறை பதிவு', icon: HelpCircle, href: '#' },
  ],
};

export const cardServices = {
  title: 'அட்டை சேவைகள்',
  color: 'bg-blue-100 border-blue-600',
  items: [
    { name: 'உறுப்பினரைச் சேர்', icon: UserPlus, href: '#' },
    { name: 'முகவரி மாற்றம்', icon: Home, href: '#' },
    { name: 'அட்டை வகை மாற்றம்', icon: Repeat, href: '#' },
    { name: 'உறுப்பினரை நீக்கு', icon: UserPlus, href: '#' },
  ]
};

export const fpsServices = {
  title: 'FPS சேவைகள்',
  color: 'bg-orange-100 border-orange-600',
  items: [
    { name: 'நியாய விலைக் கடையைக் கண்டறியவும்', icon: MapPin, href: '#' },
  ],
};

export const footerLinks = {
  actsAndPolicies: [
    { name: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்', href: '#' },
    { name: 'தனியுரிமைக் கொள்கை', href: '#' },
    { name: 'மறுதலிப்பு', href: '#' },
  ],
  quickLinks: [
    { name: 'முகப்பு', href: '#' },
    { name: 'பற்றி', href: '#' },
    { name: 'தொடர்புக்கு', href: '#' },
  ],
  relatedDepartments: [
    { name: 'உணவு மற்றும் நுகர்வோர் பாதுகாப்பு', href: '#' },
    { name: 'தமிழ்நாடு அரசு', href: '#' },
    { name: 'தேசிய தகவல் மையம்', href: '#' },
  ],
};

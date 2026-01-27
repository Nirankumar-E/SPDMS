import { FileText, Users, Building, FileSearch, ShoppingCart, Microscope, User, FilePlus, Milestone, HelpCircle, UserPlus, MapPin, Repeat, Home, LogIn, Clock } from 'lucide-react';

export const leftSidebarServices = [
  { key: 'fpsServices', icon: ShoppingCart, href: '#' },
  { key: 'inspection', icon: Microscope, href: '#' },
  { key: 'rationSelection', icon: ShoppingCart, href: '/dashboard/ration-selection' },
];

export const stats = [
  { key: 'districts', value: 38, icon: MapPin },
  { key: 'taluks', value: 307, icon: Milestone },
  { key: 'shops', value: 35741, icon: Home },
  { key: 'beneficiaries', value: 68987453, icon: Users },
  { key: 'rice', value: 315000, icon: FileSearch },
  { key: 'sugarKerosene', value: 17800, icon: ShoppingCart },
];

export const citizenServices = {
  color: 'bg-green-100 border-green-600',
  items: [
    { key: 'applyNewCard', icon: FilePlus, href: '#' },
    { key: 'cardStatus', icon: FileSearch, href: '#' },
    { key: 'registerGrievance', icon: HelpCircle, href: '#' },
  ],
};

export const cardServices = {
  color: 'bg-blue-100 border-blue-600',
  items: [
    { key: 'addMember', icon: UserPlus, href: '#' },
    { key: 'changeAddress', icon: Home, href: '#' },
    { key: 'changeCardType', icon: Repeat, href: '#' },
    { key: 'removeMember', icon: UserPlus, href: '#' },
  ]
};

export const fpsServices = {
  color: 'bg-orange-100 border-orange-600',
  items: [
    { key: 'findShop', icon: MapPin, href: '#' },
  ],
};

export const footerLinks = {
  actsAndPolicies: [
    { key: 'terms', href: '#' },
    { key: 'privacy', href: '#' },
    { key: 'disclaimer', href: '#' },
  ],
  quickLinks: [
    { key: 'home', href: '#' },
    { key: 'about', href: '#' },
    { key: 'contact', href: '#' },
  ],
  relatedDepartments: [
    { key: 'foodDept', href: '#' },
    { key: 'tnGovt', href: '#' },
    { key: 'nic', href: '#' },
  ],
};

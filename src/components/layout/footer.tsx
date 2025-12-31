import Link from 'next/link';
import { Facebook, Twitter, Youtube, Mail, Phone } from 'lucide-react';
import { footerLinks } from '@/lib/data';
import GovernmentEmblem from '../icons/government-emblem';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Acts & Policies */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-headline">சட்டங்கள் மற்றும் கொள்கைகள்</h4>
            <ul className="space-y-2">
              {footerLinks.actsAndPolicies.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}><div className="text-sm text-gray-300 hover:text-white transition-colors">{link.name}</div></Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-headline">விரைவு இணைப்புகள்</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}><div className="text-sm text-gray-300 hover:text-white transition-colors">{link.name}</div></Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Related Departments */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-headline">தொடர்புடைய துறைகள்</h4>
            <ul className="space-y-2">
              {footerLinks.relatedDepartments.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}><div className="text-sm text-gray-300 hover:text-white transition-colors">{link.name}</div></Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Details */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-headline">தொடர்பு వివరங்கள்</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <a href="mailto:support@tnpds.gov.in" className="text-sm text-gray-300 hover:text-white">support@yourproject.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-300">1967 | 1800-425-5901</span>
              </li>
            </ul>
             <div className="flex space-x-4 mt-6">
              <Link href="#" aria-label="Facebook"><div className="text-gray-400 hover:text-white transition-colors"><Facebook /></div></Link>
              <Link href="#" aria-label="Twitter"><div className="text-gray-400 hover:text-white transition-colors"><Twitter /></div></Link>
              <Link href="#" aria-label="YouTube"><div className="text-gray-400 hover:text-white transition-colors"><Youtube /></div></Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">&copy; {new Date().getFullYear()} TN-PDS Portal Replica. All Rights Reserved.</p>
          <div className="flex items-center gap-2">
            <GovernmentEmblem className="h-8 w-8" />
            <span className="text-sm text-gray-400">Designed & Developed by You.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

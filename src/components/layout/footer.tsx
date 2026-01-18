import Link from 'next/link';
import { Facebook, Twitter, Youtube, Mail, Phone } from 'lucide-react';
import { footerLinks } from '@/lib/data';
import type { FooterTranslations } from '@/lib/i18n';

interface FooterProps {
  i18n: FooterTranslations;
}

const Footer = ({ i18n }: FooterProps) => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Acts & Policies */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-headline">{i18n.actsAndPolicies.title}</h4>
            <ul className="space-y-2">
              {footerLinks.actsAndPolicies.map((link) => (
                <li key={link.key}>
                  <Link href={link.href}><div className="text-sm text-gray-300 hover:text-white transition-colors">{i18n.actsAndPolicies.links[link.key as keyof typeof i18n.actsAndPolicies.links]}</div></Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-headline">{i18n.quickLinks.title}</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.key}>
                  <Link href={link.href}><div className="text-sm text-gray-300 hover:text-white transition-colors">{i18n.quickLinks.links[link.key as keyof typeof i18n.quickLinks.links]}</div></Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Related Departments */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-headline">{i18n.relatedDepartments.title}</h4>
            <ul className="space-y-2">
              {footerLinks.relatedDepartments.map((link) => (
                <li key={link.key}>
                  <Link href={link.href}><div className="text-sm text-gray-300 hover:text-white transition-colors">{i18n.relatedDepartments.links[link.key as keyof typeof i18n.relatedDepartments.links]}</div></Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Details */}
          <div>
            <h4 className="text-lg font-bold mb-4 font-headline">{i18n.contact.title}</h4>
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
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {i18n.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Phone } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/whatsapp-icon';

const HelplineBar = () => {
  return (
    <section className="bg-primary/90 text-primary-foreground py-4 mt-8">
      <div className="container mx-auto px-4 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center justify-center gap-2">
            <Phone className="h-6 w-6" />
            <span className="font-bold text-lg">1967</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Phone className="h-6 w-6" />
            <span className="font-bold text-lg">1800-425-5901</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <WhatsAppIcon className="h-6 w-6" />
            <span className="font-bold text-lg">9773904050</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelplineBar;

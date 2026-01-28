import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { citizenServices, cardServices } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { RightSidebarTranslations, ServiceItem } from '@/lib/i18n';

interface ServicePanelProps {
  title: string;
  color: string;
  items: { key: string; icon: React.ElementType; href: string }[];
  i18n: Record<string, ServiceItem>;
}

const ServicePanel = ({ title, color, items, i18n }: ServicePanelProps) => (
  <Card className={cn('shadow-md border-t-4', color)}>
    <CardHeader className="p-4">
      <CardTitle className="text-base font-bold">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.key}>
            <Link href={item.href}>
              <div className="flex items-center text-sm text-gray-700 hover:text-primary hover:bg-gray-100 p-2 rounded-md transition-colors">
                <ChevronRight className="h-4 w-4 mr-2 text-accent" />
                <span>{i18n[item.key].name}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

interface RightSidebarProps {
  i18n: RightSidebarTranslations;
}

const RightSidebar = ({ i18n }: RightSidebarProps) => {
  return (
    <div className="space-y-6">
      <ServicePanel
        {...citizenServices}
        title={i18n.citizenServices.title}
        i18n={i18n.citizenServices.items}
      />
      <ServicePanel
        {...cardServices}
        title={i18n.cardServices.title}
        i18n={i18n.cardServices.items}
      />
    </div>
  );
};

export default RightSidebar;
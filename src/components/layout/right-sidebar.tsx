import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { citizenServices, cardServices, fpsServices } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

const ServicePanel = ({ title, color, items }: { title: string; color: string; items: { name: string; icon: React.ElementType; href: string }[] }) => (
  <Card className={cn('shadow-md border-t-4', color)}>
    <CardHeader className="p-4">
      <CardTitle className="text-base font-bold">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index}>
            <Link href={item.href}>
              <div className="flex items-center text-sm text-gray-700 hover:text-primary hover:bg-gray-100 p-2 rounded-md transition-colors">
                <ChevronRight className="h-4 w-4 mr-2 text-accent" />
                <span>{item.name}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const RightSidebar = () => {
  return (
    <div className="space-y-6">
      <ServicePanel {...citizenServices} />
      <ServicePanel {...cardServices} />
      <ServicePanel {...fpsServices} />
    </div>
  );
};

export default RightSidebar;

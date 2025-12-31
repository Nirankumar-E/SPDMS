import Link from 'next/link';
import { leftSidebarServices } from '@/lib/data';
import { cn } from '@/lib/utils';

const LeftSidebar = () => {
  return (
    <nav className="space-y-2">
      {leftSidebarServices.map((service, index) => (
        <Link href={service.href} key={index}>
          <div
            className={cn(
              'flex items-center text-black p-3 rounded-md transition-transform duration-200 hover:scale-105 hover:shadow-lg',
              service.color
            )}
          >
            <service.icon className="h-5 w-5 mr-3 shrink-0" />
            <span className="text-sm font-semibold">{service.name}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
};

export default LeftSidebar;

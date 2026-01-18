import Link from 'next/link';
import { leftSidebarServices } from '@/lib/data';
import { cn } from '@/lib/utils';

const LeftSidebar = () => {
  return (
    <nav className="space-y-1">
      {leftSidebarServices.map((service, index) => (
        <Link href={service.href} key={index}>
          <div
            className={cn(
              'group flex flex-col items-center justify-center p-2 rounded-lg text-center text-foreground/80 transition-colors hover:bg-secondary',
              service.color
            )}
          >
            <service.icon className="mb-2 h-6 w-6 shrink-0 text-foreground/70 transition-colors group-hover:text-foreground" />
            <span className="text-xs font-medium leading-tight">{service.name.trim()}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
};

export default LeftSidebar;

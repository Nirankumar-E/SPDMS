import Link from 'next/link';
import { leftSidebarServices } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { LeftSidebarTranslations } from '@/lib/i18n';
import { useUser } from '@/firebase';

interface LeftSidebarProps {
  i18n: LeftSidebarTranslations;
}

const LeftSidebar = ({ i18n }: LeftSidebarProps) => {
  const { user } = useUser();
  return (
    <nav className="space-y-1">
      {leftSidebarServices.map((service) => {
        if (service.key === 'rationSelection' && !user) {
          return null;
        }
        return (
          <Link href={service.href} key={service.key}>
            <div
              className={cn(
                'group flex flex-col items-center justify-center p-2 rounded-lg text-center text-foreground/80 transition-colors hover:bg-secondary'
              )}
            >
              <service.icon className="mb-2 h-6 w-6 shrink-0 text-foreground/70 transition-colors group-hover:text-foreground" />
              <span className="text-xs font-medium leading-tight">
                {i18n[service.key as keyof LeftSidebarTranslations]}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default LeftSidebar;

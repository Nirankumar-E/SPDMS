'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fpsServices } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { LeftSidebarTranslations, ServiceItem } from '@/lib/i18n';

interface LeftSidebarProps {
  i18n: LeftSidebarTranslations;
}

const ServicePanel = ({ title, color, items, i18n }: { title: string; color: string; items: any[]; i18n: Record<string, ServiceItem> }) => (
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

const LeftSidebar = ({ i18n }: LeftSidebarProps) => {
  const [complaint, setComplaint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: i18n.complaintSuccess,
      });
      setComplaint('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <nav className="space-y-4">
      {/* FPS Services Panel moved from Right Sidebar */}
      <ServicePanel
        {...fpsServices}
        title={i18n.fpsServices.title}
        i18n={i18n.fpsServices.items}
      />

      {/* Complaint Box */}
      <Card className="shadow-md border-t-4 border-accent">
        <CardHeader className="p-4">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-accent">
            <MessageSquare className="h-5 w-5" />
            {i18n.complaintTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder={i18n.complaintPlaceholder}
              className="resize-none min-h-[120px] text-xs"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-xs" 
              disabled={isSubmitting || !complaint.trim()}
            >
              <Send className="h-3 w-3 mr-2" />
              {isSubmitting ? '...' : i18n.complaintSubmit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </nav>
  );
};

export default LeftSidebar;
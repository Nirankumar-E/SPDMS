'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { LeftSidebarTranslations } from '@/lib/i18n';

interface LeftSidebarProps {
  i18n: LeftSidebarTranslations;
}

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
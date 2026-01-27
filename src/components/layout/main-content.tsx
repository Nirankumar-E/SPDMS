"use client";

import { Card, CardContent } from "@/components/ui/card";
import { stats } from "@/lib/data";
import AnimatedCounter from "@/components/animated-counter";
import Link from "next/link";
import type { MainContentTranslations } from "@/lib/i18n";
import { ShoppingCart, Clock } from 'lucide-react';
import { useUser } from '@/firebase';

interface MainContentProps {
  i18n: MainContentTranslations;
}

const MainContent = ({ i18n }: MainContentProps) => {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-primary font-headline">
        {i18n.title}
      </h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.key} className="text-center shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-center mb-2">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-accent">
                <AnimatedCounter value={stat.value} />
              </h3>
              <p className="text-xs md:text-sm text-gray-600">{i18n.stats[stat.key as keyof MainContentTranslations['stats']]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Banners */}
      <div className="space-y-4">
        <Card className="bg-accent text-accent-foreground p-6 text-center shadow-lg hover:bg-accent/90 transition-colors">
          <Link href="#">
            <h3 className="text-xl font-bold">{i18n.complaint.title}</h3>
            <p className="text-sm mt-1">{i18n.complaint.description}</p>
          </Link>
        </Card>

        <Card className="bg-blue-600 text-white p-6 text-center shadow-lg hover:bg-blue-700 transition-colors">
          <Link href="#">
            <h3 className="text-xl font-bold">{i18n.cardStatus.title}</h3>
            <p className="text-sm mt-1">{i18n.cardStatus.description}</p>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default MainContent;

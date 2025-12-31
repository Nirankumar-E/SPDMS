"use client";

import { Card, CardContent } from "@/components/ui/card";
import { stats } from "@/lib/data";
import AnimatedCounter from "@/components/animated-counter";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const MainContent = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-primary font-headline">
        செயல்படுத்தல் நிலைமை
      </h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-center mb-2">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-accent">
                <AnimatedCounter value={stat.value} />
              </h3>
              <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Banners */}
      <div className="space-y-4">
        <Card className="bg-accent text-accent-foreground p-6 text-center shadow-lg hover:bg-accent/90 transition-colors">
          <Link href="#">
            <h3 className="text-xl font-bold">புகாரைப் பதிவு செய்ய</h3>
            <p className="text-sm mt-1">உங்கள் புகார்களை இங்கே பதிவு செய்யவும்</p>
          </Link>
        </Card>
        <Card className="bg-blue-600 text-white p-6 text-center shadow-lg hover:bg-blue-700 transition-colors">
          <Link href="#">
            <h3 className="text-xl font-bold">தங்கள் அட்டை நிலையை மாற்ற</h3>
            <p className="text-sm mt-1">உங்கள் அட்டை தொடர்பான கோரிக்கைகளின் நிலையை அறிய</p>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default MainContent;

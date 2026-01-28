'use client';

import { useDashboard } from '../layout';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, ArrowLeft, Package, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function TransactionsPage() {
  const { citizen } = useDashboard();
  const { i18n } = useLanguage();
  const transI18n = i18n.transactions;

  if (!citizen) return null;

  // Mock transactions history
  const transactions = [
    { 
      id: "INV-2024-001", 
      date: "2024-10-15", 
      items: "Raw Rice (10kg), Boiled Rice (10kg), Wheat (5kg), Sugar (2kg)",
      status: "Collected"
    },
    { 
      id: "INV-2024-002", 
      date: "2024-09-12", 
      items: "Raw Rice (10kg), Boiled Rice (10kg), Palm Oil (1L), Toor Dal (1kg)",
      status: "Collected"
    },
    { 
      id: "INV-2024-003", 
      date: "2024-08-05", 
      items: "Raw Rice (10kg), Boiled Rice (10kg), Wheat (5kg), Sugar (2kg)",
      status: "Collected"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ArrowLeft /></Link>
          </Button>
          <h2 className="text-2xl font-bold text-primary font-headline">{transI18n.title}</h2>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50/50">
            <div className="flex items-center gap-3">
              <History className="text-primary h-6 w-6" />
              <div>
                <CardTitle className="text-xl">{transI18n.title}</CardTitle>
                <CardDescription>{transI18n.subtitle}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-[120px]">{transI18n.date}</TableHead>
                    <TableHead className="w-[150px]">{transI18n.invoiceNo}</TableHead>
                    <TableHead>{transI18n.items}</TableHead>
                    <TableHead className="text-right">{transI18n.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium text-gray-700">{tx.date}</TableCell>
                      <TableCell className="text-gray-500 font-mono text-xs">{tx.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[200px] md:max-w-none">
                            {tx.items}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {transI18n.collected}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Calendar, History } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  timestamp: number;
  amount: string;
}

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  insurance: {
    title: string;
    paymentHistory: Payment[];
    totalPaid: string;
    installmentFee: string;
  };
}

export function TransactionHistoryModal({ isOpen, onClose, insurance }: TransactionHistoryModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDateOnly = (timestamp: number): string => {
    try {
      return format(new Date(timestamp * 1000), 'yyyy-MM-dd');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Sort payments by timestamp (newest first)
  const sortedPayments = [...insurance.paymentHistory].sort((a, b) => b.timestamp - a.timestamp);

  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPagePayments = sortedPayments.slice(startIndex, endIndex);

  // For summary view (recent payments)
  const recentPayments = sortedPayments.slice(0, 3);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card bg-dao-dark border border-white/20 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,148,0.2)] max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-dao-primary" />
            <DialogTitle>Transaction History - {insurance.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
              <span className="text-foreground/50 mb-1 text-xs block">Total Paid</span>
              <span className="font-medium text-sm">{insurance.totalPaid} ETH</span>
            </div>
            <div className="bg-dao-dark-accent/30 p-3 rounded-lg backdrop-blur-md border border-white/10">
              <span className="text-foreground/50 mb-1 text-xs block">Premium Amount</span>
              <span className="font-medium text-sm">{insurance.installmentFee} ETH</span>
            </div>
          </div>

          {/* Transaction Tabs */}
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recent Payments</TabsTrigger>
              <TabsTrigger value="all">All Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Recent Payments
                </h4>
                
                {recentPayments.length > 0 ? (
                  <div className="space-y-2">
                    {recentPayments.map((payment, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between bg-dao-dark-accent/20 p-3 rounded-lg backdrop-blur-md border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-dao-primary rounded-full"></div>
                          <div>
                            <div className="text-sm font-medium">{formatDateOnly(payment.timestamp)}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/10">
                          {payment.amount} ETH
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-foreground/60">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No payment history available</p>
                  </div>
                )}

                {sortedPayments.length > 3 && (
                  <div className="text-center mt-4">
                    <p className="text-xs text-foreground/66">
                      Showing {Math.min(3, sortedPayments.length)} of {sortedPayments.length} transactions
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="all" className="space-y-4">
              <div className="max-h-96 overflow-y-auto">
                {sortedPayments.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-foreground/70">Date</TableHead>
                          <TableHead className="text-right text-foreground/70">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPagePayments.map((payment, index) => (
                          <TableRow key={startIndex + index} className="border-white/10 hover:bg-dao-dark-accent/20">
                            <TableCell className="font-medium">
                              {formatDateOnly(payment.timestamp)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/10">
                                {payment.amount} ETH
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-dao-dark-accent/30'}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer hover:bg-dao-dark-accent/30"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-dao-dark-accent/30'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}

                    <div className="text-center mt-4">
                      <p className="text-xs text-foreground/60">
                        Showing {startIndex + 1}-{Math.min(endIndex, sortedPayments.length)} of {sortedPayments.length} transactions
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-foreground/60">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No payment history available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketplaceLoanCard } from '@/components/shared/MarketplaceLoanCard';
import { RequestLoanForm } from '@/components/forms/RequestLoanForm';
import { OfferLoanForm } from '@/components/forms/OfferLoanForm';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { Loan } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export default function Marketplace() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQuery({
    queryKey: ['/api/loans/marketplace'],
  });

  const marketplaceLoans = queryClient.data || [];
  const isLoading = queryClient.isLoading;

  const requestLoans = marketplaceLoans.filter((loan: Loan) => loan.type === 'request');
  const offerLoans = marketplaceLoans.filter((loan: Loan) => loan.type === 'offer');

  const handleAcceptLoan = async (loan: Loan) => {
    try {
      await apiRequest('POST', `/api/loans/${loan.id}/accept`, {});
      
      toast({
        title: 'Success!',
        description: loan.type === 'request' 
          ? 'You have successfully funded this loan request.' 
          : 'You have successfully accepted this loan offer.',
      });
      
      queryClient.refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process the loan',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitRequest = () => {
    setShowRequestForm(false);
    queryClient.refetch();
    toast({
      title: 'Request Created',
      description: 'Your loan request has been posted to the marketplace.',
    });
  };

  const handleSubmitOffer = () => {
    setShowOfferForm(false);
    queryClient.refetch();
    toast({
      title: 'Offer Created',
      description: 'Your loan offer has been posted to the marketplace.',
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <motion.h1 
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Loan Marketplace
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Discover lending and borrowing opportunities in the Bitcoin ecosystem
            </motion.p>
          </div>
          <motion.div 
            className="flex space-x-3 mt-4 sm:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              onClick={() => setShowRequestForm(true)}
              className="btn-gradient-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="ri-add-line mr-2"></i> Request Loan
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowOfferForm(true)}
              className="border-accent text-accent hover:bg-accent/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="ri-coin-line mr-2"></i> Offer Loan
            </Button>
          </motion.div>
        </div>

        <Card className="border border-border rounded-xl overflow-hidden shadow-lg">
          <Tabs defaultValue="requests">
            <CardContent className="pt-6">
              <TabsList className="grid grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Loan Requests ({requestLoans.length})
                </TabsTrigger>
                <TabsTrigger value="offers" className="data-[state=active]:bg-accent data-[state=active]:text-white">
                  Loan Offers ({offerLoans.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="requests">
                {isLoading ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <SkeletonLoader type="card" count={6} />
                  </div>
                ) : requestLoans.length === 0 ? (
                  <EmptyState
                    icon="inbox-line"
                    title="No loan requests available"
                    description="Be the first to create a loan request or check back later for new opportunities"
                    action={{
                      label: "Create Loan Request",
                      onClick: () => setShowRequestForm(true)
                    }}
                  />
                ) : (
                  <motion.div 
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {requestLoans.map((loan: Loan, index: number) => (
                      <motion.div 
                        key={loan.id} 
                        variants={fadeIn}
                        transition={{ delay: index * 0.1 }}
                      >
                        <MarketplaceLoanCard 
                          loan={loan}
                          rating={4.5}
                          onAccept={handleAcceptLoan}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
              
              <TabsContent value="offers">
                {isLoading ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <SkeletonLoader type="card" count={6} />
                  </div>
                ) : offerLoans.length === 0 ? (
                  <EmptyState
                    icon="store-2-line"
                    title="No loan offers available"
                    description="Be the first to create a loan offer or check back later for new opportunities"
                    action={{
                      label: "Create Loan Offer",
                      onClick: () => setShowOfferForm(true)
                    }}
                  />
                ) : (
                  <motion.div 
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {offerLoans.map((loan: Loan, index: number) => (
                      <motion.div 
                        key={loan.id} 
                        variants={fadeIn}
                        transition={{ delay: index * 0.1 }}
                      >
                        <MarketplaceLoanCard 
                          loan={loan}
                          rating={4.7}
                          onAccept={handleAcceptLoan}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </motion.div>

      {showRequestForm && (
        <RequestLoanForm 
          isOpen={showRequestForm} 
          onClose={() => setShowRequestForm(false)}
          onSuccess={handleSubmitRequest}
        />
      )}

      {showOfferForm && (
        <OfferLoanForm 
          isOpen={showOfferForm} 
          onClose={() => setShowOfferForm(false)}
          onSuccess={handleSubmitOffer}
        />
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanCard } from '@/components/shared/LoanCard';
import { Loan } from '@shared/schema';
import { LoanDetailsDialog } from '@/components/dialogs/LoanDetailsDialog';
import { RepaymentForm } from '@/components/forms/RepaymentForm';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Loans() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showRepayForm, setShowRepayForm] = useState(false);

  const { data: loans, isLoading, refetch } = useQuery({
    queryKey: ['/api/loans'],
  });

  const borrowedLoans = loans?.filter((loan: Loan) => loan.type === 'request') || [];
  const lentLoans = loans?.filter((loan: Loan) => loan.type === 'offer') || [];

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowLoanDetails(true);
  };

  const handleRepay = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowRepayForm(true);
  };

  const handleRepaymentSuccess = () => {
    setShowRepayForm(false);
    refetch();
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Loans</h1>
        </div>

        <Card>
          <Tabs defaultValue="borrowed">
            <CardContent className="pt-6">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="borrowed">Borrowed</TabsTrigger>
                <TabsTrigger value="lent">Lent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="borrowed">
                {isLoading ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your borrowed loans...</p>
                  </div>
                ) : borrowedLoans.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">You don't have any borrowed loans.</p>
                  </div>
                ) : (
                  <motion.div 
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                  >
                    {borrowedLoans.map((loan: Loan) => (
                      <motion.div key={loan.id} variants={fadeIn}>
                        <LoanCard 
                          loan={loan}
                          onViewDetails={handleViewDetails}
                          onRepay={handleRepay}
                          showRepayButton={true}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
              
              <TabsContent value="lent">
                {isLoading ? (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your lent loans...</p>
                  </div>
                ) : lentLoans.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">You don't have any lent loans.</p>
                  </div>
                ) : (
                  <motion.div 
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.1
                        }
                      }
                    }}
                  >
                    {lentLoans.map((loan: Loan) => (
                      <motion.div key={loan.id} variants={fadeIn}>
                        <LoanCard 
                          loan={loan}
                          onViewDetails={handleViewDetails}
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

      {selectedLoan && (
        <>
          <LoanDetailsDialog 
            loan={selectedLoan} 
            isOpen={showLoanDetails} 
            onClose={() => setShowLoanDetails(false)}
            onRepay={() => {
              setShowLoanDetails(false);
              setShowRepayForm(true);
            }}
          />
          
          <RepaymentForm
            loan={selectedLoan}
            isOpen={showRepayForm}
            onClose={() => setShowRepayForm(false)}
            onSuccess={handleRepaymentSuccess}
          />
        </>
      )}
    </div>
  );
}

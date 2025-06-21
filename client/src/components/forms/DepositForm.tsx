import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { formatBTC, formatUSD } from '@/lib/utils';

const formSchema = z.object({
  amount: z.number().min(0.001, {
    message: "Amount must be at least 0.001 BTC",
  }).max(10, {
    message: "Amount cannot exceed 10 BTC",
  }),
});

interface DepositFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositForm({ isOpen, onClose }: DepositFormProps) {
  const { toast } = useToast();
  const { wallet, depositFunds } = useUserWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0.1,
    },
  });

  const walletBalance = wallet.balance ? parseFloat(wallet.balance) : 0;
  const depositAmount = form.watch('amount') || 0;
  const usdValue = depositAmount * 35000; // Mock BTC rate

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    
    if (values.amount > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough BTC in your wallet",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await depositFunds(values.amount);
      
      if (success) {
        onClose();
      }
    } catch (error) {
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to process your deposit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Deposit Bitcoin</DialogTitle>
          <DialogDescription>
            Add funds to your BitLend account from your connected wallet.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="p-3 bg-muted rounded-md flex justify-between items-center">
              <span className="text-sm">Available in wallet:</span>
              <span className="font-medium">{formatBTC(walletBalance)}</span>
            </div>
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (BTC)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={0.001}
                      min={0.001}
                      max={walletBalance}
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value)) {
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount you want to deposit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between text-sm p-3 border rounded-md">
              <span className="text-muted-foreground">Approximate USD value:</span>
              <span className="font-medium">{formatUSD(usdValue)}</span>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || depositAmount > walletBalance}
              >
                {isSubmitting ? "Processing..." : "Deposit Funds"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

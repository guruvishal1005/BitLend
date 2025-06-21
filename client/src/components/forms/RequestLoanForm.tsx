import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatBTC, calculateRepaymentAmount } from '@/lib/utils';

const formSchema = z.object({
  amount: z.number().min(0.01, {
    message: "Amount must be at least 0.01 BTC",
  }).max(10, {
    message: "Amount cannot exceed 10 BTC",
  }),
  interest: z.number().min(1, {
    message: "Interest rate must be at least 1%",
  }).max(15, {
    message: "Interest rate cannot exceed 15%",
  }),
  durationMonths: z.number().int().min(1, {
    message: "Duration must be at least 1 month",
  }).max(36, {
    message: "Duration cannot exceed 36 months",
  }),
  hasCollateral: z.boolean().default(false),
});

interface RequestLoanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RequestLoanForm({ isOpen, onClose, onSuccess }: RequestLoanFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0.5,
      interest: 5,
      durationMonths: 6,
      hasCollateral: false,
    },
  });

  const watchAmount = form.watch('amount');
  const watchInterest = form.watch('interest');
  const watchDuration = form.watch('durationMonths');

  const repaymentAmount = calculateRepaymentAmount(
    watchAmount, 
    watchInterest, 
    watchDuration
  );

  const monthlyPayment = repaymentAmount / watchDuration;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await apiRequest('POST', '/api/loans/request', values);
      
      toast({
        title: "Loan Request Created",
        description: "Your loan request has been successfully posted to the marketplace.",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create loan request",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request a Loan</DialogTitle>
          <DialogDescription>
            Create a loan request to borrow Bitcoin from lenders.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Amount (BTC)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Slider
                        min={0.01}
                        max={10}
                        step={0.01}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        className="w-20"
                        step={0.01}
                        min={0.01}
                        max={10}
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Amount of Bitcoin you want to borrow
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interest Rate (%)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Slider
                        min={1}
                        max={15}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        className="w-20"
                        step={0.1}
                        min={1}
                        max={15}
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Yearly interest rate you're willing to pay
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="durationMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Months)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Slider
                        min={1}
                        max={36}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        className="w-20"
                        min={1}
                        max={36}
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Loan repayment period
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasCollateral"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                  <div className="space-y-0.5">
                    <FormLabel>Collateral</FormLabel>
                    <FormDescription>
                      Are you offering collateral for this loan?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="p-4 border rounded-md bg-muted">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Repayment</span>
                <span className="font-medium">{formatBTC(repaymentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly Payment</span>
                <span className="font-medium">{formatBTC(monthlyPayment)}</span>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Loan Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

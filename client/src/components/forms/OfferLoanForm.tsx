import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { calculateRepaymentAmount, formatCurrency, convertToUSD, formatUSD } from '@/lib/utils';
import { CurrencyIcon } from '@/components/ui/currency-icon';
import { Currency } from '@shared/schema';

const formSchema = z.object({
  amount: z.number().min(0.01, {
    message: "Amount must be at least 0.01",
  }).max(100, {
    message: "Amount cannot exceed 100",
  }),
  currency: z.enum(['BTC', 'ETH', 'SOL']).default('BTC'),
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

interface OfferLoanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OfferLoanForm({ isOpen, onClose, onSuccess }: OfferLoanFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0.5,
      currency: 'BTC',
      interest: 4,
      durationMonths: 6,
      hasCollateral: true,
    },
  });

  const watchAmount = form.watch('amount');
  const watchCurrency = form.watch('currency');
  const watchInterest = form.watch('interest');
  const watchDuration = form.watch('durationMonths');

  const expectedReturn = calculateRepaymentAmount(
    watchAmount, 
    watchInterest, 
    watchDuration
  );

  const profitAmount = expectedReturn - watchAmount;
  const usdValue = convertToUSD(watchAmount, watchCurrency as Currency);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await apiRequest('POST', '/api/loans/offer', values);
      
      toast({
        title: "Loan Offer Created",
        description: "Your loan offer has been successfully posted to the marketplace.",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create loan offer",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Offer a Loan</DialogTitle>
          <DialogDescription>
            Create a loan offer to lend your cryptocurrency to borrowers.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-4">
                        <Slider
                          min={0.01}
                          max={100}
                          step={0.01}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          className="w-24"
                          step={0.01}
                          min={0.01}
                          max={100}
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
                      Amount you want to lend
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BTC">
                          <div className="flex items-center">
                            <CurrencyIcon currency="BTC" className="mr-2" size={16} />
                            Bitcoin (BTC)
                          </div>
                        </SelectItem>
                        <SelectItem value="ETH">
                          <div className="flex items-center">
                            <CurrencyIcon currency="ETH" className="mr-2" size={16} />
                            Ethereum (ETH)
                          </div>
                        </SelectItem>
                        <SelectItem value="SOL">
                          <div className="flex items-center">
                            <CurrencyIcon currency="SOL" className="mr-2" size={16} />
                            Solana (SOL)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Cryptocurrency to lend
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                    Yearly interest rate you want to earn
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
                    <FormLabel>Require Collateral</FormLabel>
                    <FormDescription>
                      Require borrowers to provide collateral?
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
                <span className="text-sm text-muted-foreground">Loan Amount</span>
                <span className="font-medium flex items-center">
                  <CurrencyIcon currency={watchCurrency as Currency} className="mr-1" size={16} />
                  {formatCurrency(watchAmount, watchCurrency as Currency)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">USD Value</span>
                <span className="font-medium">{formatUSD(usdValue)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Expected Return</span>
                <span className="font-medium">{formatCurrency(expectedReturn, watchCurrency as Currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Profit</span>
                <span className="font-medium text-success">{formatCurrency(profitAmount, watchCurrency as Currency)}</span>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Loan Offer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BitcoinIcon } from '@/components/ui/bitcoin-icon';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/use-auth';
import { WalletModal } from '@/components/shared/WalletModal';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function Login() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [, setLocation] = useLocation();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      setLocation('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = () => {
    setIsWalletModalOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BitcoinIcon className="text-primary text-5xl mr-3" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            </motion.div>
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              BitLend
            </motion.h1>
          </div>
          <motion.p 
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Bitcoin P2P Lending Platform
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
            <Tabs defaultValue="email">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to your account to access your dashboard
                </CardDescription>
                <TabsList className="grid grid-cols-2 mt-6 bg-muted/50">
                  <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="wallet" className="data-[state=active]:bg-accent data-[state=active]:text-white">
                    Wallet
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <TabsContent value="email">
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your@email.com" 
                                className="focus:border-primary transition-colors"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                className="focus:border-primary transition-colors"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          type="submit" 
                          className="w-full btn-gradient-primary h-12 text-base font-medium" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Signing in...
                            </>
                          ) : (
                            <>
                              <i className="ri-login-circle-line mr-2"></i>
                              Sign In
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-center w-full">
                    <a href="#" className="text-sm text-primary hover:underline transition-colors">
                      Forgot password?
                    </a>
                  </div>
                  <div className="text-center w-full">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <a href="#" className="text-primary hover:underline transition-colors font-medium">
                        Sign up
                      </a>
                    </p>
                  </div>
                </CardFooter>
              </TabsContent>
              
              <TabsContent value="wallet">
                <CardContent className="text-center py-8">
                  <motion.div 
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/10 p-8 mb-6"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <BitcoinIcon className="text-primary text-5xl" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">Connect with MetaMask</h3>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Use your cryptocurrency wallet to sign in securely without a password.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full btn-gradient-accent h-12 text-base font-medium"
                      onClick={handleConnectWallet}
                    >
                      <i className="ri-wallet-3-line mr-2"></i>
                      Connect Wallet
                    </Button>
                  </motion.div>
                </CardContent>
                
                <CardFooter className="text-center">
                  <p className="text-sm text-muted-foreground w-full">
                    By connecting your wallet, you agree to our{" "}
                    <a href="#" className="text-primary hover:underline transition-colors">
                      Terms of Service
                    </a>
                  </p>
                </CardFooter>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </motion.div>
      
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </div>
  );
}
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./contexts/AuthContext";
import { WalletContextProvider } from "./contexts/WalletContext";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Layout from "./components/layout/Layout";
import Marketplace from "./pages/marketplace";
import Loans from "./pages/loans";
import Transactions from "./pages/transactions";
import Wallet from "./pages/wallet";
import Settings from "./pages/settings";
import Help from "./pages/help";

function PrivateRoute({ component: Component, ...rest }: { component: React.ComponentType, path: string }) {
  return (
    <Route
      {...rest}
      component={(props: any) => (
        <Layout>
          <Component {...props} />
        </Layout>
      )}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <PrivateRoute path="/" component={Dashboard} />
      <PrivateRoute path="/dashboard" component={Dashboard} />
      <PrivateRoute path="/marketplace" component={Marketplace} />
      <PrivateRoute path="/loans" component={Loans} />
      <PrivateRoute path="/transactions" component={Transactions} />
      <PrivateRoute path="/wallet" component={Wallet} />
      <PrivateRoute path="/settings" component={Settings} />
      <PrivateRoute path="/help" component={Help} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletContextProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </WalletContextProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

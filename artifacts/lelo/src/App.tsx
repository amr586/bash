import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteSettingsProvider } from "@/lib/site-settings";
import { ThemeProvider } from "@/lib/theme";
import { LangProvider } from "@/lib/i18n";
import { WelcomeGreeting } from "@/components/welcome-greeting";
import { Header } from "@/components/header";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin-users";
import DashboardPage from "@/pages/dashboard";
import AddPropertyPage from "@/pages/add-property";
import EditPropertyPage from "@/pages/edit-property";
import PropertiesPage from "@/pages/properties";
import PropertyDetailPage from "@/pages/property-detail";

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/create-account" component={LoginPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/add-property" component={AddPropertyPage} />
        <Route path="/edit-property/:id" component={EditPropertyPage} />
        <Route path="/properties" component={PropertiesPage} />
        <Route path="/properties/:id" component={PropertyDetailPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LangProvider>
        <SiteSettingsProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
            <WelcomeGreeting />
          </TooltipProvider>
        </SiteSettingsProvider>
        </LangProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

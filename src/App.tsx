import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import RemixHistoryPage from "./pages/RemixHistoryPage";
import MyLibraryPage from "./pages/MyLibraryPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import ProcessingPage from "./pages/ProcessingPage";
import RemixResultPage from "./pages/RemixResultPage";
import GenerateAudioPage from "./pages/GenerateAudioPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import { UserProvider } from "./context/UserContext";
import RemixStudio from "./components/RemixStudio";
import MusicLibrary from './components/MusicLibrary';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/remix-history" element={<RemixHistoryPage />} />
              <Route path="/my-library" element={<MyLibraryPage />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/remix-result" element={<RemixResultPage />} />
              <Route path="/remix-result/:id" element={<RemixResultPage />} />
              <Route path="/generate-audio" element={<GenerateAudioPage />} />
              <Route path="/remix-studio" element={<RemixStudio />} />
              <Route path="/library" element={<MusicLibrary />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;

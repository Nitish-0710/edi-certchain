import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import StudentCredentialsPage from "./pages/StudentCredentialsPage";
import StudentSharePage from "./pages/StudentSharePage";
import StudentWalletPage from "./pages/StudentWalletPage";
import CredentialDetailPage from "./pages/CredentialDetailPage";
import IssuerDashboard from "./pages/IssuerDashboard";
import IssueCredentialPage from "./pages/IssueCredentialPage";
import IssuerCredentialsPage from "./pages/IssuerCredentialsPage";
import IssuerRecordsPage from "./pages/IssuerRecordsPage";
import VerificationPortal from "./pages/VerificationPortal";
import VerifierDashboard from "./pages/VerifierDashboard";
import VerifierSearchPage from "./pages/VerifierSearchPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/credentials" element={<StudentCredentialsPage />} />
            <Route path="/student/share" element={<StudentSharePage />} />
            <Route path="/student/wallet" element={<StudentWalletPage />} />
            <Route path="/student/credential/:id" element={<CredentialDetailPage />} />
            <Route path="/issuer" element={<IssuerDashboard />} />
            <Route path="/issuer/issue" element={<IssueCredentialPage />} />
            <Route path="/issuer/credentials" element={<IssuerCredentialsPage />} />
            <Route path="/issuer/records" element={<IssuerRecordsPage />} />
            <Route path="/verifier" element={<VerifierDashboard />} />
            <Route path="/verifier/verify" element={<VerifierSearchPage />} />
            <Route path="/verify" element={<VerificationPortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const PermitDashboard = lazy(() => import('./pages/PermitDashboard'));
const PermitList = lazy(() => import('./pages/PermitList'));
const PermitSubmission = lazy(() => import('./pages/PermitSubmission'));
const PermitDetail = lazy(() => import('./pages/PermitDetail'));
const PermitApproval = lazy(() => import('./pages/PermitApproval'));
const PermitInspection = lazy(() => import('./pages/PermitInspection'));
const PermitMasterData = lazy(() => import('./pages/PermitMasterData'));
const RefundDashboard = lazy(() => import('./pages/RefundDashboard'));
const RefundList = lazy(() => import('./pages/RefundList'));
const RefundSubmission = lazy(() => import('./pages/RefundSubmission'));
const RefundDetail = lazy(() => import('./pages/RefundDetail'));
const RefundVerification = lazy(() => import('./pages/RefundVerification'));
const RefundInspectionPage = lazy(() => import('./pages/RefundInspectionPage'));
const RefundFinancePage = lazy(() => import('./pages/RefundFinancePage'));
const RefundRequest = lazy(() => import('./pages/RefundRequest'));
const RefundAdmin = lazy(() => import('./pages/RefundAdmin'));
const AdminPermitDashboard = lazy(() => import('./pages/AdminPermitDashboard'));
const AdminPermitList = lazy(() => import('./pages/AdminPermitList'));
const AdminPermitDetail = lazy(() => import('./pages/AdminPermitDetail'));
const RefundAdminProcess = lazy(() => import('./pages/RefundAdminProcess'));
const AdminLottery = lazy(() => import('./pages/AdminLottery'));
const LotteryPage = lazy(() => import('./pages/LotteryPage'));
const MockLogin = lazy(() => import('./pages/MockLogin'));

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background/60">
    <div className="w-7 h-7 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
  </div>
);

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/PermitDashboard" element={<PermitDashboard />} />
      <Route path="/PermitList" element={<PermitList />} />
      <Route path="/PermitSubmission" element={<PermitSubmission />} />
      <Route path="/PermitDetail" element={<PermitDetail />} />
      <Route path="/PermitApproval" element={<PermitApproval />} />
      <Route path="/PermitInspection" element={<PermitInspection />} />
      <Route path="/PermitMasterData" element={<PermitMasterData />} />
      <Route path="/RefundDashboard" element={<RefundDashboard />} />
      <Route path="/RefundList" element={<RefundList />} />
      <Route path="/RefundSubmission" element={<RefundSubmission />} />
      <Route path="/RefundDetail" element={<RefundDetail />} />
      <Route path="/RefundVerification" element={<RefundVerification />} />
      <Route path="/RefundInspectionPage" element={<RefundInspectionPage />} />
      <Route path="/RefundFinancePage" element={<RefundFinancePage />} />
      <Route path="/RefundRequest" element={<LayoutWrapper currentPageName="RefundRequest"><RefundRequest /></LayoutWrapper>} />
      <Route path="/RefundAdmin" element={<RefundAdmin />} />
      <Route path="/AdminPermitDashboard" element={<AdminPermitDashboard />} />
      <Route path="/AdminPermitList" element={<AdminPermitList />} />
      <Route path="/AdminPermitDetail" element={<AdminPermitDetail />} />
      <Route path="/RefundAdminProcess" element={<RefundAdminProcess />} />
      <Route path="/AdminLottery" element={<AdminLottery />} />
      <Route path="/LotteryPage" element={<LotteryPage />} />
      <Route path="/MockLogin" element={<MockLogin />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// ✅ استيراد صفحات الملف الشخصي بشكل عادي (في الأعلى)
import CraftsmanProfilePage from './pages/CraftsmanProfilePage';
import CustomerProfilePage from './pages/CustomerProfilePage';

// ✅ صفحة التقييمات العامة (بدون تسجيل دخول)
import PublicReviewsPage from './pages/PublicReviewsPage';

// ===== Lazy Loading للصفحات =====
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const RoleSelectionPage = lazy(() => import('./pages/RoleSelectionPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const CustomerSignupPage = lazy(() => import('./pages/CustomerSignupPage'));
const CraftsmanSignupPage = lazy(() => import('./pages/CraftsmanSignupPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const HelpSupportPage = lazy(() => import('./pages/HelpSupportPage'));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const RequestServicePage = lazy(() => import('./pages/RequestServicePage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const CraftsmanDetailPage = lazy(() => import('./pages/CraftsmanDetailPage'));
const ReviewsListPage = lazy(() => import('./pages/ReviewsListPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const CustomerHomePage = lazy(() => import('./pages/CustomerHomePage'));
const CraftsmanHomePage = lazy(() => import('./pages/CraftsmanHomePage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const NotificationsViewPage = lazy(() => import('./pages/NotificationsViewPage'));
const ServicePostDetailPage = lazy(() => import('./pages/ServicePostDetailPage'));

// ✅ صفحة طلباتي (Service Posts) للعميل
const MyRequestsPage = lazy(() => import('./pages/MyRequestsPage'));

// ============================================================
// 🌀 مكون Loader
// ============================================================
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
        جاري التحميل...
      </p>
    </div>
  </div>
);

// ============================================================
// 👤 ProfileRouter - بدون lazy()
// ============================================================
const ProfileRouter = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) return null;

  if (user?.role === 'craftsman') {
    return <CraftsmanProfilePage />;
  }
  
  if (user?.role === 'client' || user?.role === 'customer') {
    return <CustomerProfilePage />;
  }
  
  return <CustomerProfilePage />;
};

// ============================================================
// 🏠 App Component
// ============================================================
function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ============================================================
                     ✅ صفحات عامة (بدون تسجيل دخول)
                     ============================================================ */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/select-role" element={<RoleSelectionPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/signup/customer" element={<CustomerSignupPage />} />
                <Route path="/signup/craftsman" element={<CraftsmanSignupPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/help" element={<HelpSupportPage />} />
                <Route path="/terms" element={<TermsConditionsPage />} />

                {/* ============================================================
                     ✅ صفحات محمية (تسجيل دخول مطلوب)
                     ============================================================ */}
                <Route path="/search" element={
                  <ProtectedRoute>
                    <SearchResultsPage />
                  </ProtectedRoute>
                } />
                <Route path="/request-service" element={
                  <ProtectedRoute>
                    <RequestServicePage />
                  </ProtectedRoute>
                } />
                <Route path="/booking/:id" element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                } />
                <Route path="/craftsman/:id" element={
                  <ProtectedRoute>
                    <CraftsmanDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <NotificationsViewPage />
                  </ProtectedRoute>
                } />
                <Route path="/service-post/:id" element={
                  <ProtectedRoute>
                    <ServicePostDetailPage />
                  </ProtectedRoute>
                } />

                {/* ============================================================
                     ✅ صفحات العميل (Client)
                     ============================================================ */}
                <Route path="/customer/home" element={
                  <ProtectedRoute requiredRole="client">
                    <CustomerHomePage />
                  </ProtectedRoute>
                } />
                <Route path="/my-bookings" element={
                  <ProtectedRoute requiredRole="client">
                    <MyBookingsPage />
                  </ProtectedRoute>
                } />
                {/* ✅ طلباتي (Service Posts) - للعميل */}
                <Route path="/my-requests" element={
                  <ProtectedRoute requiredRole="client">
                    <MyRequestsPage />
                  </ProtectedRoute>
                } />

                {/* ============================================================
                     ✅ صفحات الحرفي (Craftsman)
                     ============================================================ */}
                <Route path="/craftsman/home" element={
                  <ProtectedRoute requiredRole="craftsman">
                    <CraftsmanHomePage />
                  </ProtectedRoute>
                } />
                <Route path="/subscription" element={
                  <ProtectedRoute requiredRole="craftsman">
                    <SubscriptionPage />
                  </ProtectedRoute>
                } />

                {/* ============================================================
                     ✅ الملف الشخصي
                     ============================================================ */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfileRouter />
                  </ProtectedRoute>
                } />

                {/* ============================================================
                     ✅ التقييمات - مساران: عام ومحمي
                     ============================================================ */}
                {/* ✅ التقييمات العامة - بدون تسجيل دخول */}
                <Route path="/reviews" element={<PublicReviewsPage />} />

                {/* ✅ التقييمات المحمية - للمستخدمين المسجلين فقط */}
                <Route path="/my-reviews" element={
                  <ProtectedRoute>
                    <ReviewsListPage />
                  </ProtectedRoute>
                } />

                {/* ============================================================
                     ✅ 404 - صفحة غير موجودة
                     ============================================================ */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
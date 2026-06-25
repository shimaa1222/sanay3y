// src/pages/CraftsmanHomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import api from '../services/api';
import { 
  Phone, Star, MapPin, Calendar,
  Clock, CheckCircle, XCircle, TrendingUp,
  Users, Wrench, DollarSign, ArrowRight,
  Bell, Settings, Award, BarChart3, Loader,
  Sparkles, AlertCircle, RefreshCw, Eye, User,
  FileText, MessageCircle
} from 'lucide-react';

const CraftsmanHomePage = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  
  // ✅ طلبات خاصة (Bookings) - حجوزات موجهة للحرفي
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  
  // ✅ طلبات عامة (Service Posts) - منشورات في نفس المهنة
  const [servicePosts, setServicePosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ 
    pending: 0, 
    completed: 0, 
    total: 0, 
    earnings: 0,
    rating: 0,
    reviews_count: 0,
    is_featured: false
  });
  const [actionLoading, setActionLoading] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [craftsmanId, setCraftsmanId] = useState(null);

  // Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ✅ Load all data
  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. جلب إحصائيات الحرفي
      const statsData = await api.getCraftsmanStats();
      setStats({
        pending: statsData.stats?.pending_bookings || 0,
        completed: statsData.stats?.completed_bookings || 0,
        total: (statsData.stats?.pending_bookings || 0) + (statsData.stats?.completed_bookings || 0) + (statsData.stats?.cancelled_bookings || 0),
        earnings: statsData.stats?.total_earnings || 0,
        rating: statsData.stats?.rating || 0,
        reviews_count: statsData.stats?.reviews_count || 0,
        is_featured: statsData.stats?.is_featured || false,
      });
      
      // 2. جلب الحجوزات الخاصة (Bookings)
      await loadMyBookings();
      
      // 3. جلب منشورات الخدمات العامة (Service Posts)
      await loadServicePosts();
      
    } catch (error) {
      console.error('Error loading craftsman data:', error);
    }
    setRefreshing(false);
  }, []);

  // ✅ جلب الحجوزات الخاصة - GET /craftsman/bookings
  const loadMyBookings = async () => {
    setBookingsLoading(true);
    try {
      const bookingsData = await api.getCraftsmanBookings();
      const allBookings = bookingsData.bookings?.data || [];
      
      // عرض الحجوزات قيد الانتظار فقط في القائمة الرئيسية
      const pendingBookings = allBookings.filter(b => b.status === 'pending');
      setMyBookings(pendingBookings);
      
      // تحديث الإحصائيات
      setStats(prev => ({
        ...prev,
        pending: pendingBookings.length,
      }));
      
    } catch (error) {
      console.error('Error loading bookings:', error);
      setMyBookings([]);
    }
    setBookingsLoading(false);
  };

  // ✅ جلب منشورات الخدمات العامة - GET /craftsman/service-posts
  const loadServicePosts = async () => {
    setPostsLoading(true);
    try {
      // جلب بيانات الحرفي للحصول على المدينة والمهنة
      const meData = await api.getMe();
      const craftsman = meData.user?.craftsman;
      
      if (craftsman) {
        setCraftsmanId(craftsman.id);
        const postsData = await api.getServicePosts({
          city: craftsman.city,
          craft_id: craftsman.crafts?.[0]?.id || '',
          per_page: 20,
        });
        setServicePosts(postsData.posts?.data || []);
      } else {
        setServicePosts([]);
      }
    } catch (error) {
      console.error('Error loading service posts:', error);
      setServicePosts([]);
    }
    setPostsLoading(false);
  };

  useEffect(() => {
    loadAllData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, [loadAllData]);

  // Handle refresh
  const handleRefresh = () => {
    loadAllData();
  };

  // Show feedback message
  const showFeedback = (message) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  // ✅ قبول حجز (Booking) - PATCH /craftsman/bookings/{id}/status
  const handleAcceptBooking = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: 'accept' }));
    
    try {
      await api.updateBookingStatus(bookingId, 'confirmed');
      showFeedback(lang === 'ar' ? '✅ تم قبول الطلب بنجاح!' : '✅ Request accepted successfully!');
      
      // تحديث القائمة
      setMyBookings(prev => prev.filter(r => r.id !== bookingId));
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        completed: prev.completed + 1
      }));
    } catch (error) {
      console.error('Accept error:', error);
      showFeedback(error.message || (lang === 'ar' ? '❌ حدث خطأ' : '❌ Error occurred'));
    }
    
    setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: null }));
  };

  // ✅ رفض حجز (Booking) - PATCH /craftsman/bookings/{id}/status
  const handleRejectBooking = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: 'reject' }));
    
    const reason = prompt(lang === 'ar' ? 'اكتب سبب الرفض (اختياري):' : 'Enter rejection reason (optional):');
    
    try {
      await api.updateBookingStatus(bookingId, 'rejected', reason || 'غير متاح');
      showFeedback(lang === 'ar' ? '❌ تم رفض الطلب' : '❌ Request rejected');
      
      // تحديث القائمة
      setMyBookings(prev => prev.filter(r => r.id !== bookingId));
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1
      }));
    } catch (error) {
      console.error('Reject error:', error);
      showFeedback(error.message || (lang === 'ar' ? '❌ حدث خطأ' : '❌ Error occurred'));
    }
    
    setActionLoading(prev => ({ ...prev, [`booking_${bookingId}`]: null }));
  };

  // ✅ الرد على منشور خدمة (Service Post) - POST /craftsman/service-posts/{id}/respond
  const handleRespondToPost = async (postId) => {
    setActionLoading(prev => ({ ...prev, [`post_${postId}`]: 'respond' }));
    
    const message = prompt(lang === 'ar' ? 'اكتب عرضك للحرفي:' : 'Write your offer to the craftsman:');
    if (!message) {
      setActionLoading(prev => ({ ...prev, [`post_${postId}`]: null }));
      return;
    }
    
    const price = prompt(lang === 'ar' ? 'السعر المقترح (اختياري):' : 'Offered price (optional):');
    const days = prompt(lang === 'ar' ? 'عدد الأيام المتوقعة (اختياري):' : 'Estimated days (optional):');
    
    try {
      const responseData = {
        message: message,
        offered_price: price ? parseFloat(price) : undefined,
        estimated_days: days ? parseInt(days) : undefined,
      };
      
      await api.respondToServicePost(postId, responseData);
      showFeedback(lang === 'ar' ? '✅ تم إرسال ردك بنجاح!' : '✅ Response sent successfully!');
      
      // تحديث القائمة - إخفاء المنشور الذي تم الرد عليه
      setServicePosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Respond error:', error);
      showFeedback(error.message || (lang === 'ar' ? '❌ حدث خطأ' : '❌ Error occurred'));
    }
    
    setActionLoading(prev => ({ ...prev, [`post_${postId}`]: null }));
  };

  // Translations
  const t = {
    welcome: lang === 'ar' ? 'مرحباً' : 'Welcome',
    newRequests: (count) => lang === 'ar' ? `لديك ${count} طلبات جديدة` : `You have ${count} new requests`,
    pending: lang === 'ar' ? 'طلبات جديدة' : 'New Requests',
    completed: lang === 'ar' ? 'مكتملة' : 'Completed',
    total: lang === 'ar' ? 'إجمالي الطلبات' : 'Total Requests',
    earnings: lang === 'ar' ? 'الأرباح' : 'Earnings',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    incomingRequests: lang === 'ar' ? 'طلباتي الخاصة' : 'My Requests',
    noRequests: lang === 'ar' ? 'لا توجد طلبات جديدة 🎉' : 'No new requests 🎉',
    noRequestsDesc: lang === 'ar' ? 'كل الطلبات الجديدة هتظهر هنا' : 'All new requests will appear here',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    waiting: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
    quickLinks: lang === 'ar' ? 'روابط سريعة' : 'Quick Links',
    profile: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
    subscriptions: lang === 'ar' ? 'الاشتراكات' : 'Subscriptions',
    accept: lang === 'ar' ? 'قبول' : 'Accept',
    reject: lang === 'ar' ? 'رفض' : 'Reject',
    accepting: lang === 'ar' ? 'جاري...' : '...',
    rejecting: lang === 'ar' ? 'جاري...' : '...',
    refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
    customer: lang === 'ar' ? 'العميل' : 'Customer',
    date: lang === 'ar' ? 'التاريخ' : 'Date',
    description: lang === 'ar' ? 'الوصف' : 'Description',
    rating: lang === 'ar' ? 'التقييم' : 'Rating',
    featured: lang === 'ar' ? 'مميز' : 'Featured',
    generalRequests: lang === 'ar' ? 'طلبات عامة' : 'General Requests',
    generalRequestsDesc: lang === 'ar' ? 'طلبات من عملاء يبحثون عن حرفي' : 'Requests from clients looking for a craftsman',
    noGeneralRequests: lang === 'ar' ? 'لا توجد طلبات عامة' : 'No general requests',
    respond: lang === 'ar' ? 'رد' : 'Respond',
    alreadyResponded: lang === 'ar' ? 'تم الرد' : 'Responded',
    budget: lang === 'ar' ? 'الميزانية' : 'Budget',
    urgency: lang === 'ar' ? 'الإلحاح' : 'Urgency',
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  const statCards = [
    { value: stats.pending, label: t.pending, color: '#f59e0b', icon: <Bell size={24} /> },
    { value: stats.completed, label: t.completed, color: '#059669', icon: <CheckCircle size={24} /> },
    { value: stats.total, label: t.total, color: '#3b82f6', icon: <BarChart3 size={24} /> },
    { value: `${stats.earnings} ${t.egp}`, label: t.earnings, color: '#8b5cf6', icon: <DollarSign size={24} /> },
  ];

  const quickLinkStyle = (color, bg) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', borderRadius: '12px',
    textDecoration: 'none', color: color, fontWeight: 600,
    fontSize: '0.9rem', fontFamily: "'Cairo', sans-serif",
    background: bg, transition: 'all 0.3s ease',
  });

  // ✅ حساب عدد الطلبات العامة غير المستجابة
  const pendingPosts = servicePosts.filter(p => !p.already_responded).length;

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-slide-down { animation: slideDown 0.3s ease forwards; }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
        
        .btn-accept { transition: all 0.3s ease; }
        .btn-accept:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(5,150,105,0.4); }
        
        .btn-reject { transition: all 0.3s ease; }
        .btn-reject:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(220,38,38,0.3); }
        
        .skeleton {
          background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .content-grid { grid-template-columns: 1fr !important; }
          .request-actions { flex-direction: column; }
        }
      `}</style>

      {/* Feedback Message */}
      {feedbackMessage && (
        <div className="animate-slide-down" style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, background: feedbackMessage.includes('✅') ? '#059669' : '#dc2626',
          color: 'white', padding: '12px 24px', borderRadius: '12px',
          fontWeight: 600, fontSize: '0.9rem', fontFamily: "'Cairo', sans-serif",
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          {feedbackMessage}
        </div>
      )}

      {/* Hero */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #065f46, #047857)' : 'linear-gradient(160deg, #059669, #047857)',
        color: 'white', padding: '48px 0',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 700,
            }}>
              {user?.name?.[0] || 'ح'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{t.welcome}، {user?.name}</h1>
              <p style={{ fontSize: '1rem', opacity: 0.9, margin: '4px 0 0' }}>
                {stats.pending > 0 
                  ? t.newRequests(stats.pending)
                  : (lang === 'ar' ? '🎉 لا توجد طلبات جديدة' : '🎉 No new requests')}
              </p>
              {stats.is_featured && (
                <span style={{ 
                  display: 'inline-block', marginTop: '8px', 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '4px 16px', borderRadius: '50px', 
                  fontSize: '0.8rem' 
                }}>
                  ⭐ {t.featured}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div className="stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px', marginBottom: '32px',
        }}>
          {statCards.map((stat, index) => (
            <div key={index} className="animate-fade-in-up hover-lift" style={{
              background: cardBg, borderRadius: '16px', padding: '24px',
              textAlign: 'center', border: `1px solid ${borderColor}`,
              borderTop: `3px solid ${stat.color}`, animationDelay: `${index * 0.1}s`,
            }}>
              <div style={{ color: stat.color, marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: textColor, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: textSecondary }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          
          {/* ============================================================
               ✅ طلباتي الخاصة (Bookings)
               ============================================================ */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="animate-fade-in-up" style={{
                fontSize: '1.3rem', fontWeight: 700, color: textColor,
                display: 'flex', alignItems: 'center', gap: '8px', margin: 0,
              }}>
                <Bell size={20} style={{ color: '#f59e0b' }} />
                {t.incomingRequests}
                {stats.pending > 0 && (
                  <span style={{
                    background: '#f59e0b', color: 'white', padding: '2px 10px',
                    borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {stats.pending}
                  </span>
                )}
              </h2>
              
              <button onClick={handleRefresh} disabled={refreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '10px',
                  border: `1px solid ${borderColor}`, background: 'transparent',
                  cursor: 'pointer', color: textColor, fontSize: '0.8rem',
                  fontWeight: 600, fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                }}>
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                {t.refresh}
              </button>
            </div>

            {bookingsLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ borderRadius: '14px', height: '140px' }} />
                ))}
              </div>
            ) : myBookings.length > 0 ? (
              myBookings.map((r, index) => (
                <div key={r.id} className="animate-fade-in-up hover-lift" style={{
                  background: cardBg, borderRadius: '14px', padding: '20px',
                  border: `1px solid ${borderColor}`, marginBottom: '12px',
                  animationDelay: `${index * 0.1}s`,
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, color: textColor, fontSize: '1rem', marginBottom: '4px' }}>
                        {r.service?.title || r.service_title || (lang === 'ar' ? 'خدمة' : 'Service')}
                      </h3>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.8rem', color: textSecondary }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {r.location || r.address || (lang === 'ar' ? 'غير محدد' : 'N/A')}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} />
                          {r.client?.name || r.customer_name || t.customer}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {r.booking_date || r.date || r.created_at?.split('T')[0] || ''}
                        </span>
                      </div>
                    </div>
                    <span style={{
                      background: '#fef3c7', color: '#d97706', padding: '4px 12px',
                      borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                      animation: 'pulse 2s infinite',
                    }}>
                      {t.waiting}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.9rem', color: textSecondary, marginBottom: '12px', lineHeight: 1.6 }}>
                    {r.notes || r.description || (lang === 'ar' ? 'لا يوجد وصف' : 'No description')}
                  </p>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: textSecondary }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#059669' }}>
                        <DollarSign size={14} />
                        {r.total_price || r.service_price || r.price || 0} {t.egp}
                      </span>
                      {r.booking_time && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {r.booking_time}
                        </span>
                      )}
                    </div>

                    <div className="request-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleRejectBooking(r.id)}
                        disabled={actionLoading[`booking_${r.id}`] === 'reject'}
                        className="btn-reject"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '8px 14px', borderRadius: '10px',
                          border: '1px solid #dc2626', background: 'transparent',
                          color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem',
                          fontWeight: 600, fontFamily: "'Cairo', sans-serif",
                          opacity: actionLoading[`booking_${r.id}`] ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => { if(!actionLoading[`booking_${r.id}`]) { e.target.style.background = '#dc2626'; e.target.style.color = 'white'; } }}
                        onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#dc2626'; }}>
                        {actionLoading[`booking_${r.id}`] === 'reject' ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {actionLoading[`booking_${r.id}`] === 'reject' ? t.rejecting : t.reject}
                      </button>

                      <button 
                        onClick={() => handleAcceptBooking(r.id)}
                        disabled={actionLoading[`booking_${r.id}`] === 'accept'}
                        className="btn-accept"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          padding: '8px 14px', borderRadius: '10px',
                          border: '1px solid #059669', background: '#059669',
                          color: 'white', cursor: 'pointer', fontSize: '0.8rem',
                          fontWeight: 600, fontFamily: "'Cairo', sans-serif",
                          opacity: actionLoading[`booking_${r.id}`] ? 0.7 : 1,
                        }}>
                        {actionLoading[`booking_${r.id}`] === 'accept' ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        {actionLoading[`booking_${r.id}`] === 'accept' ? t.accepting : t.accept}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="animate-fade-in-up" style={{
                textAlign: 'center', padding: '40px 20px', background: cardBg,
                borderRadius: '14px', border: `1px solid ${borderColor}`,
              }}>
                <Bell size={40} style={{ opacity: 0.2, color: textSecondary, marginBottom: '12px' }} />
                <p style={{ color: textColor, fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{t.noRequests}</p>
                <p style={{ color: textSecondary, fontSize: '0.85rem' }}>{t.noRequestsDesc}</p>
              </div>
            )}

            {/* ============================================================
                 ✅ طلبات عامة (Service Posts)
                 ============================================================ */}
            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{
                  fontSize: '1.1rem', fontWeight: 700, color: textColor,
                  display: 'flex', alignItems: 'center', gap: '8px', margin: 0,
                }}>
                  <FileText size={20} style={{ color: '#8b5cf6' }} />
                  {t.generalRequests}
                  {pendingPosts > 0 && (
                    <span style={{
                      background: '#8b5cf6', color: 'white', padding: '2px 10px',
                      borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {pendingPosts}
                    </span>
                  )}
                </h2>
              </div>

              {postsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[1, 2].map(i => (
                    <div key={i} className="skeleton" style={{ borderRadius: '14px', height: '120px' }} />
                  ))}
                </div>
              ) : servicePosts.length > 0 ? (
                servicePosts.map((post, index) => {
                  const alreadyResponded = post.already_responded || false;
                  
                  return (
                    <div key={post.id} className="animate-fade-in-up" style={{
                      background: cardBg, borderRadius: '14px', padding: '16px 20px',
                      border: `1px solid ${borderColor}`, marginBottom: '10px',
                      animationDelay: `${index * 0.05}s`,
                      opacity: alreadyResponded ? 0.6 : 1,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h4 style={{ fontWeight: 600, color: textColor, fontSize: '0.95rem', margin: 0 }}>
                            {post.title || 'طلب خدمة'}
                          </h4>
                          <div style={{ fontSize: '0.75rem', color: textSecondary, display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                            <span>{post.city || ''}</span>
                            {post.budget_from && post.budget_to && (
                              <span>💰 {post.budget_from} - {post.budget_to} {t.egp}</span>
                            )}
                            {post.urgency && (
                              <span>⚡ {post.urgency === 'emergency' ? (lang === 'ar' ? 'طوارئ' : 'Emergency') : post.urgency}</span>
                            )}
                          </div>
                        </div>
                        {alreadyResponded && (
                          <span style={{
                            padding: '2px 10px', borderRadius: '12px',
                            background: '#d1fae5', color: '#059669',
                            fontSize: '0.65rem', fontWeight: 600,
                          }}>
                            ✅ {t.alreadyResponded}
                          </span>
                        )}
                      </div>
                      
                      <p style={{ fontSize: '0.8rem', color: textSecondary, marginBottom: '10px', lineHeight: 1.5 }}>
                        {post.description?.substring(0, 100)}...
                      </p>
                      
                      {!alreadyResponded && (
                        <button
                          onClick={() => handleRespondToPost(post.id)}
                          disabled={actionLoading[`post_${post.id}`] === 'respond'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '6px 14px', borderRadius: '8px',
                            border: '1px solid #8b5cf6', background: 'transparent',
                            color: '#8b5cf6', cursor: 'pointer', fontSize: '0.75rem',
                            fontWeight: 600, fontFamily: "'Cairo', sans-serif",
                            transition: 'all 0.3s ease',
                            opacity: actionLoading[`post_${post.id}`] ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => { if(!actionLoading[`post_${post.id}`]) { e.target.style.background = '#8b5cf6'; e.target.style.color = 'white'; } }}
                          onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#8b5cf6'; }}>
                          {actionLoading[`post_${post.id}`] === 'respond' ? (
                            <Loader size={12} className="animate-spin" />
                          ) : (
                            <MessageCircle size={12} />
                          )}
                          {t.respond}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{
                  textAlign: 'center', padding: '24px', background: cardBg,
                  borderRadius: '14px', border: `1px solid ${borderColor}`,
                }}>
                  <p style={{ color: textSecondary, fontSize: '0.85rem' }}>{t.noGeneralRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
               Sidebar
               ============================================================ */}
          <div>
            {/* Quick Links */}
            <div className="animate-fade-in-up delay-200" style={{
              background: cardBg, borderRadius: '16px', padding: '24px',
              border: `1px solid ${borderColor}`, marginBottom: '16px',
            }}>
              <h3 style={{ fontWeight: 700, color: textColor, marginBottom: '16px', fontSize: '1rem' }}>
                {t.quickLinks}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/profile" style={quickLinkStyle('#3b82f6', darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff')}>
                  <Settings size={16} />{t.profile}
                </Link>
                <Link to="/subscription" style={quickLinkStyle('#8b5cf6', darkMode ? 'rgba(139,92,246,0.15)' : '#f5f3ff')}>
                  <Award size={16} />{t.subscriptions}
                </Link>
                <Link to="/notifications" style={quickLinkStyle('#f59e0b', darkMode ? 'rgba(245,158,11,0.15)' : '#fef3c7')}>
                  <Bell size={16} />{lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                </Link>
              </div>
            </div>

            {/* Stats Card */}
            <div className="animate-fade-in-up delay-300" style={{
              background: cardBg, borderRadius: '16px', padding: '20px',
              border: `1px solid ${borderColor}`, marginBottom: '16px',
            }}>
              <h3 style={{ fontWeight: 700, color: textColor, marginBottom: '12px', fontSize: '0.9rem' }}>
                {lang === 'ar' ? '📊 ملخص اليوم' : '📊 Today\'s Summary'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: textSecondary }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.pending}</span>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.completed}</span>
                  <span style={{ fontWeight: 700, color: '#059669' }}>{stats.completed}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${borderColor}`, paddingTop: '8px' }}>
                  <span>{t.earnings}</span>
                  <span style={{ fontWeight: 700, color: '#8b5cf6' }}>{stats.earnings} {t.egp}</span>
                </div>
                {stats.rating > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${borderColor}`, paddingTop: '8px' }}>
                    <span>{t.rating}</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>⭐ {stats.rating} ({stats.reviews_count})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="animate-fade-in-up delay-400" style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '16px', padding: '20px', color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {lang === 'ar' ? '💡 نصيحة' : '💡 Tip'}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', opacity: 0.95, lineHeight: 1.6, margin: 0 }}>
                {lang === 'ar' 
                  ? 'الرد السريع على الطلبات يزيد من فرص قبولك بنسبة 80%'
                  : 'Quick response to requests increases your acceptance rate by 80%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftsmanHomePage;
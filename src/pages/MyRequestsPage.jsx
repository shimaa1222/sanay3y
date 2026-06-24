// src/pages/MyRequestsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Calendar, Clock, MapPin, Star, DollarSign,
  ChevronLeft, ChevronRight, Filter, X,
  CheckCircle, Clock as ClockIcon, AlertCircle,
  Loader, Eye, MessageCircle, Phone, FileText,
  Trash2, Edit, PlusCircle
} from 'lucide-react';

const MyRequestsPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [lang, setLang] = useState('ar');
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const isArabic = lang === 'ar';

  // ✅ Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ✅ حالات المنشورات
  const statuses = [
    { value: 'all', label: isArabic ? 'الكل' : 'All' },
    { value: 'open', label: isArabic ? 'مفتوح' : 'Open' },
    { value: 'closed', label: isArabic ? 'مغلق' : 'Closed' },
  ];

  // ✅ جلب منشورات العميل - GET /client/my-posts
  const loadMyPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyPosts();
      setPosts(data.posts?.data || []);
    } catch (err) {
      console.error('❌ Error loading my posts:', err);
      setError(err.message || (isArabic ? 'حدث خطأ في تحميل طلباتك' : 'Error loading your requests'));
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [isArabic]);

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  // ✅ فلترة المنشورات
  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(p => p.status === filter);

  // ✅ حذف منشور - DELETE /client/service-posts.destroy/{id}
  const handleDelete = async (postId) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this request?')) {
      return;
    }
    
    setDeleting(postId);
    try {
      await api.deleteServicePost(postId);
      await loadMyPosts();
    } catch (err) {
      setError(err.message || (isArabic ? 'حدث خطأ في حذف الطلب' : 'Error deleting request'));
    } finally {
      setDeleting(null);
    }
  };

  // ✅ الحصول على لون الحالة
  const getStatusColor = (status) => {
    const colors = {
      open: { bg: '#dbeafe', text: '#2563eb', icon: <ClockIcon size={16} /> },
      closed: { bg: '#d1fae5', text: '#059669', icon: <CheckCircle size={16} /> },
    };
    return colors[status] || colors.open;
  };

  // ✅ الحصول على نص الحالة
  const getStatusText = (status) => {
    const map = {
      open: isArabic ? 'مفتوح' : 'Open',
      closed: isArabic ? 'مغلق' : 'Closed',
    };
    return map[status] || status;
  };

  // ✅ تنسيق التاريخ
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ✅ الحصول على نص الإلحاح
  const getUrgencyText = (urgency) => {
    const map = {
      low: isArabic ? 'منخفض' : 'Low',
      medium: isArabic ? 'متوسط' : 'Medium',
      high: isArabic ? 'مرتفع' : 'High',
      emergency: isArabic ? 'طوارئ' : 'Emergency',
    };
    return map[urgency] || urgency;
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#f97316',
      emergency: '#ef4444',
    };
    return colors[urgency] || '#94a3b8';
  };

  // ✅ الترجمات
  const t = {
    myRequests: isArabic ? 'طلباتي' : 'My Requests',
    youHave: (count) => isArabic ? `لديك ${count} طلب` : `You have ${count} requests`,
    errorLoading: isArabic ? 'حدث خطأ في تحميل طلباتك' : 'Error loading your requests',
    errorDeleting: isArabic ? 'حدث خطأ في حذف الطلب' : 'Error deleting request',
    confirmDelete: isArabic ? 'هل أنت متأكد من حذف هذا الطلب؟' : 'Are you sure you want to delete this request?',
    details: isArabic ? 'تفاصيل' : 'Details',
    delete: isArabic ? 'حذف' : 'Delete',
    noRequests: isArabic ? 'لا توجد طلبات' : 'No requests found',
    noRequestsYet: isArabic ? 'لم تقم بأي طلب بعد' : 'You haven\'t made any requests yet',
    noRequestsStatus: (status) => isArabic ? `لا توجد طلبات بحالة "${status}"` : `No requests with status "${status}"`,
    viewAll: isArabic ? 'عرض الكل' : 'View All',
    newRequest: isArabic ? 'طلب جديد' : 'New Request',
    all: isArabic ? 'الكل' : 'All',
    open: isArabic ? 'مفتوح' : 'Open',
    closed: isArabic ? 'مغلق' : 'Closed',
    egp: isArabic ? 'ج.م' : 'EGP',
    budget: isArabic ? 'الميزانية' : 'Budget',
    urgency: isArabic ? 'الإلحاح' : 'Urgency',
    responses: (count) => isArabic ? `${count} رد` : `${count} responses`,
    noResponses: isArabic ? 'لا توجد ردود' : 'No responses',
    viewResponses: isArabic ? 'عرض الردود' : 'View Responses',
    status: isArabic ? 'الحالة' : 'Status',
    location: isArabic ? 'الموقع' : 'Location',
    createdAt: isArabic ? 'تاريخ النشر' : 'Created At',
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: isArabic ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .animate-spin { animation: spin 1s linear infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .skeleton {
          background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        @media (max-width: 768px) {
          .filter-bar { overflow-x: auto; flex-wrap: nowrap; }
          .request-card { flex-direction: column; align-items: stretch !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)',
        color: 'white',
        padding: '32px 0',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(-1)} style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                📝 {t.myRequests}
              </h1>
              <p style={{ fontSize: '0.85rem', opacity: 0.85, margin: '2px 0 0' }}>
                {t.youHave(posts.length)}
              </p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Link
                to="/request-service"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                <PlusCircle size={18} />
                {t.newRequest}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>

        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(220,38,38,0.2)',
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Filter Bar */}
        <div className="animate-fade-in-up delay-100 filter-bar" style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          paddingBottom: '8px',
        }}>
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '50px',
                border: filter === s.value ? '2px solid #3b82f6' : `1px solid ${borderColor}`,
                background: filter === s.value ? (darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
                color: filter === s.value ? '#3b82f6' : textSecondary,
                cursor: 'pointer',
                fontWeight: filter === s.value ? 700 : 500,
                fontSize: '0.85rem',
                fontFamily: "'Cairo', sans-serif",
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
              }}
            >
              {s.label}
              {s.value !== 'all' && (
                <span style={{
                  marginLeft: '4px',
                  fontSize: '0.7rem',
                  background: filter === s.value ? '#3b82f6' : (darkMode ? '#334155' : '#e2e8f0'),
                  color: filter === s.value ? 'white' : textSecondary,
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}>
                  {posts.filter(p => p.status === s.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ borderRadius: '14px', height: '120px' }} />
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredPosts.map((post, index) => {
              const statusStyle = getStatusColor(post.status);
              const isOpen = post.status === 'open';
              const responsesCount = post.responses?.length || post.responses_count || 0;
              
              return (
                <div
                  key={post.id}
                  className="animate-fade-in-up hover-lift request-card"
                  style={{
                    background: cardBg,
                    borderRadius: '14px',
                    padding: '18px 20px',
                    border: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  {/* Left - Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, color: textColor, fontSize: '1rem', margin: 0 }}>
                        {post.title || 'طلب خدمة'}
                      </h3>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 10px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: statusStyle.bg,
                        color: statusStyle.text,
                      }}>
                        {statusStyle.icon}
                        {getStatusText(post.status)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.85rem', color: textSecondary }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {formatDate(post.created_at)}
                      </span>
                      {post.city && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} />
                          {post.city}
                        </span>
                      )}
                      {post.budget_from && post.budget_to && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600 }}>
                          <DollarSign size={14} />
                          {post.budget_from} - {post.budget_to} {t.egp}
                        </span>
                      )}
                      {post.urgency && (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: getUrgencyColor(post.urgency),
                          fontWeight: 600,
                        }}>
                          ⚡ {getUrgencyText(post.urgency)}
                        </span>
                      )}
                    </div>

                    {post.description && (
                      <p style={{ fontSize: '0.8rem', color: textSecondary, marginTop: '4px', maxWidth: '400px' }}>
                        {post.description.length > 100 
                          ? post.description.substring(0, 100) + '...' 
                          : post.description}
                      </p>
                    )}
                  </div>

                  {/* Right - Actions */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* زر الردود */}
                    {responsesCount > 0 && (
                      <button
                        onClick={() => navigate(`/service-post/${post.id}`)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${borderColor}`,
                          background: 'transparent',
                          cursor: 'pointer',
                          color: textSecondary,
                          fontSize: '0.8rem',
                          fontFamily: "'Cairo', sans-serif",
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <MessageCircle size={14} />
                        {t.responses(responsesCount)}
                      </button>
                    )}

                    {/* زر التفاصيل */}
                    <button
                      onClick={() => navigate(`/service-post/${post.id}`)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: `1px solid ${borderColor}`,
                        background: 'transparent',
                        cursor: 'pointer',
                        color: textSecondary,
                        fontSize: '0.8rem',
                        fontFamily: "'Cairo', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={14} />
                      {t.details}
                    </button>

                    {/* زر الحذف - يظهر فقط للمنشورات المفتوحة */}
                    {isOpen && (
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting === post.id}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          cursor: deleting === post.id ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          fontFamily: "'Cairo', sans-serif",
                          opacity: deleting === post.id ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {deleting === post.id ? (
                          <Loader size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        {t.delete}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="animate-fade-in" style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: cardBg,
            borderRadius: '16px',
            border: `1px solid ${borderColor}`,
          }}>
            <FileText size={64} style={{ color: textSecondary, opacity: 0.3, marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: textColor, marginBottom: '8px' }}>
              {t.noRequests}
            </h3>
            <p style={{ color: textSecondary, fontSize: '0.95rem' }}>
              {filter === 'all' 
                ? t.noRequestsYet
                : t.noRequestsStatus(statuses.find(s => s.value === filter)?.label || '')
              }
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                style={{
                  marginTop: '12px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {t.viewAll}
              </button>
            )}
            {filter === 'all' && (
              <Link
                to="/request-service"
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                <PlusCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                {t.newRequest}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequestsPage;
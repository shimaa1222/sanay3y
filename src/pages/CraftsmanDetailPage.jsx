// src/pages/CraftsmanDetailPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CraftsmanMap from '../components/Map/CraftsmanMap';
import AddReviewModal from '../components/Reviews/AddReviewModal';
import { 
  MapPin, Star, Clock, Wrench, Phone, MessageCircle,
  CheckCircle, Award, Calendar, ArrowLeft,
  Shield, Briefcase, Users, Heart,
  Share2, Flag, Sparkles, Loader, AlertCircle, Image, Eye,
  PlusCircle, Lock
} from 'lucide-react';

const CraftsmanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [lang, setLang] = useState('ar');
  const [craftsman, setCraftsman] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [isFavorite, setIsFavorite] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ State لمودال التقييم
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userBookings, setUserBookings] = useState([]);

  // ========== Language ==========
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ========== Load Craftsman Data ==========
  useEffect(() => {
    const loadCraftsman = async () => {
      setLoading(true);
      try {
        // ✅ جلب بيانات الحرفي
        const data = await api.getCraftsman(id);
        const c = data.craftsman || data;
        
        const craftsmanWithLocation = {
          ...c,
          id: c.id || parseInt(id),
          name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.profession || 'حرفي',
          latitude: c.latitude || c.lat || 30.0444,
          longitude: c.longitude || c.lng || 31.2357,
          city: c.city || 'القاهرة',
          district: c.district || '',
          rating: c.rating || 4.5,
          yearsExperience: c.years_exp || c.yearsExperience || 5,
          phone: c.phone || c.phone_number || '',
          completedJobs: c.completed_jobs || c.completed_bookings || 0,
          bio: c.bio || c.description || '',
          skills: c.skills || [c.profession, 'صيانة', 'تركيب'].filter(Boolean),
          hourly_rate: c.hourly_rate || c.price || 150,
          profession: c.profession || c.crafts?.[0]?.name || 'حرفي',
        };
        
        setCraftsman(craftsmanWithLocation);
        
        // ✅ جلب التقييمات الخاصة بالحرفي من API
        try {
          const reviewsData = await api.getCraftsmanReviews(id);
          setReviews(reviewsData.reviews || reviewsData || []);
        } catch (reviewError) {
          console.warn('⚠️ Could not load reviews:', reviewError);
          setReviews(c.reviews || []);
        }
        
        setPortfolioImages(c.portfolio || []);
        
        // ✅ جلب حجوزات المستخدم (للتقييم)
        if (isAuthenticated) {
          try {
            const bookingsData = await api.getMyBookings('all');
            const userCompletedBookings = (bookingsData.bookings?.data || [])
              .filter(b => b.craftsman_id === parseInt(id) && b.status === 'completed' && !b.has_review);
            setUserBookings(userCompletedBookings);
          } catch (bookingError) {
            console.warn('⚠️ Could not load user bookings:', bookingError);
          }
        }
        
      } catch (error) {
        console.warn('⚠️ Using fallback craftsman data:', error);
        setCraftsman({
          id: parseInt(id) || 1,
          name: 'أحمد النجار',
          profession: 'نجار',
          rating: 4.9,
          hourly_rate: 200,
          city: 'القاهرة',
          district: 'مدينة نصر',
          latitude: 30.0444,
          longitude: 31.2357,
          phone: '01001234567',
          completedJobs: 320,
          bio: 'نجار محترف خبرة 15 سنة في جميع أعمال النجارة',
          skills: ['نجارة', 'صيانة', 'تركيب', 'تصليح'],
          yearsExperience: 15,
        });
        setReviews([]);
        setPortfolioImages([]);
      }
      setLoading(false);
    };
    loadCraftsman();
  }, [id, isAuthenticated]);

  // ========== Translations ==========
  const t = useMemo(() => ({
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    notFound: lang === 'ar' ? 'الحرفي غير موجود' : 'Craftsman not found',
    about: lang === 'ar' ? 'نبذة عني' : 'About Me',
    reviews: lang === 'ar' ? 'التقييمات' : 'Reviews',
    location: lang === 'ar' ? 'الموقع' : 'Location',
    bookNow: lang === 'ar' ? 'احجز الآن' : 'Book Now',
    contact: lang === 'ar' ? 'اتصل' : 'Call',
    message: lang === 'ar' ? 'راسل' : 'Message',
    completedJobs: lang === 'ar' ? 'خدمة مكتملة' : 'Completed Jobs',
    yearsExp: lang === 'ar' ? 'سنوات الخبرة' : 'Years Exp',
    pricePerHour: lang === 'ar' ? 'للساعة' : 'per hour',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    verified: lang === 'ar' ? 'موثق' : 'Verified',
    share: lang === 'ar' ? 'مشاركة' : 'Share',
    report: lang === 'ar' ? 'إبلاغ' : 'Report',
    save: lang === 'ar' ? 'حفظ' : 'Save',
    saved: lang === 'ar' ? 'تم الحفظ' : 'Saved',
    noReviews: lang === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet',
    noBio: lang === 'ar' ? 'لم يضف نبذة تعريفية بعد' : 'No bio added yet',
    back: lang === 'ar' ? 'العودة' : 'Back',
    portfolio: lang === 'ar' ? 'معرض الأعمال' : 'Portfolio',
    noPortfolio: lang === 'ar' ? 'لا توجد صور في المعرض' : 'No portfolio images',
    tabs: {
      about: lang === 'ar' ? 'نبذة' : 'About',
      reviews: lang === 'ar' ? 'تقييمات' : 'Reviews',
      location: lang === 'ar' ? 'الموقع' : 'Location'
    },
    addReview: lang === 'ar' ? 'أضف تقييمك' : 'Add Review',
    loginToReview: lang === 'ar' ? 'سجل الدخول لإضافة تقييم' : 'Login to add review',
    rateService: lang === 'ar' ? 'قيّم الخدمة' : 'Rate Service',
  }), [lang]);

  // ========== Handlers ==========
  const handleReviewSuccess = (newReview) => {
    // ✅ تحديث قائمة التقييمات
    setReviews(prev => [newReview, ...prev]);
    setShowReviewModal(false);
    // ✅ تحديث حجوزات المستخدم
    setUserBookings(prev => prev.filter(b => b.id !== selectedBooking?.id));
  };

  const handleReviewClose = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

  // ✅ فتح مودال التقييم
  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  // ========== Loading State ==========
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: darkMode ? '#0f172a' : '#f8fafc',
        fontFamily: "'Cairo', sans-serif"
      }}>
        <Loader size={40} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  // ========== Not Found ==========
  if (!craftsman) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: darkMode ? '#0f172a' : '#f8fafc',
        fontFamily: "'Cairo', sans-serif",
        gap: '12px'
      }}>
        <AlertCircle size={48} style={{ color: '#ef4444' }} />
        <p style={{ color: darkMode ? '#f1f5f9' : '#0f172a', fontSize: '1.2rem' }}>
          {t.notFound}
        </p>
        <Link to="/" style={{ 
          padding: '12px 24px', 
          borderRadius: '12px', 
          background: '#3b82f6', 
          color: 'white', 
          textDecoration: 'none',
          fontFamily: "'Cairo', sans-serif"
        }}>
          {t.back}
        </Link>
      </div>
    );
  }

  // ========== Styles ==========
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const heroBg = darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)';
  
  const fullName = craftsman?.name || 'حرفي';
  const price = craftsman?.hourly_rate || craftsman?.price || 150;
  const skills = craftsman?.skills?.length > 0 ? craftsman.skills : [craftsman?.profession, 'صيانة', 'تركيب'].filter(Boolean);
  const profession = craftsman?.profession || 'حرفي';

  return (
    <div style={{ 
      background: bgColor, 
      minHeight: '100vh', 
      fontFamily: "'Cairo', sans-serif", 
      direction: lang === 'ar' ? 'rtl' : 'ltr' 
    }}>
      <style>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .tab-active::after { 
          content: ''; 
          position: absolute; 
          bottom: -2px; 
          left: 0; 
          right: 0; 
          height: 3px; 
          background: #3b82f6; 
          border-radius: 3px 3px 0 0; 
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @media (max-width: 768px) { 
          .detail-grid { grid-template-columns: 1fr !important; } 
          .sidebar { position: static !important; } 
        }
      `}</style>

      {/* ===== Back Button ===== */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px 0' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            borderRadius: '10px', 
            border: `1px solid ${borderColor}`, 
            background: 'transparent', 
            cursor: 'pointer', 
            color: textColor, 
            fontFamily: "'Cairo', sans-serif", 
            fontSize: '0.9rem', 
            fontWeight: 600 
          }}
        >
          <ArrowLeft size={18} />
          {t.back}
        </button>
      </div>

      {/* ===== Hero Section ===== */}
      <div className="animate-fade-in-up" style={{ 
        background: heroBg, 
        color: 'white', 
        padding: '40px 0', 
        marginTop: '16px' 
      }}>
        <div style={{ 
          maxWidth: '1100px', 
          margin: '0 auto', 
          padding: '0 24px', 
          display: 'flex', 
          gap: '24px', 
          alignItems: 'center', 
          flexWrap: 'wrap' 
        }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '2.5rem', 
            fontWeight: 700, 
            border: '4px solid rgba(255,255,255,0.3)', 
            flexShrink: 0, 
            position: 'relative' 
          }}>
            {fullName?.charAt(0) || 'ح'}
            <div style={{ 
              position: 'absolute', 
              bottom: '4px', 
              right: '4px', 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              background: '#10b981', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '3px solid white' 
            }}>
              <CheckCircle size={14} color="white" />
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '8px', 
              flexWrap: 'wrap' 
            }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>
                {fullName}
              </h1>
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                background: 'rgba(255,255,255,0.2)', 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '0.85rem', 
                fontWeight: 600 
              }}>
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                {craftsman?.rating || '4.5'}
              </span>
            </div>
            
            <p style={{ 
              fontSize: '1.1rem', 
              opacity: 0.9, 
              marginBottom: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <Wrench size={16} />
              {profession}
            </p>
            
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              flexWrap: 'wrap', 
              fontSize: '0.9rem', 
              opacity: 0.85 
            }}>
              <span>
                <CheckCircle size={14} /> 
                {craftsman?.completedJobs || 0} {t.completedJobs}
              </span>
              <span>
                <Award size={14} /> 
                {craftsman?.yearsExperience || 5} {t.yearsExp}
              </span>
              <span>
                <MapPin size={14} /> 
                {craftsman?.city || 'القاهرة'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setIsFavorite(!isFavorite)} 
              style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.15)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: isFavorite ? '#ef4444' : 'white' 
              }}
            >
              <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} />
            </button>
            <button 
              style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.15)', 
                border: '1px solid rgba(255,255,255,0.2)', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white' 
              }}
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          marginBottom: '24px', 
          borderBottom: `2px solid ${borderColor}`, 
          overflowX: 'auto' 
        }}>
          {['about', 'reviews', 'location'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={activeTab === tab ? 'tab-active' : ''} 
              style={{ 
                padding: '12px 24px', 
                border: 'none', 
                background: 'transparent', 
                cursor: 'pointer', 
                fontWeight: activeTab === tab ? 700 : 500, 
                fontSize: '0.95rem', 
                color: activeTab === tab ? '#3b82f6' : textSecondary, 
                fontFamily: "'Cairo', sans-serif", 
                whiteSpace: 'nowrap', 
                position: 'relative' 
              }}
            >
              {tab === 'about' && '📝 '}
              {tab === 'reviews' && '⭐ '}
              {tab === 'location' && '📍 '}
              {t.tabs[tab]}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="detail-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 340px', 
          gap: '24px' 
        }}>
          {/* ===== Main Content ===== */}
          <div>
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="animate-fade-in-up">
                {/* Bio */}
                <div style={{ 
                  background: cardBg, 
                  borderRadius: '16px', 
                  padding: '28px', 
                  border: `1px solid ${borderColor}`, 
                  marginBottom: '20px' 
                }}>
                  <h2 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 700, 
                    color: textColor, 
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}>
                    <Briefcase size={20} style={{ color: '#3b82f6' }} />
                    {t.about}
                  </h2>
                  <p style={{ color: textSecondary, lineHeight: 2, fontSize: '0.95rem' }}>
                    {craftsman?.bio || t.noBio}
                  </p>
                </div>

                {/* Skills */}
                <div style={{ 
                  background: cardBg, 
                  borderRadius: '16px', 
                  padding: '28px', 
                  border: `1px solid ${borderColor}`, 
                  marginBottom: '20px' 
                }}>
                  <h2 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 700, 
                    color: textColor, 
                    marginBottom: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}>
                    <Sparkles size={20} style={{ color: '#f59e0b' }} />
                    {lang === 'ar' ? 'الخدمات' : 'Services'}
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map((skill, i) => (
                      <span 
                        key={i} 
                        style={{ 
                          padding: '6px 14px', 
                          borderRadius: '20px', 
                          background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', 
                          color: '#3b82f6', 
                          fontSize: '0.85rem', 
                          fontWeight: 500, 
                          border: '1px solid rgba(59,130,246,0.2)' 
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Portfolio */}
                {portfolioImages.length > 0 && (
                  <div style={{ 
                    background: cardBg, 
                    borderRadius: '16px', 
                    padding: '28px', 
                    border: `1px solid ${borderColor}` 
                  }}>
                    <h2 style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: 700, 
                      color: textColor, 
                      marginBottom: '16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px' 
                    }}>
                      <Image size={20} style={{ color: '#8b5cf6' }} />
                      {t.portfolio}
                    </h2>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                      gap: '12px' 
                    }}>
                      {portfolioImages.map((img, index) => (
                        <div 
                          key={index} 
                          onClick={() => setSelectedImage(img)} 
                          style={{ 
                            borderRadius: '12px', 
                            overflow: 'hidden', 
                            height: '180px', 
                            border: `1px solid ${borderColor}`, 
                            cursor: 'pointer', 
                            position: 'relative' 
                          }}
                        >
                          <img 
                            src={img.url || img} 
                            alt="" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease',
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="animate-fade-in-up" style={{ 
                background: cardBg, 
                borderRadius: '16px', 
                padding: '28px', 
                border: `1px solid ${borderColor}` 
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <h2 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 700, 
                    color: textColor, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    margin: 0
                  }}>
                    <Star size={20} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                    {t.reviews} ({reviews.length})
                  </h2>
                  
                  {/* ✅ زر إضافة تقييم - يظهر للمستخدمين المسجلين الذين لديهم حجوزات مكتملة */}
                  {isAuthenticated && userBookings.length > 0 ? (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {userBookings.map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => openReviewModal(booking)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            fontFamily: "'Cairo', sans-serif",
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <PlusCircle size={16} />
                          {t.rateService}
                        </button>
                      ))}
                    </div>
                  ) : isAuthenticated && userBookings.length === 0 ? (
                    <span style={{
                      fontSize: '0.85rem',
                      color: textSecondary,
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${borderColor}`,
                    }}>
                      {lang === 'ar' ? 'ليس لديك حجوزات مكتملة لتقييمها' : 'No completed bookings to review'}
                    </span>
                  ) : (
                    <Link
                      to="/login"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${borderColor}`,
                        background: 'transparent',
                        color: textSecondary,
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    >
                      <Lock size={16} />
                      {t.loginToReview}
                    </Link>
                  )}
                </div>

                {/* ✅ قائمة التقييمات */}
                {reviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map((r, i) => (
                      <div key={r.id || i} style={{ 
                        padding: '16px', 
                        borderRadius: '12px',
                        background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                        border: `1px solid ${borderColor}`,
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '8px' 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#3b82f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                            }}>
                              {r.client?.name?.[0] || r.client?.first_name?.[0] || 'م'}
                            </div>
                            <strong style={{ color: textColor }}>
                              {r.client?.name || `${r.client?.first_name || ''} ${r.client?.last_name || ''}`.trim() || (lang === 'ar' ? 'عميل' : 'Customer')}
                            </strong>
                          </div>
                          <span style={{ display: 'flex', gap: '2px' }}>
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star 
                                key={j} 
                                size={14} 
                                fill={j < (r.rating || 5) ? '#f59e0b' : 'none'} 
                                color={j < (r.rating || 5) ? '#f59e0b' : '#cbd5e1'} 
                              />
                            ))}
                          </span>
                        </div>
                        {r.comment && (
                          <p style={{ 
                            color: textSecondary, 
                            fontSize: '0.9rem', 
                            lineHeight: 1.7,
                            margin: '4px 0 8px 0',
                          }}>
                            "{r.comment}"
                          </p>
                        )}
                        <div style={{ 
                          fontSize: '0.7rem', 
                          color: textSecondary,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <Calendar size={12} />
                          {new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: textSecondary 
                  }}>
                    <Star size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                    <p>{t.noReviews}</p>
                    {isAuthenticated && userBookings.length > 0 && (
                      <button
                        onClick={() => openReviewModal(userBookings[0])}
                        style={{
                          marginTop: '12px',
                          padding: '8px 20px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        {t.addReview}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="animate-fade-in-up">
                <CraftsmanMap
                  craftsman={{
                    id: craftsman.id,
                    name: fullName,
                    latitude: craftsman.latitude || 30.0444,
                    longitude: craftsman.longitude || 31.2357,
                    city: craftsman.city,
                    district: craftsman.district,
                    rating: craftsman.rating,
                    phone: craftsman.phone,
                    profession: profession,
                  }}
                  nearbyCraftsmen={[]}
                  userLocation={null}
                />
              </div>
            )}
          </div>

          {/* ===== Sidebar ===== */}
          <div className="sidebar" style={{ 
            position: 'sticky', 
            top: '84px', 
            alignSelf: 'start' 
          }}>
            {/* Booking Card */}
            <div style={{ 
              background: cardBg, 
              borderRadius: '16px', 
              padding: '28px', 
              border: `1px solid ${borderColor}`, 
              marginBottom: '20px' 
            }}>
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '20px', 
                paddingBottom: '20px', 
                borderBottom: `1px solid ${borderColor}` 
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 800, 
                  color: '#059669', 
                  marginBottom: '4px' 
                }}>
                  {price} {t.egp}
                </div>
                <div style={{ fontSize: '0.85rem', color: textSecondary }}>
                  {t.pricePerHour}
                </div>
              </div>
              
              <Link 
                to={`/booking/${craftsman.id}`} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  width: '100%', 
                  padding: '14px', 
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  fontSize: '1.05rem', 
                  textDecoration: 'none', 
                  fontFamily: "'Cairo', sans-serif" 
                }}
              >
                <Calendar size={20} />
                {t.bookNow}
              </Link>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px', 
                marginTop: '12px' 
              }}>
                <a 
                  href={`tel:${craftsman.phone || '19555'}`} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    padding: '10px', 
                    borderRadius: '10px', 
                    border: `2px solid ${borderColor}`, 
                    background: 'transparent', 
                    color: textColor, 
                    textDecoration: 'none', 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    fontFamily: "'Cairo', sans-serif" 
                  }}
                >
                  <Phone size={16} />
                  {t.contact}
                </a>
                <a 
                  href={`https://wa.me/${craftsman.whatsapp || '20'}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    padding: '10px', 
                    borderRadius: '10px', 
                    border: `2px solid ${borderColor}`, 
                    background: 'transparent', 
                    color: textColor, 
                    textDecoration: 'none', 
                    fontSize: '0.85rem', 
                    fontWeight: 600, 
                    fontFamily: "'Cairo', sans-serif" 
                  }}
                >
                  <MessageCircle size={16} />
                  {t.message}
                </a>
              </div>
            </div>
            
            {/* Quick Info */}
            <div style={{ 
              background: cardBg, 
              borderRadius: '16px', 
              padding: '20px', 
              border: `1px solid ${borderColor}` 
            }}>
              <h3 style={{ 
                fontSize: '0.95rem', 
                fontWeight: 700, 
                color: textColor, 
                marginBottom: '16px' 
              }}>
                {lang === 'ar' ? 'معلومات سريعة' : 'Quick Info'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontSize: '0.85rem', 
                  color: textSecondary 
                }}>
                  <Shield size={16} style={{ color: '#059669' }} />
                  {t.verified}
                </span>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontSize: '0.85rem', 
                  color: textSecondary 
                }}>
                  <Clock size={16} style={{ color: '#3b82f6' }} />
                  {lang === 'ar' ? 'متاح اليوم' : 'Available Today'}
                </span>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontSize: '0.85rem', 
                  color: textSecondary 
                }}>
                  <Users size={16} style={{ color: '#8b5cf6' }} />
                  {craftsman.completedJobs || 0}+ {t.completedJobs}
                </span>
                <span style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontSize: '0.85rem', 
                  color: textSecondary 
                }}>
                  <MapPin size={16} style={{ color: '#ef4444' }} />
                  {craftsman.city} {craftsman.district}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Image Modal ===== */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)} 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.9)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 10000, 
            padding: '20px' 
          }}
        >
          <img 
            src={selectedImage.url || selectedImage} 
            alt="" 
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              borderRadius: '12px', 
              objectFit: 'contain' 
            }} 
          />
          <button 
            onClick={() => setSelectedImage(null)} 
            style={{ 
              position: 'absolute', 
              top: '20px', 
              right: '20px', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'white', 
              fontSize: '1.5rem' 
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ✅ مودال إضافة التقييم */}
      <AddReviewModal
        isOpen={showReviewModal}
        onClose={handleReviewClose}
        bookingId={selectedBooking?.id}
        craftsmanName={
          selectedBooking?.craftsman 
            ? `${selectedBooking.craftsman.first_name || ''} ${selectedBooking.craftsman.last_name || ''}`.trim()
            : fullName
        }
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default CraftsmanDetailPage;
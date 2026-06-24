// src/pages/CraftsmanProfilePage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ImageUploader from '../components/Upload/ImageUploader';
import { 
  User, Camera, Mail, Phone, MapPin, Wrench, DollarSign,
  FileText, Save, Lock, Eye, EyeOff, Trash2, Plus,
  X, Star, Briefcase, Award, Clock, Image, Upload,
  AlertCircle, CheckCircle, Sparkles, Edit3, Grid,
  Heart, Share2, Settings, LogOut, Shield, TrendingUp,
  Loader
} from 'lucide-react';

const CraftsmanProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [lang, setLang] = useState('ar');
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [stats, setStats] = useState({
    total_earnings: 0,
    completed_bookings: 0,
    pending_bookings: 0,
    rating: 0,
    reviews_count: 0,
    is_featured: false,
  });
  const fileInputRef = useRef(null);

  // ✅ Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    whatsapp: '',
    city: '',
    district: '',
    profession: '',
    bio: '',
    price: '',
    priceType: 'hour',
    yearsExp: '',
  });

  // ============================================================
  // 🌍 Language
  // ============================================================
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // ============================================================
  // ✅ جلب بيانات الحرفي والإحصائيات من API
  // ============================================================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const statsData = await api.getCraftsmanStats();
        setStats(statsData.stats || {});
        
        const userData = await api.getMe();
        if (userData.user) {
          const u = userData.user;
          setProfile(prev => ({
            ...prev,
            firstName: u.name?.split(' ')[0] || '',
            lastName: u.name?.split(' ')[1] || '',
            email: u.email || '',
            phone: u.phone || '',
            city: u.craftsman?.city || '',
            profession: u.craftsman?.crafts?.map(c => c.name).join(', ') || '',
          }));
          if (u.avatar_url) setAvatar(u.avatar_url);
        }
      } catch (error) {
        console.warn('⚠️ Using fallback data:', error);
        const savedProfile = localStorage.getItem('craftsmanProfile');
        if (savedProfile) {
          try { setProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) })); } catch {}
        }
        const savedAvatar = localStorage.getItem('craftsmanAvatar');
        if (savedAvatar) setAvatar(savedAvatar);
        const savedPortfolio = localStorage.getItem('craftsmanPortfolio');
        if (savedPortfolio) {
          try { setPortfolioImages(JSON.parse(savedPortfolio)); } catch {}
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // ============================================================
  // 📝 Translations
  // ============================================================
  const t = {
    profile: lang === 'ar' ? 'الملف الشخصي' : 'Profile',
    craftsman: lang === 'ar' ? 'حرفي' : 'Craftsman',
    personalInfo: lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Info',
    portfolio: lang === 'ar' ? 'معرض الأعمال' : 'Portfolio',
    settings: lang === 'ar' ? 'الإعدادات' : 'Settings',
    firstName: lang === 'ar' ? 'الاسم الأول' : 'First Name',
    lastName: lang === 'ar' ? 'الاسم الأخير' : 'Last Name',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
    phone: lang === 'ar' ? 'رقم الهاتف' : 'Phone',
    whatsapp: lang === 'ar' ? 'واتساب' : 'WhatsApp',
    city: lang === 'ar' ? 'المدينة' : 'City',
    district: lang === 'ar' ? 'الحي' : 'District',
    profession: lang === 'ar' ? 'المهنة' : 'Profession',
    bio: lang === 'ar' ? 'نبذة عني' : 'About Me',
    price: lang === 'ar' ? 'السعر' : 'Price',
    pricePerHour: lang === 'ar' ? 'للساعة' : 'per hour',
    pricePerMeter: lang === 'ar' ? 'للمتر' : 'per meter',
    pricePerJob: lang === 'ar' ? 'للخدمة' : 'per job',
    yearsExp: lang === 'ar' ? 'سنوات الخبرة' : 'Years of Experience',
    egp: lang === 'ar' ? 'ج.م' : 'EGP',
    save: lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes',
    saved: lang === 'ar' ? 'تم حفظ التغييرات بنجاح!' : 'Changes saved successfully!',
    changePhoto: lang === 'ar' ? 'تغيير الصورة' : 'Change Photo',
    addToPortfolio: lang === 'ar' ? 'أضف صوراً من أعمالك' : 'Add photos of your work',
    portfolioDesc: lang === 'ar' ? 'اعرض أفضل أعمالك لجذب المزيد من العملاء' : 'Showcase your best work to attract more clients',
    changePassword: lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password',
    currentPassword: lang === 'ar' ? 'كلمة المرور الحالية' : 'Current Password',
    newPassword: lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password',
    confirmPassword: lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password',
    change: lang === 'ar' ? 'تغيير' : 'Change',
    stats: lang === 'ar' ? 'الإحصائيات' : 'Statistics',
    earnings: lang === 'ar' ? 'الأرباح' : 'Earnings',
    completed: lang === 'ar' ? 'مكتملة' : 'Completed',
    pending: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
    rating: lang === 'ar' ? 'التقييم' : 'Rating',
    featured: lang === 'ar' ? 'مميز' : 'Featured',
    error: lang === 'ar' ? 'حدث خطأ' : 'Error',
    passwordChanged: lang === 'ar' ? '✅ تم تغيير كلمة المرور بنجاح' : '✅ Password changed successfully',
    fillFields: lang === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields',
    passwordMismatch: lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match',
    passwordMin: lang === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    deleteImage: lang === 'ar' ? 'حذف الصورة' : 'Delete Image',
    imageDeleted: lang === 'ar' ? '✅ تم حذف الصورة بنجاح' : '✅ Image deleted successfully',
  };

  // ============================================================
  // 🎨 Handlers
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  // ============================================================
  // ✅ دوال رفع الصور
  // ============================================================

  const uploadImage = async (file, type = 'avatar') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await api.uploadImage(file, type);
      
      if (type === 'avatar' || type === 'profile_photo') {
        setAvatar(data.url);
        setSuccess('تم تحديث الصورة الشخصية بنجاح');
      }
      
      if (type === 'portfolio') {
        const newImage = {
          id: data.id || Date.now(),
          url: data.url,
          path: data.path || data.url?.split('/storage/')[1] || '',
          name: data.name || 'صورة',
          date: new Date().toISOString(),
        };
        setPortfolioImages(prev => [...prev, newImage]);
        setSuccess('تم إضافة الصورة بنجاح');
      }
      
      setTimeout(() => setSuccess(''), 3000);
      return data;
      
    } catch (error) {
      console.error('❌ Upload error:', error);
      setError(error.message || 'حدث خطأ في رفع الصورة');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
    
    await uploadImage(file, 'profile_photo');
  };

  const handleUploadMultiplePortfolio = async (files) => {
    if (!files || files.length === 0) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await api.uploadMultiple(files, 'portfolio');
      
      // ✅ حفظ الصور مع المسار للحذف لاحقاً
      const newImages = (data.uploads || data.images || []).map(img => ({
        id: img.id || Date.now() + Math.random(),
        url: img.url || img.path,
        path: img.path || img.url?.split('/storage/')[1] || '',
        name: img.name || 'صورة',
        date: new Date().toISOString(),
      }));
      
      setPortfolioImages(prev => [...prev, ...newImages]);
      setSuccess(`تم إضافة ${newImages.length} صور بنجاح`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Error uploading multiple images:', error);
      setError(error.message || 'حدث خطأ في رفع الصور');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleUploadAvatar(file);
    }
  };

  const handlePortfolioUpload = async (files) => {
    await handleUploadMultiplePortfolio(files);
  };

  // ============================================================
  // ✅ حفظ الملف الشخصي
  // ============================================================
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      if (profile.bio) formData.append('bio', profile.bio);
      if (profile.price) formData.append('hourly_rate', profile.price);
      if (profile.city) formData.append('city', profile.city);
      if (profile.district) formData.append('district', profile.district);
      if (profile.phone) formData.append('phone', profile.phone);
      if (profile.whatsapp) formData.append('whatsapp', profile.whatsapp);
      if (profile.yearsExp) formData.append('years_experience', profile.yearsExp);
      
      if (avatar && avatar.startsWith('data:')) {
        const res = await fetch(avatar);
        const blob = await res.blob();
        formData.append('profile_photo', blob, 'avatar.jpg');
      }
      
      if (profile.profession) {
        const skills = profile.profession.split(',').map(s => s.trim());
        skills.forEach(skill => formData.append('skills[]', skill));
      }

      const data = await api.updateCraftsmanProfile(formData);
      
      if (data.craftsman) {
        updateUser({ craftsman: data.craftsman });
      }
      
      setSuccess(t.saved);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('❌ Save error:', error);
      setError(error.message || 'حدث خطأ في حفظ التغييرات');
      localStorage.setItem('craftsmanProfile', JSON.stringify(profile));
    }
    setLoading(false);
  };

  // ============================================================
  // ✅ حذف صورة من المعرض - باستخدام api.deleteFile
  // ============================================================
  const removePortfolioImage = async (id) => {
    // ✅ طلب تأكيد من المستخدم
    if (!window.confirm(t.deleteImage)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ البحث عن الصورة في المصفوفة للحصول على المسار
      const imageToDelete = portfolioImages.find(img => img.id === id);
      
      if (imageToDelete && imageToDelete.path) {
        // ✅ استخدام deleteFile مع المسار
        await api.deleteFile(imageToDelete.path);
        console.log('✅ Image deleted from server:', imageToDelete.path);
      } else if (imageToDelete && imageToDelete.url) {
        // ✅ استخراج المسار من URL
        const path = imageToDelete.url.split('/storage/')[1];
        if (path) {
          await api.deleteFile(path);
          console.log('✅ Image deleted from server:', path);
        } else {
          console.warn('⚠️ Could not extract path from URL:', imageToDelete.url);
        }
      } else {
        console.warn('⚠️ No path found for image, deleting locally only');
      }
      
      // ✅ حذف من القائمة المحلية
      setPortfolioImages(prev => prev.filter(img => img.id !== id));
      setSuccess(t.imageDeleted);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('❌ Error deleting portfolio image:', error);
      
      // ✅ حتى لو فشل الحذف من السيرفر، احذف محلياً
      setPortfolioImages(prev => prev.filter(img => img.id !== id));
      setError(error.message || 'حدث خطأ في حذف الصورة');
    }
    setLoading(false);
  };

  // ============================================================
  // ✅ تغيير كلمة المرور - متوافق مع الـ API
  // ============================================================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');
    setSuccess('');

    // ✅ التحقق من البيانات
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t.fillFields);
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError(t.passwordMin);
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      setPasswordLoading(false);
      return;
    }

    try {
      // ✅ استخدام الحقول الصحيحة حسب توثيق الـ API
      // POST /api/auth/change-password
      // Body: current_password, password, password_confirmation
      await api.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      
      setSuccess(t.passwordChanged);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 4000);
      
    } catch (error) {
      console.error('❌ Change password error:', error);
      
      // ✅ عرض تفاصيل الخطأ من الـ Backend
      if (error.errors) {
        const messages = Object.entries(error.errors)
          .map(([field, msgs]) => {
            const fieldNames = {
              'current_password': 'كلمة المرور الحالية',
              'password': 'كلمة المرور الجديدة',
              'password_confirmation': 'تأكيد كلمة المرور',
            };
            return `${fieldNames[field] || field}: ${msgs.join(', ')}`;
          })
          .join(' | ');
        setError(messages);
      } else {
        setError(error.message || 'حدث خطأ في تغيير كلمة المرور');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // ============================================================
  // 🎨 Dynamic Colors
  // ============================================================
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';
  const errorColor = '#ef4444';
  const successColor = '#059669';

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${hasError ? errorColor : borderColor}`,
    borderRadius: '10px',
    fontSize: '0.95rem',
    color: textColor,
    background: inputBg,
    outline: 'none',
    fontFamily: "'Cairo', sans-serif",
    transition: 'all 0.3s ease',
    textAlign: lang === 'ar' ? 'right' : 'left',
  });

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif", direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.12); }
        .tab-active { background: #3b82f6 !important; color: white !important; }
        .animate-spin { animation: spin 1s linear infinite; }
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .portfolio-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ===== Hero ===== */}
      <div style={{
        background: darkMode ? 'linear-gradient(160deg, #1e3a8a, #1e40af)' : 'linear-gradient(160deg, #2563eb, #1d4ed8)',
        color: 'white', padding: '48px 0', textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          {/* Avatar */}
          <div className="animate-fade-in-up" style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: avatar ? 'transparent' : 'rgba(255,255,255,0.2)',
              border: '4px solid rgba(255,255,255,0.3)', overflow: 'hidden',
              margin: '0 auto', cursor: 'pointer', position: 'relative',
            }}
            onClick={() => fileInputRef.current?.click()}>
              {avatar ? (
                <img src={avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700 }}>
                  {profile.firstName?.charAt(0) || 'ح'}
                </div>
              )}
              <div style={{
                position: 'absolute', bottom: '4px', right: '4px',
                width: '30px', height: '30px', borderRadius: '50%',
                background: '#10b981', display: 'flex', alignItems: 'center',
                justifyContent: 'center', border: '3px solid white',
                cursor: 'pointer',
              }}>
                <Camera size={14} color="white" />
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
          </div>

          <h1 className="animate-fade-in-up delay-100" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="animate-fade-in-up delay-200" style={{ fontSize: '1rem', opacity: 0.85 }}>
            {profile.profession || t.craftsman}
          </p>
          {stats.is_featured && (
            <span style={{ display: 'inline-block', marginTop: '8px', background: 'rgba(255,255,255,0.2)', padding: '4px 16px', borderRadius: '50px', fontSize: '0.8rem' }}>
              ⭐ {t.featured}
            </span>
          )}
        </div>
      </div>

      {/* ===== Stats Cards ===== */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px', marginTop: '-20px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {[
            { value: `${stats.total_earnings || 0} ${t.egp}`, label: t.earnings, color: '#059669' },
            { value: stats.completed_bookings || 0, label: t.completed, color: '#3b82f6' },
            { value: stats.pending_bookings || 0, label: t.pending, color: '#f59e0b' },
            { value: stats.rating || 0, label: t.rating, color: '#8b5cf6' },
          ].map((stat, i) => (
            <div key={i} style={{ background: cardBg, borderRadius: '12px', padding: '16px', textAlign: 'center', border: `1px solid ${borderColor}` }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', color: textSecondary }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Content ===== */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ===== Messages ===== */}
        {error && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
            color: errorColor,
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(220,38,38,0.2)',
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
            color: successColor,
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(5,150,105,0.2)',
          }}>
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* ===== Tabs ===== */}
        <div className="animate-fade-in-up" style={{
          display: 'flex', gap: '8px', marginBottom: '28px',
          background: cardBg, borderRadius: '14px', padding: '6px',
          border: `1px solid ${borderColor}`, flexWrap: 'wrap',
        }}>
          {[
            { id: 'info', label: t.personalInfo, icon: <User size={16} /> },
            { id: 'portfolio', label: t.portfolio, icon: <Image size={16} /> },
            { id: 'settings', label: t.settings, icon: <Settings size={16} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '12px 20px', borderRadius: '10px',
                border: 'none', cursor: 'pointer', fontWeight: 600,
                fontSize: '0.9rem', fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.3s ease', minWidth: '120px',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : textColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== Info Tab ===== */}
        {activeTab === 'info' && (
          <div className="animate-fade-in-up">
            <div style={{ background: cardBg, borderRadius: '16px', padding: '32px', border: `1px solid ${borderColor}` }}>
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.firstName}</label>
                    <input type="text" name="firstName" value={profile.firstName} onChange={handleChange} style={inputStyle()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.lastName}</label>
                    <input type="text" name="lastName" value={profile.lastName} onChange={handleChange} style={inputStyle()} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.email}</label>
                    <input type="email" name="email" value={profile.email} onChange={handleChange} style={inputStyle()} disabled />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.phone}</label>
                    <input type="tel" name="phone" value={profile.phone} onChange={handleChange} style={inputStyle()} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.whatsapp}</label>
                    <input type="tel" name="whatsapp" value={profile.whatsapp} onChange={handleChange} style={inputStyle()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.profession}</label>
                    <input type="text" name="profession" value={profile.profession} onChange={handleChange} style={inputStyle()} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.city}</label>
                    <input type="text" name="city" value={profile.city} onChange={handleChange} style={inputStyle()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.district}</label>
                    <input type="text" name="district" value={profile.district} onChange={handleChange} style={inputStyle()} />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>
                    <FileText size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    {t.bio}
                  </label>
                  <textarea name="bio" value={profile.bio} onChange={handleChange} rows="4"
                    style={{ ...inputStyle(), resize: 'vertical', minHeight: '100px' }}
                    placeholder={lang === 'ar' ? 'اكتب نبذة عن خبراتك ومهاراتك...' : 'Write about your experience and skills...'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.price} ({t.egp})</label>
                    <input type="number" name="price" value={profile.price} onChange={handleChange} style={inputStyle()} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{lang === 'ar' ? 'نوع التسعير' : 'Price Type'}</label>
                    <select name="priceType" value={profile.priceType} onChange={handleChange} style={inputStyle()}>
                      <option value="hour">{t.pricePerHour}</option>
                      <option value="meter">{t.pricePerMeter}</option>
                      <option value="job">{t.pricePerJob}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.yearsExp}</label>
                    <input type="number" name="yearsExp" value={profile.yearsExp} onChange={handleChange} style={inputStyle()} />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  padding: '14px 32px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700,
                  fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
                  opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                  {loading ? lang === 'ar' ? 'جاري الحفظ...' : 'Saving...' : t.save}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===== Portfolio Tab ===== */}
        {activeTab === 'portfolio' && (
          <div className="animate-fade-in-up">
            <div style={{ background: cardBg, borderRadius: '16px', padding: '32px', border: `1px solid ${borderColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Image size={24} style={{ color: '#3b82f6' }} />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: textColor, margin: 0 }}>{t.addToPortfolio}</h2>
              </div>
              <p style={{ color: textSecondary, marginBottom: '24px', fontSize: '0.9rem' }}>{t.portfolioDesc}</p>

              <ImageUploader 
                onUpload={handlePortfolioUpload} 
                multiple={true} 
                maxFiles={10} 
                loading={loading}
              />

              {portfolioImages.length > 0 && (
                <div className="portfolio-grid" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px', marginTop: '24px',
                }}>
                  {portfolioImages.map((img, index) => {
                    // ✅ التحقق من وجود URL صالح
                    const imageUrl = img.url || img;
                    const imageName = img.name || `${lang === 'ar' ? 'صورة' : 'Image'} ${index + 1}`;
                    
                    return (
                      <div key={img.id || index} className="hover-lift" style={{
                        position: 'relative', borderRadius: '12px', overflow: 'hidden',
                        height: '160px', border: `1px solid ${borderColor}`,
                      }}>
                        <img 
                          src={typeof imageUrl === 'string' ? imageUrl : ''} 
                          alt={imageName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/180x160/e2e8f0/64748b?text=+';
                          }}
                        />
                        <button 
                          onClick={() => removePortfolioImage(img.id)}
                          disabled={loading}
                          style={{
                            position: 'absolute', top: '8px', right: '8px',
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'rgba(220,38,38,0.9)', color: 'white',
                            border: 'none', cursor: loading ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: loading ? 0.5 : 1,
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <X size={14} />
                        </button>
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'rgba(0,0,0,0.6)', color: 'white',
                          padding: '6px 10px', fontSize: '0.75rem',
                          textAlign: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {imageName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== Settings Tab ===== */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in-up">
            {/* ===== Change Password ===== */}
            <div style={{ background: cardBg, borderRadius: '16px', padding: '32px', border: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: textColor, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={18} style={{ color: '#3b82f6' }} />
                {t.changePassword}
              </h3>

              <form onSubmit={handleChangePassword}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.currentPassword}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showCurrentPassword ? 'text' : 'password'} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={inputStyle()}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: textSecondary,
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.newPassword}</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={inputStyle()}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: textSecondary,
                        }}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px', fontSize: '0.85rem' }}>{t.confirmPassword}</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={inputStyle()}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: textSecondary,
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={passwordLoading} style={{
                  padding: '12px 28px',
                  background: passwordLoading ? '#94a3b8' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: passwordLoading ? 0.7 : 1,
                }}>
                  {passwordLoading ? <Loader size={18} className="animate-spin" /> : <Lock size={18} />}
                  {passwordLoading ? lang === 'ar' ? 'جاري التغيير...' : 'Changing...' : t.change}
                </button>
              </form>
            </div>

            {/* ❌ تم إزالة زر حذف الحساب لأنه غير مدعوم في الـ Backend */}
          </div>
        )}
      </div>
    </div>
  );
};

export default CraftsmanProfilePage;
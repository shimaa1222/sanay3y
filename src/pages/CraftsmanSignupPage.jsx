// src/pages/CraftsmanSignupPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  MapPin, Navigation, User, Mail, Phone, MessageCircle,
  Lock, Eye, EyeOff, Wrench, Shield, Camera, ChevronDown,
  CheckCircle, AlertCircle, ArrowLeft, Star, Sparkles,
  Briefcase, Building, Home, Loader, Upload, X, Image
} from 'lucide-react';

// ✅ قائمة المهن الاحتياطية (Fallback)
const fallbackProfessionsList = [
  { id: 1, name: 'سباك', icon: '🔧' },
  { id: 2, name: 'كهربائي', icon: '⚡' },
  { id: 3, name: 'نجار', icon: '🪚' },
  { id: 4, name: 'نقاش', icon: '🎨' },
  { id: 5, name: 'فني تكييف', icon: '❄️' },
  { id: 6, name: 'بناء', icon: '🏗️' },
  { id: 7, name: 'حداد', icon: '🔩' },
  { id: 8, name: 'مبلط', icon: '🧱' },
  { id: 9, name: 'فني ستلايت', icon: '📡' },
  { id: 10, name: 'ميكانيكي', icon: '🔧' },
  { id: 11, name: 'عامل نظافة', icon: '🧹' },
  { id: 12, name: 'مكافحة حشرات', icon: '🐛' },
  { id: 13, name: 'أخرى', icon: '➕' },
];

const egyptianCities = [
  'القاهرة', 'الإسكندرية', 'الجيزة', 'حلوان', 'السادس من أكتوبر',
  'بورسعيد', 'السويس', 'الإسماعيلية', 'المنصورة', 'طنطا',
  'الزقازيق', 'بنها', 'دمنهور', 'كفر الشيخ', 'شبين الكوم',
  'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج',
  'قنا', 'الأقصر', 'أسوان', 'الغردقة', 'شرم الشيخ',
  'دمياط', 'مرسى مطروح', 'العاشر من رمضان'
];

// ✅ دالة تنظيف رقم الهاتف المصري
const formatEgyptianPhone = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.length === 10 && !cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
};

// ✅ دالة التحقق من رقم الهاتف المصري
const validateEgyptianPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
  return phoneRegex.test(cleaned);
};

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  whatsapp: '',
  city: '',
  district: '',
  profession: '',
  customProfession: '',
  password: '',
  confirmPassword: '',
  latitude: null,
  longitude: null,
  nationalIdFront: null,
  nationalIdFrontPreview: null,
  nationalIdBack: null,
  nationalIdBackPreview: null,
  craftIds: [],
};

// ✅ مكون عرض الأخطاء
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <span style={{ 
      color: '#dc2626', 
      fontSize: '0.75rem', 
      marginTop: '4px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '4px' 
    }}>
      <AlertCircle size={12} />
      {error}
    </span>
  );
};

// ✅ مكون رفع الصورة
const ImageUploadZone = ({ 
  type, 
  preview, 
  onFileChange, 
  onRemove, 
  label, 
  fieldError,
  darkMode,
  textColor,
  textSecondary,
  borderColor,
  t 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const fakeEvent = { target: { files: e.dataTransfer.files } };
      onFileChange(fakeEvent);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
        {label} <span style={{ color: '#dc2626' }}>*</span>
        <ErrorMessage error={fieldError} />
      </label>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${fieldError ? '#dc2626' : preview ? '#059669' : dragActive ? '#3b82f6' : borderColor}`,
          borderRadius: '14px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          background: preview ? 'rgba(5,150,105,0.05)' : dragActive ? 'rgba(59,130,246,0.05)' : (darkMode ? '#0f172a' : '#f8fafc'),
          position: 'relative',
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {preview ? (
          <div style={{ width: '100%' }}>
            <img 
              src={preview} 
              alt={type === 'front' ? 'ID Front' : 'ID Back'} 
              style={{ 
                maxHeight: '120px', 
                margin: '0 auto', 
                borderRadius: '8px',
                maxWidth: '100%',
                objectFit: 'contain',
              }} 
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '12px', 
              marginTop: '8px' 
            }}>
              <span style={{ 
                color: '#059669', 
                fontWeight: 600, 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <CheckCircle size={14} /> {t.uploaded}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                style={{
                  padding: '4px 12px',
                  borderRadius: '8px',
                  background: 'rgba(220,38,38,0.1)',
                  border: '1px solid #dc2626',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: "'Cairo', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(220,38,38,0.2)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'rgba(220,38,38,0.1)'; }}
              >
                <X size={12} /> {t.remove}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
            }}>
              {dragActive ? <Upload size={24} color="#3b82f6" /> : <Camera size={24} color="#3b82f6" />}
            </div>
            <p style={{ fontWeight: 600, color: textColor, fontSize: '0.9rem', marginBottom: '4px' }}>
              {dragActive ? t.dragDrop : t.uploadText}
            </p>
            <p style={{ fontSize: '0.8rem', color: textSecondary }}>
              {t.uploadHint}
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

// ✅ المكون الرئيسي
const CraftsmanSignupPage = () => {
  const { login } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [lang, setLang] = useState('ar');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMethod, setLocationMethod] = useState('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCrafts, setLoadingCrafts] = useState(true);
  const [professionsList, setProfessionsList] = useState(fallbackProfessionsList);
  const fileInputRefFront = useRef(null);
  const fileInputRefBack = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [errors, setErrors] = useState({});

  // ✅ جلب المهن من الباك إند
  useEffect(() => {
    const fetchCrafts = async () => {
      setLoadingCrafts(true);
      try {
        const data = await api.getCrafts();
        if (data.crafts && data.crafts.length > 0) {
          const craftsFromBackend = data.crafts.map(c => ({
            id: c.id,
            name: c.name,
            icon: '🔧',
          }));
          setProfessionsList(craftsFromBackend);
          console.log('✅ Crafts loaded from backend:', craftsFromBackend.length);
          console.log('📋 Available craft IDs:', craftsFromBackend.map(c => ({ id: c.id, name: c.name })));
        } else {
          console.warn('⚠️ No crafts from backend, using fallback');
          setProfessionsList(fallbackProfessionsList);
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch crafts, using fallback:', error.message);
        setProfessionsList(fallbackProfessionsList);
      } finally {
        setLoadingCrafts(false);
      }
    };
    fetchCrafts();
  }, []);

  // Language initialization
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => {
      const currentLang = localStorage.getItem('language') || 'ar';
      setLang(currentLang);
    };
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // Translations
  const t = {
    title: lang === 'ar' ? 'تسجيل حرفي جديد' : 'New Craftsman Registration',
    subtitle: lang === 'ar' ? 'انضم إلى مجتمع الحرفيين وابدأ في استقبال الطلبات' : 'Join the craftsmen community and start receiving requests',
    personalInfo: lang === 'ar' ? 'المعلومات الشخصية' : 'Personal Information',
    locationInfo: lang === 'ar' ? 'الموقع' : 'Location',
    professionInfo: lang === 'ar' ? 'المهنة' : 'Profession',
    securityInfo: lang === 'ar' ? 'تأمين الحساب' : 'Account Security',
    firstName: lang === 'ar' ? 'الاسم الأول' : 'First Name',
    lastName: lang === 'ar' ? 'الاسم الأخير' : 'Last Name',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    phone: lang === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    whatsapp: lang === 'ar' ? 'واتساب (اختياري)' : 'WhatsApp (Optional)',
    city: lang === 'ar' ? 'المدينة' : 'City',
    district: lang === 'ar' ? 'الحي / المنطقة' : 'District / Area',
    selectCity: lang === 'ar' ? 'اختر المدينة' : 'Select City',
    profession: lang === 'ar' ? 'اختر مهنتك' : 'Select Your Profession',
    customProfession: lang === 'ar' ? 'اكتب مهنتك الجديدة' : 'Write your new profession',
    customProfessionNote: lang === 'ar' ? '⚠️ المهنة الجديدة ستظهر بعد موافقة المشرف' : '⚠️ New profession will appear after admin approval',
    password: lang === 'ar' ? 'كلمة المرور' : 'Password',
    confirmPassword: lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password',
    uploadIDFront: lang === 'ar' ? 'رفع صورة الهوية (الوجه الأمامي)' : 'Upload ID Photo (Front)',
    uploadIDBack: lang === 'ar' ? 'رفع صورة الهوية (الوجه الخلفي)' : 'Upload ID Photo (Back)',
    uploadText: lang === 'ar' ? 'اسحب وأفلت الصورة هنا أو اضغط للاختيار' : 'Drag & drop image here or click to select',
    uploadHint: lang === 'ar' ? 'JPG, PNG - الحد الأقصى 5MB' : 'JPG, PNG - Max 5MB',
    detectLocation: lang === 'ar' ? 'تحديد موقعي تلقائياً' : 'Detect My Location Automatically',
    manualLocation: lang === 'ar' ? 'إدخال الموقع يدوياً' : 'Enter Location Manually',
    locating: lang === 'ar' ? 'جاري تحديد الموقع...' : 'Locating...',
    locationDetected: lang === 'ar' ? '📍 تم تحديد موقعك بنجاح!' : '📍 Location detected successfully!',
    locationError: lang === 'ar' ? 'تعذر تحديد الموقع. الرجاء المحاولة مرة أخرى أو إدخال الموقع يدوياً.' : 'Unable to detect location. Please try again or enter manually.',
    submit: lang === 'ar' ? 'إرسال الطلب' : 'Submit Request',
    haveAccount: lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?',
    login: lang === 'ar' ? 'تسجيل الدخول' : 'Login',
    next: lang === 'ar' ? 'التالي' : 'Next',
    back: lang === 'ar' ? 'السابق' : 'Back',
    required: lang === 'ar' ? '*' : '*',
    steps: lang === 'ar' ? ['المعلومات الشخصية', 'الموقع والمهنة', 'تأمين الحساب'] : ['Personal Info', 'Location & Profession', 'Account Security'],
    creating: lang === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...',
    submitting: lang === 'ar' ? 'جاري الإرسال...' : 'Submitting...',
    redirecting: lang === 'ar' ? 'جاري التوجيه...' : 'Redirecting...',
    pendingApproval: lang === 'ar' ? '✅ تم إرسال طلبك بنجاح! سيتم مراجعته من قبل المشرف.' : '✅ Your request has been sent successfully! It will be reviewed by the admin.',
    chooseProfession: lang === 'ar' ? 'اختر مهنتك' : 'Choose your profession',
    craftIdRequired: lang === 'ar' ? 'يرجى اختيار مهنة واحدة على الأقل' : 'Please select at least one profession',
    loadingCrafts: lang === 'ar' ? 'جاري تحميل المهن...' : 'Loading professions...',
    remove: lang === 'ar' ? 'إزالة' : 'Remove',
    uploaded: lang === 'ar' ? 'تم رفع الصورة' : 'Image Uploaded',
    dragDrop: lang === 'ar' ? 'اسحب وأفلت الصورة هنا' : 'Drag & drop image here',
    fillRequired: lang === 'ar' ? 'يرجى تعبئة جميع الحقول المطلوبة' : 'Please fill in all required fields',
    retry: lang === 'ar' ? 'إعادة المحاولة' : 'Retry',
    selectProfession: lang === 'ar' ? 'اختر مهنة صالحة' : 'Select a valid profession',
    phoneInvalid: lang === 'ar' ? 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 010, 011, 012 أو 015' : 'Phone number must be 11 digits starting with 010, 011, 012 or 015',
    fileTooLarge: lang === 'ar' ? 'حجم الملف كبير جداً. الحد الأقصى 5MB' : 'File size too large. Max 5MB',
    invalidFileType: lang === 'ar' ? 'يرجى اختيار ملف صورة فقط (JPG, PNG)' : 'Please select an image file only (JPG, PNG)',
    idFrontRequired: lang === 'ar' ? 'يرجى رفع صورة الهوية (الوجه الأمامي)' : 'Please upload ID photo (Front)',
    idBackRequired: lang === 'ar' ? 'يرجى رفع صورة الهوية (الوجه الخلفي)' : 'Please upload ID photo (Back)',
    invalidCraft: lang === 'ar' ? '⚠️ المهنة المختارة غير صالحة. يرجى اختيار مهنة أخرى.' : '⚠️ Selected profession is invalid. Please choose another.',
  };

  // ✅ دالة معالجة التغيير
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === 'profession') {
      const otherOption = professionsList.find(p => p.name === 'أخرى');
      if (value === 'أخرى' || (otherOption && value === otherOption.name)) {
        setShowCustomInput(true);
        setFormData(prev => ({ 
          ...prev, 
          profession: value, 
          customProfession: '', 
          craftIds: [] 
        }));
      } else {
        setShowCustomInput(false);
        const selectedCraft = professionsList.find(p => p.name === value);
        if (selectedCraft) {
          setFormData(prev => ({ 
            ...prev, 
            profession: value,
            craftIds: [selectedCraft.id]
          }));
          console.log('✅ Selected craft:', selectedCraft.name, 'ID:', selectedCraft.id);
        } else {
          setFormData(prev => ({ 
            ...prev, 
            profession: value,
            craftIds: []
          }));
          console.warn('⚠️ Craft not found for:', value);
        }
      }
    } else if (name === 'phone' || name === 'whatsapp') {
      const cleaned = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [professionsList, errors]);

  // ✅ معالجة رفع الصور
  const handleFileChange = useCallback((e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(t.fileTooLarge);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError(t.invalidFileType);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'front') {
          setFormData(prev => ({
            ...prev,
            nationalIdFront: file,
            nationalIdFrontPreview: reader.result,
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            nationalIdBack: file,
            nationalIdBackPreview: reader.result,
          }));
        }
        setError('');
        setErrors(prev => ({ ...prev, nationalIdFront: '', nationalIdBack: '' }));
      };
      reader.readAsDataURL(file);
    }
  }, [t.fileTooLarge, t.invalidFileType]);

  // ✅ إزالة الصورة
  const removeImage = useCallback((type) => {
    if (type === 'front') {
      setFormData(prev => ({
        ...prev,
        nationalIdFront: null,
        nationalIdFrontPreview: null,
      }));
      if (fileInputRefFront.current) {
        fileInputRefFront.current.value = '';
      }
    } else {
      setFormData(prev => ({
        ...prev,
        nationalIdBack: null,
        nationalIdBackPreview: null,
      }));
      if (fileInputRefBack.current) {
        fileInputRefBack.current.value = '';
      }
    }
  }, []);

  // ✅ تحديد الموقع
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('متصفحك لا يدعم تحديد الموقع');
      return;
    }

    setIsLocating(true);
    setError('');
    setLocationMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
        }));
        setIsLocating(false);
        setLocationMessage(t.locationDetected);
        setTimeout(() => setLocationMessage(''), 4000);
      },
      (err) => {
        setIsLocating(false);
        setError(t.locationError);
        console.error('Geolocation error:', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [t.locationDetected, t.locationError]);

  // ✅ دالة validateStep
  const validateStep = useCallback((stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'مطلوب';
      if (!formData.lastName.trim()) newErrors.lastName = 'مطلوب';
      if (!formData.email.trim()) {
        newErrors.email = 'مطلوب';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'بريد غير صالح';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'مطلوب';
      } else if (!validateEgyptianPhone(formData.phone)) {
        newErrors.phone = t.phoneInvalid;
      }
    }

    if (stepNumber === 2) {
      if (!formData.city) newErrors.city = 'اختر المدينة';
      
      if (!showCustomInput) {
        if (!formData.profession) {
          newErrors.profession = 'اختر المهنة';
        } else if (formData.craftIds.length === 0) {
          newErrors.profession = 'حدث خطأ في اختيار المهنة';
        }
      } else {
        if (!formData.customProfession.trim()) {
          newErrors.customProfession = 'مطلوب';
        }
      }
      
      if (!formData.nationalIdFront) newErrors.nationalIdFront = t.idFrontRequired;
      if (!formData.nationalIdBack) newErrors.nationalIdBack = t.idBackRequired;
    }

    if (stepNumber === 3) {
      if (!formData.password) {
        newErrors.password = 'مطلوب';
      } else if (formData.password.length < 8) {
        newErrors.password = '8 أحرف على الأقل';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'غير متطابق';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, showCustomInput, t]);

  // ✅ دالة handleNext
  const handleNext = useCallback(() => {
    setError('');
    
    if (step === 2) {
      if (!formData.nationalIdFront) {
        setError(t.idFrontRequired);
        return;
      }
      if (!formData.nationalIdBack) {
        setError(t.idBackRequired);
        return;
      }
    }
    
    const isValid = validateStep(step);
    
    if (isValid) {
      setStep(prev => prev + 1);
      setError('');
    } else {
      const errorMessages = Object.values(errors).filter(Boolean);
      if (errorMessages.length > 0) {
        setError(errorMessages.join(' | '));
      } else {
        setError(t.fillRequired);
      }
    }
  }, [step, formData.nationalIdFront, formData.nationalIdBack, validateStep, errors, t]);

  const handleBack = useCallback(() => {
    setStep(prev => prev - 1);
    setError('');
  }, []);

  // ✅ دالة handleSubmit - المعدلة بالكامل مع حل مشكلة craft_ids
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setRegistrationSuccess('');

    if (!validateStep(3)) {
      const errorMessages = Object.values(errors).filter(Boolean);
      if (errorMessages.length > 0) {
        setError(errorMessages.join(' | '));
      } else {
        setError(t.fillRequired);
      }
      return;
    }

    // ✅ تنظيف رقم الهاتف
    const cleanedPhone = formatEgyptianPhone(formData.phone);
    if (!validateEgyptianPhone(cleanedPhone)) {
      setError(t.phoneInvalid);
      return;
    }

    const cleanedWhatsapp = formData.whatsapp ? formatEgyptianPhone(formData.whatsapp) : '';

    // ✅ التحقق من المهنة
    let craftIdsToSend = [];
    let customCraftName = '';

    if (showCustomInput) {
      // ✅ مهنة مخصصة
      customCraftName = formData.customProfession.trim();
      if (!customCraftName) {
        setError('يرجى كتابة اسم المهنة الجديدة');
        return;
      }
    } else {
      // ✅ مهنة من القائمة
      const selectedCraft = professionsList.find(p => p.name === formData.profession);
      if (selectedCraft) {
        // ✅ التحقق من أن الـ ID موجود في قائمة المهن
        const validIds = professionsList.map(p => p.id);
        if (validIds.includes(selectedCraft.id)) {
          craftIdsToSend = [selectedCraft.id];
          console.log('✅ Valid craft ID:', selectedCraft.id, 'Name:', selectedCraft.name);
        } else {
          setError(t.invalidCraft);
          return;
        }
      } else {
        // ✅ إذا كانت المهنة "أخرى" أو غير موجودة
        if (formData.profession === 'أخرى') {
          setShowCustomInput(true);
          setError('⚠️ يرجى كتابة اسم المهنة الجديدة');
          return;
        }
        setError(t.invalidCraft);
        return;
      }
    }

    // ✅ التحقق من craftIds
    if (craftIdsToSend.length === 0 && !showCustomInput) {
      setError(t.selectProfession);
      return;
    }

    // ✅ التحقق من الصور
    if (!formData.nationalIdFront) {
      setError(t.idFrontRequired);
      return;
    }
    if (!formData.nationalIdBack) {
      setError(t.idBackRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.firstName.trim());
      formDataToSend.append('last_name', formData.lastName.trim());
      formDataToSend.append('email', formData.email.trim().toLowerCase());
      formDataToSend.append('phone', cleanedPhone);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('password_confirmation', formData.confirmPassword);
      formDataToSend.append('national_id_front', formData.nationalIdFront);
      formDataToSend.append('national_id_back', formData.nationalIdBack);
      
      // ✅ إرسال craft_ids فقط إذا كانت موجودة وصالحة
      if (craftIdsToSend.length > 0) {
        craftIdsToSend.forEach(id => {
          formDataToSend.append('craft_ids[]', id);
        });
        console.log('📋 Sending craft_ids:', craftIdsToSend);
      }
      
      // ✅ إذا كانت مهنة مخصصة، أرسل custom_craft
      if (showCustomInput && customCraftName) {
        formDataToSend.append('custom_craft', customCraftName);
        console.log('📋 Sending custom_craft:', customCraftName);
      }
      
      // ✅ إضافة verified_token
      const verifiedToken = localStorage.getItem('verified_token');
      if (verifiedToken) {
        formDataToSend.append('verified_token', verifiedToken);
      }
      
      if (formData.district) formDataToSend.append('district', formData.district);
      if (formData.latitude) formDataToSend.append('latitude', formData.latitude);
      if (formData.longitude) formDataToSend.append('longitude', formData.longitude);
      if (cleanedWhatsapp) formDataToSend.append('whatsapp', cleanedWhatsapp);

      console.log('📤 Sending registration data...');
      console.log('📋 craft_ids:', craftIdsToSend);
      console.log('📋 Phone:', cleanedPhone);
      console.log('📋 Custom craft:', customCraftName);
      
      const data = await api.registerCraftsman(formDataToSend);
      console.log('✅ Registration successful:', data);

      setRegistrationSuccess(t.pendingApproval);
      localStorage.setItem('pendingVerificationEmail', formData.email);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('❌ Registration error:', err);
      
      // ✅ عرض تفاصيل الأخطاء من Backend
      if (err.errors) {
        const errorMessages = Object.entries(err.errors)
          .map(([field, messages]) => {
            const fieldNames = {
              'first_name': 'الاسم الأول',
              'last_name': 'الاسم الأخير',
              'email': 'البريد الإلكتروني',
              'phone': 'رقم الهاتف',
              'city': 'المدينة',
              'password': 'كلمة المرور',
              'national_id_front': 'البطاقة الأمامية',
              'national_id_back': 'البطاقة الخلفية',
              'craft_ids': 'المهن',
              'craft_ids.0': 'المهنة',
              'district': 'الحي',
              'custom_craft': 'المهنة المخصصة',
            };
            const fieldName = fieldNames[field] || field;
            return `${fieldName}: ${messages.join(', ')}`;
          })
          .join(' | ');
        setError(errorMessages);
      } else {
        setError(err.message || 'حدث خطأ في إنشاء الحساب');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, showCustomInput, professionsList, validateStep, errors, t, navigate]);

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';
  const gradientBg = darkMode 
    ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
    : 'linear-gradient(135deg, #1e40af, #3b82f6)';

  const inputStyle = useCallback((fieldError) => ({
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${fieldError ? '#dc2626' : borderColor}`,
    borderRadius: '10px',
    fontSize: '0.95rem',
    color: textColor,
    background: inputBg,
    outline: 'none',
    fontFamily: "'Cairo', sans-serif",
    transition: 'all 0.3s ease',
    textAlign: 'right',
  }), [borderColor, textColor, inputBg]);

  // ✅ عرض صفحة النجاح
  if (registrationSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: "'Cairo', sans-serif",
        direction: lang === 'ar' ? 'rtl' : 'ltr',
      }}>
        <div style={{
          background: cardBg,
          borderRadius: '24px',
          padding: '48px 40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <CheckCircle size={40} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#059669', marginBottom: '12px' }}>
            {lang === 'ar' ? '🎉 تم إرسال الطلب!' : '🎉 Request Sent!'}
          </h2>
          <p style={{ color: textSecondary, fontSize: '1rem', lineHeight: 1.8, marginBottom: '24px' }}>
            {registrationSuccess}
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              borderRadius: '12px',
              background: gradientBg,
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            {t.login}
          </Link>
        </div>
      </div>
    );
  }

  // ✅ باقي الكود (نفسه)
  return (
    <div style={{
      minHeight: '100vh',
      background: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Cairo', sans-serif",
      direction: lang === 'ar' ? 'rtl' : 'ltr',
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease forwards;
        }
        .animate-slide-right {
          animation: slideRight 0.4s ease forwards;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .hover-lift {
          transition: all 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .signup-card {
            padding: 32px 20px !important;
          }
        }
      `}</style>

      <div className="signup-card" style={{
        background: cardBg,
        borderRadius: '24px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        border: `1px solid ${borderColor}`,
      }}>
        
        {/* Progress Steps */}
        <div className="animate-fade-in-up" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '36px',
        }}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div style={{
                width: s <= step ? '36px' : '32px',
                height: s <= step ? '36px' : '32px',
                borderRadius: '50%',
                background: s <= step ? gradientBg : (darkMode ? '#334155' : '#e2e8f0'),
                color: s <= step ? 'white' : textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                transition: 'all 0.5s ease',
              }}>
                {s < step ? <CheckCircle size={18} /> : s}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Step Indicator */}
        <div className="animate-fade-in-up delay-100" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            background: darkMode ? 'rgba(59,130,246,0.15)' : '#eff6ff',
            color: '#3b82f6',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            {t.steps[step - 1]}
          </span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-in-up delay-200" style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: textColor,
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          {t.title}
        </h1>
        <p className="animate-fade-in-up delay-300" style={{
          fontSize: '0.95rem',
          color: textSecondary,
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          {t.subtitle}
        </p>

        {/* Error Message */}
        {error && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(220,38,38,0.1)' : '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            border: '1px solid rgba(220,38,38,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              {error}
            </div>
          </div>
        )}

        {/* Location Message */}
        {locationMessage && (
          <div className="animate-fade-in" style={{
            background: darkMode ? 'rgba(5,150,105,0.1)' : '#d1fae5',
            color: '#059669',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(5,150,105,0.2)',
          }}>
            <CheckCircle size={18} />
            {locationMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                    {t.firstName} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    style={inputStyle(errors.firstName)}
                    placeholder={lang === 'ar' ? 'محمد' : 'Mohamed'}
                  />
                  <ErrorMessage error={errors.firstName} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                    {t.lastName} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    style={inputStyle(errors.lastName)}
                    placeholder={lang === 'ar' ? 'علي' : 'Ali'}
                  />
                  <ErrorMessage error={errors.lastName} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                  {t.email} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ ...inputStyle(errors.email), paddingRight: '44px' }}
                    placeholder="craftsman@example.com"
                  />
                </div>
                <ErrorMessage error={errors.email} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                    {t.phone} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{ ...inputStyle(errors.phone), paddingRight: '44px' }}
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                  <ErrorMessage error={errors.phone} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                    {t.whatsapp}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MessageCircle size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      style={{ ...inputStyle(), paddingRight: '44px' }}
                      placeholder="01xxxxxxxxx"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: gradientBg,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  marginTop: '24px',
                  fontFamily: "'Cairo', sans-serif",
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                }}
              >
                {t.next}
              </button>
            </div>
          )}

          {/* Step 2: Location & Profession */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#3b82f6', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} />
                {t.locationInfo}
              </h3>

              <div style={{
                display: 'flex',
                background: darkMode ? '#0f172a' : '#f1f5f9',
                borderRadius: '12px',
                padding: '4px',
                marginBottom: '20px',
                gap: '4px',
              }}>
                <button
                  type="button"
                  onClick={() => setLocationMethod('auto')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    fontFamily: "'Cairo', sans-serif",
                    background: locationMethod === 'auto' ? gradientBg : 'transparent',
                    color: locationMethod === 'auto' ? 'white' : textColor,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Navigation size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {t.detectLocation}
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMethod('manual')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    fontFamily: "'Cairo', sans-serif",
                    background: locationMethod === 'manual' ? gradientBg : 'transparent',
                    color: locationMethod === 'manual' ? 'white' : textColor,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Building size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {t.manualLocation}
                </button>
              </div>

              {locationMethod === 'auto' && (
                <div style={{ textAlign: 'center', padding: '20px', marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={isLocating}
                    style={{
                      padding: '14px 28px',
                      borderRadius: '12px',
                      border: `2px dashed ${formData.latitude ? '#059669' : '#3b82f6'}`,
                      background: formData.latitude ? 'rgba(5,150,105,0.1)' : 'transparent',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: formData.latitude ? '#059669' : '#3b82f6',
                      fontFamily: "'Cairo', sans-serif",
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isLocating ? (
                      <Loader size={20} className="animate-spin" />
                    ) : formData.latitude ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Navigation size={20} />
                    )}
                    {isLocating ? t.locating : formData.latitude ? t.locationDetected : t.detectLocation}
                  </button>
                  
                  {formData.latitude && (
                    <div style={{ marginTop: '12px', fontSize: '0.85rem', color: textSecondary }}>
                      📍 Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              )}

              {locationMethod === 'manual' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                      {t.city} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, pointerEvents: 'none' }} />
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        style={{
                          ...inputStyle(errors.city),
                          paddingRight: '44px',
                          appearance: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">{t.selectCity}</option>
                        {egyptianCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, pointerEvents: 'none' }} />
                    </div>
                    <ErrorMessage error={errors.city} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                      {t.district}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Home size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        style={{ ...inputStyle(), paddingRight: '44px' }}
                        placeholder={lang === 'ar' ? 'مثال: مدينة نصر' : 'Ex: Nasr City'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Profession Section */}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#3b82f6', marginBottom: '16px', marginTop: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} />
                {t.professionInfo}
              </h3>

              {loadingCrafts ? (
                <div style={{ textAlign: 'center', padding: '40px', color: textSecondary }}>
                  <Loader size={40} className="animate-spin" style={{ margin: '0 auto 16px', display: 'block' }} />
                  <p>{t.loadingCrafts}</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ position: 'relative' }}>
                      <Wrench size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, pointerEvents: 'none' }} />
                      <select
                        name="profession"
                        onChange={handleChange}
                        value={formData.profession}
                        style={{
                          ...inputStyle(errors.profession),
                          paddingRight: '44px',
                          appearance: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">{t.chooseProfession}</option>
                        {professionsList.map(prof => (
                          <option key={prof.id} value={prof.name}>{prof.icon} {prof.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary, pointerEvents: 'none' }} />
                    </div>
                    <ErrorMessage error={errors.profession} />
                  </div>

                  {showCustomInput && (
                    <div style={{
                      background: darkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '2px solid #3b82f6',
                      marginBottom: '20px',
                    }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#3b82f6', marginBottom: '8px' }}>
                        {t.customProfession}
                      </label>
                      <input
                        type="text"
                        name="customProfession"
                        value={formData.customProfession}
                        onChange={handleChange}
                        style={{
                          ...inputStyle(errors.customProfession),
                          background: 'white',
                        }}
                        placeholder={lang === 'ar' ? 'أدخل اسم المهنة الجديدة' : 'Enter new profession name'}
                      />
                      <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '8px' }}>
                        ⚠️ {t.customProfessionNote}
                      </p>
                      <ErrorMessage error={errors.customProfession} />
                    </div>
                  )}
                </>
              )}

              {/* ID Upload - Front */}
              <ImageUploadZone
                type="front"
                preview={formData.nationalIdFrontPreview}
                onFileChange={(e) => handleFileChange(e, 'front')}
                onRemove={() => removeImage('front')}
                label={t.uploadIDFront}
                fieldError={errors.nationalIdFront}
                darkMode={darkMode}
                textColor={textColor}
                textSecondary={textSecondary}
                borderColor={borderColor}
                t={t}
              />

              {/* ID Upload - Back */}
              <ImageUploadZone
                type="back"
                preview={formData.nationalIdBackPreview}
                onFileChange={(e) => handleFileChange(e, 'back')}
                onRemove={() => removeImage('back')}
                label={t.uploadIDBack}
                fieldError={errors.nationalIdBack}
                darkMode={darkMode}
                textColor={textColor}
                textSecondary={textSecondary}
                borderColor={borderColor}
                t={t}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: `2px solid ${borderColor}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: textColor,
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t.back}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    background: gradientBg,
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '1rem',
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(59,130,246,0.3)',
                  }}
                >
                  {t.next}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Account Security */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                  {t.password} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ ...inputStyle(errors.password), paddingRight: '44px', paddingLeft: '44px' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: textSecondary,
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <ErrorMessage error={errors.password} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                  {t.confirmPassword} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ ...inputStyle(errors.confirmPassword), paddingRight: '44px', paddingLeft: '44px' }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      left: '14px',
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
                <ErrorMessage error={errors.confirmPassword} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '12px',
                    border: `2px solid ${borderColor}`,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: textColor,
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                  }}
                >
                  {t.back}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 2,
                    padding: '14px',
                    borderRadius: '12px',
                    background: isSubmitting ? '#94a3b8' : gradientBg,
                    color: 'white',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '1rem',
                    fontFamily: "'Cairo', sans-serif",
                    transition: 'all 0.3s ease',
                    boxShadow: isSubmitting ? 'none' : '0 4px 16px rgba(59,130,246,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {t.submit}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.95rem',
          color: textSecondary,
          marginTop: '28px',
        }}>
          {t.haveAccount}{' '}
          <Link to="/login" style={{
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: 700,
          }}>
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CraftsmanSignupPage;
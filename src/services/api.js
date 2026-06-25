// src/services/api.js
const API_URL = "https://sanay3e-production.up.railway.app/api";

// ✅ دوال مساعدة
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getFormHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ✅ تحسين handleResponse لعرض تفاصيل الأخطاء
const handleResponse = async (res) => {
  if (!res) {
    throw new Error("NETWORK_ERROR");
  }

  let data;
  try {
    data = await res.json();
  } catch (parseError) {
    console.warn('⚠️ Response is not JSON, status:', res.status);
    if (res.ok) {
      return { success: true, message: "تم بنجاح" };
    }
    throw new Error(`SERVER_ERROR_${res.status}`);
  }

  if (!res.ok) {
    let errorMessage = data.message || 'حدث خطأ غير متوقع';
    
    if (res.status === 422 && data.errors) {
      const errorDetails = Object.entries(data.errors)
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
            'craft_ids.*': 'المهنة',
            'district': 'الحي',
            'whatsapp': 'واتساب',
            'bio': 'السيرة الذاتية',
            'hourly_rate': 'السعر بالساعة',
            'full_address': 'العنوان الكامل',
            'is_available': 'متاح',
            'profile_photo': 'الصورة الشخصية',
            'skills': 'المهارات',
            'title': 'العنوان',
            'description': 'الوصف',
            'budget_from': 'الميزانية من',
            'budget_to': 'الميزانية إلى',
            'needed_by': 'مطلوب بحلول',
            'urgency': 'درجة الإلحاح',
            'images': 'الصور',
            'craft_id': 'المهنة',
            'service_id': 'الخدمة',
            'booking_date': 'تاريخ الحجز',
            'booking_time': 'وقت الحجز',
            'notes': 'ملاحظات',
            'location': 'الموقع',
            'rating': 'التقييم',
            'comment': 'التعليق',
            'current_password': 'كلمة المرور الحالية',
            'reason': 'السبب',
            'offered_price': 'السعر المعروض',
            'estimated_days': 'الأيام المتوقعة',
            'message': 'الرسالة',
            'status': 'الحالة',
            'custom_craft': 'المهنة المخصصة'
          };
          
          const fieldName = fieldNames[field] || field;
          const messagesText = messages.join(', ');
          return `${fieldName}: ${messagesText}`;
        })
        .join('\n');
      
      errorMessage = `❌ فشل التحقق من البيانات:\n${errorDetails}`;
      
      const error = new Error(errorMessage);
      error.errors = data.errors;
      error.status = res.status;
      error.data = data;
      throw error;
    }
    
    if (res.status === 401) {
      errorMessage = '⚠️ جلسة غير صالحة. يرجى تسجيل الدخول مرة أخرى.';
      localStorage.removeItem('token');
    }
    
    if (res.status === 403) {
      errorMessage = data.message || '⛔ ليس لديك صلاحية للقيام بهذا الإجراء';
    }
    
    if (res.status === 404) {
      errorMessage = data.message || '🔍 المورد غير موجود';
    }
    
    if (res.status === 429) {
      errorMessage = '⏳ طلبات كثيرة جداً. يرجى الانتظار ثم المحاولة مرة أخرى.';
    }
    
    const error = new Error(errorMessage);
    error.errors = data.errors || null;
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
};

// ============================================================
// API Object
// ============================================================

const api = {
  // ============================================================
  // ✅ PUBLIC - الحرفيون
  // ============================================================
  getFeaturedCraftsmen: async () => {
    try {
      const res = await fetch(`${API_URL}/craftsmen/featured`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getFeaturedCraftsmen fallback:', error.message);
      return { craftsmen: [] };
    }
  },

  getCraftsmen: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.craft_id) query.append("craft_id", params.craft_id);
      if (params.city) query.append("city", params.city);
      if (params.search) query.append("search", params.search);
      if (params.sort_by) query.append("sort_by", params.sort_by);
      if (params.per_page) query.append("per_page", params.per_page);
      if (params.page) query.append("page", params.page);
      
      const res = await fetch(
        `${API_URL}/craftsmen.home.search?${query.toString()}`,
        { headers: getHeaders() }
      );
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getCraftsmen fallback:', error.message);
      return { craftsmen: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 12 } };
    }
  },

  getCraftsman: async (id) => {
    try {
      const res = await fetch(`${API_URL}/craftsmen.home.show/${id}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getCraftsman fallback:', error.message);
      return { craftsman: null };
    }
  },

  getCrafts: async () => {
    try {
      const res = await fetch(`${API_URL}/crafts`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getCrafts fallback:', error.message);
      return { crafts: [] };
    }
  },

  // ============================================================
  // ✅ REVIEWS (Public - GET) - يعمل بدون تسجيل دخول
  // ============================================================
  
  /**
   * جلب جميع التقييمات (عام - بدون تسجيل دخول)
   * GET /api/auth/reviews
   */
  getReviews: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.per_page) query.append("per_page", params.per_page || 20);
      if (params.page) query.append("page", params.page || 1);
      if (params.craftsman_id) query.append("craftsman_id", params.craftsman_id);
      if (params.client_id) query.append("client_id", params.client_id);
      if (params.rating) query.append("rating", params.rating);
      if (params.sort_by) query.append("sort_by", params.sort_by || 'newest');
      
      const url = `${API_URL}/auth/reviews?${query.toString()}`;
      console.log('📤 [API] Fetching public reviews:', url);
      
      const res = await fetch(url, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getReviews fallback:', error.message);
      return { reviews: [] };
    }
  },

  /**
   * جلب تقييمات حرفي معين
   * GET /api/auth/reviews?craftsman_id={id}
   */
  getCraftsmanReviews: async (craftsmanId, perPage = 10) => {
    return api.getReviews({ craftsman_id: craftsmanId, per_page: perPage });
  },

  /**
   * جلب تقييمات عميل معين
   * GET /api/auth/reviews?client_id={id}
   */
  getClientReviews: async (clientId, perPage = 10) => {
    return api.getReviews({ client_id: clientId, per_page: perPage });
  },

  /**
   * جلب التقييمات حسب التقييم (نجوم)
   * GET /api/auth/reviews?rating={rating}
   */
  getReviewsByRating: async (rating, perPage = 10) => {
    return api.getReviews({ rating, per_page: perPage });
  },

  // ============================================================
  // ✅ REVIEWS (Authenticated - Add/Delete)
  // ============================================================

  /**
   * إضافة تقييم (محمي - للعميل فقط)
   * POST /client/bookings.addreview/{id}/review
   */
  addReview: async (bookingId, data) => {
    try {
      const res = await fetch(
        `${API_URL}/client/bookings.addreview/${bookingId}/review`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        }
      );
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ addReview error:', error.message);
      throw error;
    }
  },

  /**
   * حذف تقييم (محمي - للعميل أو الأدمن)
   * DELETE /api/auth/reviews/{id}
   */
  deleteReview: async (reviewId) => {
    try {
      const res = await fetch(`${API_URL}/auth/reviews/${reviewId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ deleteReview error:', error.message);
      throw error;
    }
  },

  /**
   * الإشارة إلى أن التقييم مفيد (محمي)
   * POST /api/auth/reviews/{id}/helpful
   */
  markReviewHelpful: async (reviewId) => {
    try {
      const res = await fetch(`${API_URL}/auth/reviews/${reviewId}/helpful`, {
        method: "POST",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ markReviewHelpful error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ AUTH
  // ============================================================
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ Login error:', error.message);
      if (error.message === "NETWORK_ERROR" || error.message === "Failed to fetch") {
        throw new Error("لا يوجد اتصال بالخادم");
      }
      if (error.message.includes("SERVER_ERROR")) {
        throw new Error("حدث خطأ في الخادم");
      }
      throw error;
    }
  },

  registerClient: async (data) => {
    try {
      const res = await fetch(`${API_URL}/auth/register/client`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ registerClient error:', error.message);
      throw error;
    }
  },

  registerCraftsman: async (formData) => {
    try {
      console.log('📤 [API] registerCraftsman called');
      
      let craftIdsFromForm = [];
      
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`   ${pair[0]}: File (${pair[1].name}, ${(pair[1].size / 1024).toFixed(2)} KB, ${pair[1].type})`);
        } else {
          console.log(`   ${pair[0]}: ${pair[1]}`);
          if (pair[0] === 'craft_ids[]') {
            craftIdsFromForm.push(pair[1]);
          }
        }
      }
      
      console.log('📋 [API] craft_ids collected:', craftIdsFromForm);
      
      const phone = formData.get('phone');
      if (phone) {
        let cleanedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
        if (cleanedPhone.length === 10 && !cleanedPhone.startsWith('0')) {
          cleanedPhone = '0' + cleanedPhone;
          formData.set('phone', cleanedPhone);
          console.log(`   ✅ تم تصحيح رقم الهاتف إلى: ${cleanedPhone}`);
        }
        const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
        if (!phoneRegex.test(cleanedPhone)) {
          throw new Error('رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 010, 011, 012 أو 015');
        }
      }
      
      const nationalIdFront = formData.get('national_id_front');
      const nationalIdBack = formData.get('national_id_back');
      
      if (!nationalIdFront || !(nationalIdFront instanceof File)) {
        throw new Error('يرجى تحميل صورة البطاقة الأمامية');
      }
      
      if (!nationalIdBack || !(nationalIdBack instanceof File)) {
        throw new Error('يرجى تحميل صورة البطاقة الخلفية');
      }
      
      const maxSize = 5 * 1024 * 1024;
      if (nationalIdFront.size > maxSize) {
        throw new Error('حجم صورة البطاقة الأمامية كبير جداً (الحد الأقصى 5 ميجابايت)');
      }
      if (nationalIdBack.size > maxSize) {
        throw new Error('حجم صورة البطاقة الخلفية كبير جداً (الحد الأقصى 5 ميجابايت)');
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(nationalIdFront.type)) {
        throw new Error('صيغة البطاقة الأمامية غير مدعومة (يُسمح بـ JPG, JPEG, PNG)');
      }
      if (!allowedTypes.includes(nationalIdBack.type)) {
        throw new Error('صيغة البطاقة الخلفية غير مدعومة (يُسمح بـ JPG, JPEG, PNG)');
      }
      
      const craftIds = formData.getAll('craft_ids[]');
      console.log('📋 [API] craft_ids from getAll:', craftIds);
      
      const customCraft = formData.get('custom_craft');
      
      if ((!craftIds || craftIds.length === 0) && !customCraft) {
        throw new Error('يرجى اختيار مهنة على الأقل أو كتابة مهنة مخصصة');
      }
      
      const res = await fetch(`${API_URL}/auth/register/craftsman`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      
      const result = await handleResponse(res);
      console.log('✅ [API] registerCraftsman success:', result);
      return result;
      
    } catch (error) {
      console.warn('⚠️ registerCraftsman error:', error.message);
      if (error.errors) {
        throw error;
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ logout error:', error.message);
      return { success: true, message: "تم تسجيل الخروج" };
    }
  },

  getMe: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getMe error:', error.message);
      throw error;
    }
  },

  updateProfile: async (formData) => {
    try {
      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ updateProfile error:', error.message);
      throw error;
    }
  },

  changePassword: async (data) => {
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ changePassword error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ OTP & VERIFICATION
  // ============================================================
  sendOtp: async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/otp/send`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ sendOtp error:', error.message);
      throw error;
    }
  },

  verifyOtp: async (email, otp, purpose = 'register') => {
    try {
      const res = await fetch(`${API_URL}/auth/otp/verify`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, otp, purpose }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ verifyOtp error:', error.message);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ forgotPassword error:', error.message);
      throw error;
    }
  },

  resetPasswordWithOtp: async (reset_token, password, password_confirmation) => {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ reset_token, password, password_confirmation }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ resetPasswordWithOtp error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ CLIENT ROUTES
  // ============================================================
  getMyBookings: async (tab = 'upcoming') => {
    try {
      const res = await fetch(`${API_URL}/client/bookings?tab=${tab}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getMyBookings fallback:', error.message);
      return { bookings: { data: [] } };
    }
  },

  createBooking: async (data) => {
    try {
      const res = await fetch(`${API_URL}/client/bookings.store`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ createBooking error:', error.message);
      throw error;
    }
  },

  getBooking: async (id) => {
    try {
      const res = await fetch(`${API_URL}/client/bookings.show/${id}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getBooking error:', error.message);
      throw error;
    }
  },

  cancelBooking: async (id, reason = null) => {
    try {
      const res = await fetch(`${API_URL}/client/bookings.cancel/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
        body: reason ? JSON.stringify({ reason }) : undefined,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ cancelBooking error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ CRAFTSMAN ROUTES
  // ============================================================
  getCraftsmanStats: async () => {
    try {
      const res = await fetch(`${API_URL}/craftsman/stats`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getCraftsmanStats fallback:', error.message);
      return {  
        stats: {  
          total_earnings: 0,  
          completed_bookings: 0,  
          pending_bookings: 0,  
          cancelled_bookings: 0,  
          rating: 0,  
          reviews_count: 0,  
          is_featured: false  
        }  
      };
    }
  },

  updateCraftsmanProfile: async (formData) => {
    try {
      const res = await fetch(`${API_URL}/craftsman/profile`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ updateCraftsmanProfile error:', error.message);
      throw error;
    }
  },

  getCraftsmanBookings: async () => {
    try {
      const res = await fetch(`${API_URL}/craftsman/bookings`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getCraftsmanBookings fallback:', error.message);
      return { bookings: { data: [] } };
    }
  },

  updateBookingStatus: async (id, status, reason = null) => {
    try {
      const body = { status };
      if (reason) body.reason = reason;
      const res = await fetch(`${API_URL}/craftsman/bookings/${id}/status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ updateBookingStatus error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ SERVICE POSTS (CRAFTSMAN)
  // ============================================================
  
  getServicePosts: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.city) query.append("city", params.city);
      if (params.craft_id) query.append("craft_id", params.craft_id);
      if (params.urgency) query.append("urgency", params.urgency);
      if (params.search) query.append("search", params.search);
      if (params.per_page) query.append("per_page", params.per_page);
      if (params.page) query.append("page", params.page);
      const res = await fetch(
        `${API_URL}/craftsman/service-posts?${query.toString()}`,
        { headers: getHeaders() }
      );
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getServicePosts fallback:', error.message);
      return { posts: { data: [] } };
    }
  },

  respondToServicePost: async (postId, data) => {
    try {
      const res = await fetch(
        `${API_URL}/craftsman/service-posts/${postId}/respond`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(data),
        }
      );
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ respondToServicePost error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ SERVICE POSTS (CLIENT)
  // ============================================================
  
  getMyPosts: async () => {
    try {
      const res = await fetch(`${API_URL}/client/my-posts`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getMyPosts error:', error.message);
      throw error;
    }
  },

  createServicePost: async (formData) => {
    try {
      const res = await fetch(`${API_URL}/client/service-posts.store`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ createServicePost error:', error.message);
      throw error;
    }
  },

  getServicePost: async (id) => {
    try {
      const res = await fetch(`${API_URL}/client/service-posts/${id}`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getServicePost error:', error.message);
      throw error;
    }
  },

  deleteServicePost: async (id) => {
    try {
      const res = await fetch(`${API_URL}/client/service-posts.destroy/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ deleteServicePost error:', error.message);
      throw error;
    }
  },

  updatePostResponse: async (postId, responseId, status) => {
    try {
      const res = await fetch(
        `${API_URL}/client/service-posts/${postId}/responses/${responseId}`,
        {
          method: "PATCH",
          headers: getHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ updatePostResponse error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ UPLOAD
  // ============================================================
  
  /**
   * رفع صورة واحدة
   * POST /api/upload/image
   * @param {File} file - ملف الصورة
   * @param {string} type - نوع الصورة (avatar, profile_photo, national_id, portfolio, post_image, chat_file, document)
   * @returns {Promise<Object>}
   */
  uploadImage: async (file, type = "avatar") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch(`${API_URL}/upload/image`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ uploadImage error:', error.message);
      throw error;
    }
  },

  /**
   * رفع عدة صور
   * POST /api/upload/multiple
   * @param {File[]} files - مصفوفة من ملفات الصور
   * @param {string} type - نوع الصور (portfolio, post_image, chat_file)
   * @returns {Promise<Object>}
   */
  uploadMultiple: async (files, type = "portfolio") => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files[]", file));
      formData.append("type", type);
      const res = await fetch(`${API_URL}/upload/multiple`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ uploadMultiple error:', error.message);
      throw error;
    }
  },

  /**
   * رفع مستند
   * POST /api/upload/document
   * @param {File} file - ملف المستند (pdf, doc, docx, xls, xlsx, txt)
   * @returns {Promise<Object>}
   */
  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/upload/document`, {
        method: "POST",
        headers: getFormHeaders(),
        body: formData,
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ uploadDocument error:', error.message);
      throw error;
    }
  },

  /**
   * حذف ملف
   * DELETE /api/upload
   * @param {string} path - مسار الملف
   * @returns {Promise<Object>}
   */
  deleteFile: async (path) => {
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify({ path }),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ deleteFile error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // ✅ NOTIFICATIONS
  // ============================================================
  
  /**
   * جلب الإشعارات
   * GET /api/notifications
   * @param {boolean} unreadOnly - عرض غير المقروء فقط
   * @param {number} perPage - عدد النتائج لكل صفحة
   * @returns {Promise<Object>}
   */
  getNotifications: async (unreadOnly = false, perPage = 20) => {
    try {
      const query = new URLSearchParams();
      if (unreadOnly) query.append("unread_only", "true");
      query.append("per_page", perPage);
      const res = await fetch(
        `${API_URL}/notifications?${query.toString()}`,
        { headers: getHeaders() }
      );
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getNotifications fallback:', error.message);
      return { notifications: [], unread_count: 0, meta: { total: 0 } };
    }
  },

  /**
   * جلب عدد الإشعارات غير المقروءة
   * GET /api/notifications/count
   * @returns {Promise<Object>}
   */
  getUnreadCount: async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/count`, {
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ getUnreadCount fallback:', error.message);
      return { unread_count: 0 };
    }
  },

  /**
   * تعليم إشعار كمقروء
   * PATCH /api/notifications/{id}/read
   * @param {string|number} id - معرف الإشعار
   * @returns {Promise<Object>}
   */
  markNotificationRead: async (id) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ markNotificationRead error:', error.message);
      throw error;
    }
  },

  /**
   * تعليم كل الإشعارات كمقروءة
   * POST /api/notifications/read-all
   * @returns {Promise<Object>}
   */
  markAllNotificationsRead: async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "POST",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ markAllNotificationsRead error:', error.message);
      throw error;
    }
  },

  /**
   * حذف إشعار
   * DELETE /api/notifications/{id}
   * @param {string|number} id - معرف الإشعار
   * @returns {Promise<Object>}
   */
  deleteNotification: async (id) => {
    try {
      const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ deleteNotification error:', error.message);
      throw error;
    }
  },

  /**
   * حذف كل الإشعارات المقروءة
   * DELETE /api/notifications
   * @returns {Promise<Object>}
   */
  clearAllNotifications: async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      return await handleResponse(res);
    } catch (error) {
      console.warn('⚠️ clearAllNotifications error:', error.message);
      throw error;
    }
  },
};

export default api;
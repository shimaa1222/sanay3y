import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
// أضف Phone في السطر ده:
import { 
  Briefcase, Search, Filter, CheckCircle, XCircle, Clock,
  User, Mail, Phone, MapPin, Calendar, Wrench, Sparkles,
  Loader, RefreshCw, Check, X, Eye, AlertCircle,
  Shield, Star, ChevronDown
} from 'lucide-react';
const ProfessionRequestsPage = () => {
  const { darkMode } = useTheme();
  const [lang, setLang] = useState('ar');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [viewRequest, setViewRequest] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ id: null, type: '' });

  // Language
  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ar';
    setLang(savedLang);
    const handleLanguageChange = () => setLang(localStorage.getItem('language') || 'ar');
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  // Load requests
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminStats();
      setRequests(data.professionRequests || []);
    } catch {
      // Demo data + load from localStorage
      const local = JSON.parse(localStorage.getItem('profession_requests') || '[]');
      const demos = [
        { id: 1, craftsmanName: 'عادل الحداد', email: 'adel@example.com', requestedProfession: 'حداد', status: 'pending', date: '2024-01-10', city: 'القاهرة', district: 'شبرا', phone: '01005556677' },
        { id: 2, craftsmanName: 'حسن البناء', email: 'hassan@example.com', requestedProfession: 'مقاول بناء', status: 'pending', date: '2024-01-14', city: 'الجيزة', district: 'فيصل', phone: '01001112233' },
        { id: 3, craftsmanName: 'سامح التركيبات', email: 'sameh@example.com', requestedProfession: 'فني ستلايت', status: 'pending', date: '2024-02-20', city: 'القاهرة', district: 'المعادي', phone: '01009998877' },
        { id: 4, craftsmanName: 'محمود الدهان', email: 'mahmoud2@example.com', requestedProfession: 'ديكورات جبس', status: 'approved', date: '2023-12-01', city: 'الإسكندرية', district: 'سموحة', phone: '01007776655' },
        { id: 5, craftsmanName: 'كريم الأسواني', email: 'karim2@example.com', requestedProfession: 'تركيب رخام', status: 'rejected', date: '2024-01-05', city: 'القاهرة', district: 'مدينة نصر', phone: '01004443322' },
      ];
      setRequests([...demos, ...local.filter(r => !demos.find(d => d.id === r.id))]);
    }
    setLoading(false);
  };

  const handleApprove = (id) => {
    setConfirmAction({ id, type: 'approved' });
    setShowConfirmModal(true);
  };

  const handleReject = (id) => {
    setConfirmAction({ id, type: 'rejected' });
    setShowConfirmModal(true);
  };

  const confirmActionHandler = async () => {
    const { id, type } = confirmAction;
    setActionLoading(prev => ({ ...prev, [id]: type }));
    try {
      if (type === 'approved') {
        await api.approveProfession(id);
      } else {
        await api.rejectProfession(id);
      }
    } catch {}
    
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: type } : r));
    
    // Save to localStorage
    const updated = requests.map(r => r.id === id ? { ...r, status: type } : r);
    localStorage.setItem('profession_requests', JSON.stringify(updated));
    
    // If approved, add to approved list
    if (type === 'approved') {
      const request = requests.find(r => r.id === id);
      if (request) {
        const approved = JSON.parse(localStorage.getItem('approved_professions') || '[]');
        if (!approved.includes(request.requestedProfession)) {
          approved.push(request.requestedProfession);
          localStorage.setItem('approved_professions', JSON.stringify(approved));
        }
      }
    }

    setActionLoading(prev => ({ ...prev, [id]: null }));
    setShowConfirmModal(false);
    setConfirmAction({ id: null, type: '' });
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab !== r.status) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return r.craftsmanName?.toLowerCase().includes(q) || 
             r.requestedProfession?.toLowerCase().includes(q) ||
             r.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  // Translations
  const t = {
    title: lang === 'ar' ? 'طلبات المهن الجديدة' : 'New Profession Requests',
    pending: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
    approved: lang === 'ar' ? 'موافق' : 'Approved',
    rejected: lang === 'ar' ? 'مرفوض' : 'Rejected',
    search: lang === 'ar' ? 'بحث عن حرفي أو مهنة...' : 'Search craftsman or profession...',
    refresh: lang === 'ar' ? 'تحديث' : 'Refresh',
    approve: lang === 'ar' ? 'قبول' : 'Approve',
    reject: lang === 'ar' ? 'رفض' : 'Reject',
    confirmApprove: lang === 'ar' ? 'تأكيد الموافقة' : 'Confirm Approval',
    confirmReject: lang === 'ar' ? 'تأكيد الرفض' : 'Confirm Rejection',
    confirmApproveText: (name, profession) => lang === 'ar' ? `هل أنت متأكد من الموافقة على مهنة "${profession}" للحرفي ${name}؟` : `Approve "${profession}" for ${name}?`,
    confirmRejectText: (name, profession) => lang === 'ar' ? `هل أنت متأكد من رفض مهنة "${profession}" للحرفي ${name}؟` : `Reject "${profession}" for ${name}?`,
    confirm: lang === 'ar' ? 'تأكيد' : 'Confirm',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    noRequests: lang === 'ar' ? 'لا توجد طلبات في هذا القسم' : 'No requests in this section',
    loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
    statusPending: lang === 'ar' ? 'قيد الانتظار' : 'Pending',
    statusApproved: lang === 'ar' ? 'تمت الموافقة' : 'Approved',
    statusRejected: lang === 'ar' ? 'مرفوض' : 'Rejected',
    viewDetails: lang === 'ar' ? 'عرض التفاصيل' : 'View Details',
    details: lang === 'ar' ? 'تفاصيل الطلب' : 'Request Details',
    craftsman: lang === 'ar' ? 'الحرفي' : 'Craftsman',
    profession: lang === 'ar' ? 'المهنة المطلوبة' : 'Requested Profession',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email',
    phone: lang === 'ar' ? 'الهاتف' : 'Phone',
    location: lang === 'ar' ? 'الموقع' : 'Location',
    date: lang === 'ar' ? 'التاريخ' : 'Date',
    close: lang === 'ar' ? 'إغلاق' : 'Close',
  };

  // Dynamic colors
  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const headerBg = darkMode ? '#0a0f1a' : '#0f172a';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const textSecondary = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#ffffff';

  const getStatusStyle = (status) => {
    if (status === 'approved') return { bg: 'rgba(5,150,105,0.1)', color: '#059669', label: t.statusApproved, icon: <CheckCircle size={16} /> };
    if (status === 'rejected') return { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', label: t.statusRejected, icon: <XCircle size={16} /> };
    return { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: t.statusPending, icon: <Clock size={16} /> };
  };

  const confirmRequest = confirmAction.id ? requests.find(r => r.id === confirmAction.id) : null;

  return (
    <div style={{ background: bgColor, minHeight: '100vh', fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        .animate-fade-in-up { animation: fadeInUp 0.5s ease forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
        .delay-100 { animation-delay: 0.1s; } .delay-200 { animation-delay: 0.2s; }
        
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-2px); }
        
        .table-row { transition: all 0.2s ease; }
        .table-row:hover { background: ${darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc'}; }
        
        .skeleton { background: linear-gradient(90deg, ${darkMode ? '#334155' : '#e2e8f0'} 25%, ${darkMode ? '#1e293b' : '#f1f5f9'} 50%, ${darkMode ? '#334155' : '#e2e8f0'} 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        
        @media (max-width: 768px) {
          .filters-bar { flex-direction: column; }
          .desktop-only { display: none; }
        }
      `}</style>

      {/* Header */}
      <div style={{ background: headerBg, color: 'white', padding: '20px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>{t.title}</h1>
                <p style={{ opacity: 0.7, fontSize: '0.8rem', margin: '2px 0 0' }}>
                  {pendingCount > 0 && <span style={{ color: '#fbbf24' }}>{pendingCount} {t.pending}</span>}
                </p>
              </div>
            </div>
            <button onClick={loadRequests} disabled={loading}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', cursor: 'pointer', color: 'white', fontSize: '0.8rem', fontWeight: 600, fontFamily: "'Cairo', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />{t.refresh}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        
        {/* Search */}
        <div className="animate-fade-in-up filters-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: textSecondary }} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.search}
              style={{ width: '100%', padding: '10px 16px 10px 40px', border: `2px solid ${borderColor}`, borderRadius: '10px', fontSize: '0.9rem', outline: 'none', background: inputBg, color: textColor, fontFamily: "'Cairo', sans-serif", textAlign: 'right' }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="animate-fade-in-up delay-100" style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: cardBg, padding: '6px', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
          {[
            { id: 'pending', label: t.pending, count: pendingCount, color: '#f59e0b' },
            { id: 'approved', label: t.approved, count: approvedCount, color: '#059669' },
            { id: 'rejected', label: t.rejected, count: rejectedCount, color: '#dc2626' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem', fontFamily: "'Cairo', sans-serif", transition: 'all 0.3s ease',
                background: activeTab === tab.id ? tab.color : 'transparent',
                color: activeTab === tab.id ? 'white' : textColor,
              }}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="animate-fade-in-up delay-200" style={{ background: cardBg, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${borderColor}`, boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px' }}>
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ borderRadius: '10px', height: '50px', marginBottom: '8px' }} />)}
              </div>
            ) : filteredRequests.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: darkMode ? '#0f172a' : '#f8fafc', borderBottom: `2px solid ${borderColor}` }}>
                    <th style={thStyle}>{t.craftsman}</th>
                    <th style={thStyle}>{t.profession}</th>
                    <th style={thStyle} className="desktop-only">{t.location}</th>
                    <th style={thStyle} className="desktop-only">{t.date}</th>
                    <th style={thStyle}>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th style={thStyle}>{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req, index) => {
                    const statusStyle = getStatusStyle(req.status);
                    return (
                      <tr key={req.id} className="table-row" style={{ borderBottom: `1px solid ${borderColor}`, animationDelay: `${index * 0.05}s` }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                              {req.craftsmanName?.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: textColor, fontSize: '0.9rem' }}>{req.craftsmanName}</div>
                              <div style={{ fontSize: '0.75rem', color: textSecondary }}>{req.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                            <Briefcase size={14} />{req.requestedProfession}
                          </span>
                        </td>
                        <td style={tdStyle} className="desktop-only">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}><MapPin size={12} />{req.city} {req.district}</span>
                        </td>
                        <td style={tdStyle} className="desktop-only">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}><Calendar size={12} />{req.date}</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                            {statusStyle.icon}{statusStyle.label}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => setViewRequest(req)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Eye size={14} />
                            </button>
                            {req.status === 'pending' && (
                              <>
                                <button onClick={() => handleApprove(req.id)} disabled={actionLoading[req.id]}
                                  style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: actionLoading[req.id] ? 0.5 : 1 }}>
                                  {actionLoading[req.id] === 'approved' ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
                                </button>
                                <button onClick={() => handleReject(req.id)} disabled={actionLoading[req.id]}
                                  style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(220,38,38,0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: actionLoading[req.id] ? 0.5 : 1 }}>
                                  {actionLoading[req.id] === 'rejected' ? <Loader size={14} className="animate-spin" /> : <X size={14} />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: textSecondary }}>
                <Briefcase size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>{t.noRequests}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {viewRequest && (
        <div onClick={() => setViewRequest(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ background: cardBg, borderRadius: '16px', padding: '28px', maxWidth: '450px', width: '100%', border: `1px solid ${borderColor}`, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: textColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} style={{ color: '#8b5cf6' }} />{t.details}
              </h2>
              <button onClick={() => setViewRequest(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>{viewRequest.craftsmanName?.charAt(0)}</div>
              <div>
                <div style={{ fontWeight: 700, color: textColor }}>{viewRequest.craftsmanName}</div>
                <div style={{ color: '#8b5cf6', fontWeight: 500, fontSize: '0.85rem' }}>{viewRequest.requestedProfession}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: <Mail size={14} />, label: t.email, value: viewRequest.email },
                { icon: <Phone size={14} />, label: t.phone, value: viewRequest.phone || '-' },
                { icon: <MapPin size={14} />, label: t.location, value: `${viewRequest.city || ''} ${viewRequest.district || ''}` },
                { icon: <Calendar size={14} />, label: t.date, value: viewRequest.date },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${borderColor}`, fontSize: '0.85rem' }}>
                  <span style={{ color: textSecondary, display: 'flex', alignItems: 'center', gap: '6px' }}>{item.icon}{item.label}</span>
                  <span style={{ fontWeight: 600, color: textColor }}>{item.value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setViewRequest(null)} style={{ width: '100%', marginTop: '18px', padding: '10px', borderRadius: '10px', border: `1px solid ${borderColor}`, background: 'transparent', cursor: 'pointer', color: textColor, fontWeight: 600, fontSize: '0.85rem', fontFamily: "'Cairo', sans-serif" }}>{t.close}</button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmRequest && (
        <div onClick={() => setShowConfirmModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div className="animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ background: cardBg, borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', textAlign: 'center', border: `1px solid ${borderColor}`, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: confirmAction.type === 'approved' ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              {confirmAction.type === 'approved' ? <CheckCircle size={26} color="#059669" /> : <XCircle size={26} color="#dc2626" />}
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: textColor, marginBottom: '6px' }}>
              {confirmAction.type === 'approved' ? t.confirmApprove : t.confirmReject}
            </h2>
            <p style={{ color: textSecondary, marginBottom: '20px', fontSize: '0.85rem' }}>
              {confirmAction.type === 'approved' 
                ? t.confirmApproveText(confirmRequest.craftsmanName, confirmRequest.requestedProfession)
                : t.confirmRejectText(confirmRequest.craftsmanName, confirmRequest.requestedProfession)}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={confirmActionHandler} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: "'Cairo', sans-serif", background: confirmAction.type === 'approved' ? '#059669' : '#dc2626', color: 'white' }}>{t.confirm}</button>
              <button onClick={() => setShowConfirmModal(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: `1px solid ${borderColor}`, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: "'Cairo', sans-serif", background: 'transparent', color: textColor }}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: '14px 16px', textAlign: 'right', fontSize: '0.8rem',
  fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
  letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0',
};

const tdStyle = {
  padding: '12px 16px', fontSize: '0.85rem', color: '#64748b',
  borderBottom: '1px solid #f1f5f9',
};

export default ProfessionRequestsPage;
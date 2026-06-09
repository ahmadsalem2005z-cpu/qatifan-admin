import { useState, useEffect } from "react";

// ── Global styles ─────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=IBM+Plex+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{direction:rtl;font-family:'Tajawal',sans-serif;background:#050505;color:#f8fafc}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:#050505}
  ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:none}}
  .anim{animation:fadeUp .4s ease both}
`;

const C = {
  bg:"#050505", surf:"#0f172a", surf2:"#1e293b",
  border:"#334155", accent:"#8b5cf6", accentSoft:"#2e1065",
  gold:"#fbbf24", goldSoft:"#452000",
  green:"#10b981", red:"#ef4444",
  text:"#f8fafc", muted:"#94a3b8", dim:"#64748b",
};

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem("admin_token")}`,
  'Content-Type': 'application/json'
});

function Card({ children, style={} }) {
  return <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:16, padding:"20px", ...style }}>{children}</div>;
}

function Btn({ children, onClick, variant="primary", small, style={} }) {
  const v = {
    primary:{background:C.accent,color:"#fff"},
    green:{background:C.green,color:"#fff"},
    red:{background:"transparent",color:C.red,border:`1px solid ${C.red}50`},
    ghost:{background:"transparent",color:C.text,border:`1px solid ${C.border}`},
  };
  return (
    <button onClick={onClick} style={{ ...v[variant], borderRadius:8, cursor:"pointer", border:v[variant].border||"none", fontFamily:"'Tajawal',sans-serif", fontWeight:600, padding:small?"6px 12px":"8px 16px", fontSize: small?11:13, transition:"all .2s", ...style }}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type="text", placeholder, textarea, rows=3 }) {
  const s = { width:"100%", padding:"10px 14px", background:C.surf2, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, fontFamily:"'Tajawal',sans-serif", outline:"none", resize: textarea ? "vertical" : undefined };
  return (
    <div style={{marginBottom:16}}>
      {label && <label style={{display:"block", fontSize:12, color:C.dim, marginBottom:6}}>{label}</label>}
      {textarea ? <textarea style={{...s, minHeight:rows*30}} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} /> : <input style={s} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} />}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  const s = { width:"100%", padding:"10px 14px", background:C.surf2, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, fontFamily:"'Tajawal',sans-serif", outline:"none" };
  return (
    <div style={{marginBottom:16}}>
      {label && <label style={{display:"block", fontSize:12, color:C.dim, marginBottom:6}}>{label}</label>}
      <select style={s} value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError("الرجاء إدخال اسم المستخدم وكلمة المرور"); return; }
    setLoading(true); setError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/auth/admin-login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        onLogin();
      } else setError(data.error || "بيانات الإدارة غير صحيحة"); 
    } catch (err) { setError("تعذر الاتصال بالسيرفر"); }
    setLoading(false);
  };

  return (
    <div className="anim" style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
      <style>{G}</style>
      <Card style={{width:"100%", maxWidth:360, textAlign:"center", padding:"40px 20px"}}>
        <div style={{fontSize:54, marginBottom:16}}>👑</div>
        <h2 style={{color:C.text, marginBottom:8}}>بوابة الإدارة</h2>
        <p style={{color:C.muted, fontSize:13, marginBottom:24}}>صندوق عائلة قطيفان - وصول مقيد</p>
        {error && <div style={{color:C.red, fontSize:12, marginBottom:16, background:`${C.red}20`, padding:8, borderRadius:8}}>{error}</div>}
        <Input type="text" placeholder="اسم مستخدم الإدارة" value={username} onChange={setUsername} />
        <Input type="password" placeholder="كلمة المرور" value={password} onChange={setPassword} />
        <Btn onClick={handleLogin} style={{width:"100%", marginTop:10}} variant="primary">{loading ? "⏳ جاري الدخول..." : "تسجيل الدخول"}</Btn>
      </Card>
    </div>
  );
}

function RequestsManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const typeLabels = { loan: "سلفة", help: "مساعدة", condolence: "عزاء", wedding: "نقوط زواج" };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        const res = await fetch(`${apiUrl}/api/admin/requests`, { headers: getAuthHeaders() });
        if(res.ok) setRequests(await res.json());
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`هل أنت متأكد من ${newStatus === 'approved' ? 'قبول' : 'رفض'} هذا الطلب؟`)) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/requests/${id}/status`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ status: newStatus }) });
      if (res.ok) setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
      else alert("تعذر تحديث الحالة");
    } catch (error) { alert("تعذر الاتصال"); }
  };

  if (loading) return <div style={{textAlign:"center", padding:20, color:C.muted}}>⏳ جاري تحميل الطلبات...</div>;

  return (
    <Card style={{marginTop: 24, borderTop:`3px solid ${C.accent}`}}>
      <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>طلبات الأعضاء (سلف ومساعدات)</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {requests.map(req => (
          <div key={req.id} style={{ background: C.surf2, padding: 16, borderRadius: 12, border: `1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{fontSize:20}}>{req.type==='wedding'?'💍':req.type==='condolence'?'🕊️':req.type==='help'?'🤝':'💰'}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize:14, color:C.text }}>{req.full_name}</h3>
                  <div style={{fontSize:11, color:C.muted}}>{req.phone_number}</div>
                </div>
              </div>
              <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: req.status === 'pending' ? `${C.gold}20` : req.status === 'approved' ? `${C.green}20` : `${C.red}20`, color: req.status === 'pending' ? C.gold : req.status === 'approved' ? C.green : C.red, border: `1px solid ${req.status === 'pending' ? C.gold : req.status === 'approved' ? C.green : C.red}40` }}>
                {req.status === 'pending' ? 'قيد الانتظار' : req.status === 'approved' ? 'تم القبول' : 'مرفوض'}
              </span>
            </div>
            <div style={{ fontSize: 12, color: C.text, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background:C.surf, padding:12, borderRadius:8 }}>
              <div><span style={{color:C.muted}}>النوع:</span> {typeLabels[req.type]}</div>
              <div><span style={{color:C.muted}}>المبلغ:</span> <strong style={{color:C.gold}}>{Number(req.amount).toLocaleString("en-US")} د.أ</strong></div>
              <div><span style={{color:C.muted}}>تاريخ الحاجة:</span> {req.timing || "غير محدد"}</div>
              {req.type === 'loan' && <div><span style={{color:C.muted}}>السداد:</span> {req.repayment_plan} أشهر</div>}
              <div style={{ gridColumn: "1 / -1", lineHeight: 1.6 }}><span style={{color:C.muted}}>السبب:</span> {req.reason}</div>
            </div>
            {req.status === 'pending' && (
              <div style={{ display: "flex", gap: 10, marginTop:4 }}>
                <Btn onClick={() => handleUpdateStatus(req.id, 'approved')} variant="green" style={{flex:1}}>✅ قبول الطلب</Btn>
                <Btn onClick={() => handleUpdateStatus(req.id, 'rejected')} variant="red" style={{flex:1}}>❌ رفض الطلب</Btn>
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding:20 }}>لا توجد طلبات لعرضها</div>}
      </div>
    </Card>
  );
}

function AdminDashboard({ onLogout }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [membersList, setMembersList] = useState([]);
  
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expCategory, setExpCategory] = useState("wedding");
  const [expLabel, setExpLabel] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [isSubmittingExp, setIsSubmittingExp] = useState(false);

  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annType, setAnnType] = useState("update");
  const [annTarget, setAnnTarget] = useState("");
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        
        // Fetch Receipts
        const resReceipts = await fetch(`${apiUrl}/api/admin/pending-receipts`, { headers: getAuthHeaders() });
        if (resReceipts.ok) setPendingReceipts(await resReceipts.json());
        
        // Fetch Members for Dropdown
        const resMembers = await fetch(`${apiUrl}/api/admin/members/list`, { headers: getAuthHeaders() });
        if (resMembers.ok) setMembersList(await resMembers.json());

      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const handleApprove = async (receiptId) => {
    if (!window.confirm("هل أنت متأكد من اعتماد هذا الإيصال؟")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/approve-receipt/${receiptId}`, { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) { setPendingReceipts(prev => prev.filter(rec => rec.id !== receiptId)); alert("✅ تم الاعتماد بنجاح!"); } 
      else alert("❌ حدث خطأ أثناء الاعتماد");
    } catch (err) { alert("تعذر الاتصال بالسيرفر"); }
  };

  const handleRejectReceipt = async (receiptId) => {
    if (!window.confirm("هل أنت متأكد من رفض هذا الإيصال؟")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/reject-receipt/${receiptId}`, { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) { setPendingReceipts(prev => prev.filter(rec => rec.id !== receiptId)); alert("✅ تم الرفض!"); } 
      else alert("❌ حدث خطأ");
    } catch (err) { alert("تعذر الاتصال بالسيرفر"); }
  };

  const handleAddExpense = async () => {
    if (!expLabel || !expAmount) return alert("⚠️ الرجاء تعبئة الوصف والمبلغ");
    setIsSubmittingExp(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/expenses`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ category: expCategory, label: expLabel, amount: expAmount }) });
      if (res.ok) { alert("✅ تم تسجيل المصروف!"); setExpLabel(""); setExpAmount(""); setShowExpenseForm(false); } 
      else alert("❌ خطأ أثناء التسجيل");
    } catch (err) { alert("تعذر الاتصال"); }
    setIsSubmittingExp(false);
  };

  const handleAddAnnouncement = async () => {
    if (!annTitle || !annBody) return alert("⚠️ جميع الحقول مطلوبة");
    setIsSubmittingAnn(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const payload = { title: annTitle, body: annBody, type: annType, member_id: annTarget || null };
      const res = await fetch(`${apiUrl}/api/admin/announcements`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
      if (res.ok) { alert("✅ تم نشر الإعلان!"); setAnnTitle(""); setAnnBody(""); setAnnTarget(""); setShowAnnForm(false); } 
      else alert("❌ خطأ في النشر");
    } catch (err) { alert("تعذر الاتصال"); }
    setIsSubmittingAnn(false);
  };

  const downloadReport = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/reports/members`, { headers: getAuthHeaders() });
      const data = await res.json();
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
      csvContent += "اسم العضو,رقم الجوال,حالة العضوية,إجمالي المدفوعات (د.أ),الذمة المستحقة (د.أ),تاريخ آخر دفعة\n";
      data.forEach(row => { csvContent += `${row.full_name},${row.phone_number},${row.membership_status === 'active' ? 'نشط' : 'غير نشط'},${row.total_paid},${row.total_debt},${row.last_paid_date ? new Date(row.last_paid_date).toLocaleDateString('en-GB') : 'غير محدد'}\n`; });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", "تقرير_صندوق_قطيفان.csv");
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (err) { alert("تعذر تحميل التقرير"); }
  };

  return (
    <div className="anim" style={{padding:"20px", maxWidth:800, margin:"0 auto"}}>
      <style>{G}</style>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, paddingBottom:16, borderBottom:`1px solid ${C.border}`, flexWrap: "wrap", gap: "10px"}}>
        <div>
          <h1 style={{fontSize:20, color:C.accent}}>لوحة تحكم المدير</h1>
          <div style={{fontSize:12, color:C.muted, marginTop:4}}>مرحباً بك في مركز إدارة الصندوق</div>
        </div>
        <div style={{display:"flex", gap:10, flexWrap: "wrap"}}>
          <Btn onClick={downloadReport} variant="green">📥 تقرير الأعضاء</Btn>
          <Btn onClick={() => {setShowAnnForm(!showAnnForm); setShowExpenseForm(false);}} variant={showAnnForm ? "ghost" : "primary"}>{showAnnForm ? "إلغاء الإعلان" : "📣 نشر إعلان"}</Btn>
          <Btn onClick={() => {setShowExpenseForm(!showExpenseForm); setShowAnnForm(false);}} variant={showExpenseForm ? "ghost" : "primary"}>{showExpenseForm ? "إلغاء السحب" : "➖ سحب مصروف"}</Btn>
          <Btn onClick={onLogout} variant="red">خروج</Btn>
        </div>
      </header>

      {showAnnForm && (
        <Card style={{marginBottom:24, borderTop:`3px solid ${C.accent}`}} className="anim">
          <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>نشر إعلان جديد للأعضاء</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8, marginBottom:16}}>
            {[{id:'update',icon:'📢',label:'تحديث'}, {id:'meeting',icon:'📅',label:'اجتماع'}, {id:'honor',icon:'🏆',label:'تكريم'}, {id:'condolence',icon:'🕊️',label:'عزاء'}].map(t => (
              <div key={t.id} onClick={() => setAnnType(t.id)} style={{background:annType===t.id?C.accentSoft:C.surf2, border:`1px solid ${annType===t.id?C.accent:C.border}`, borderRadius:8, padding:10, textAlign:"center", cursor:"pointer", transition:"all .2s"}}>
                <div style={{fontSize:18, marginBottom:4}}>{t.icon}</div><div style={{fontSize:11, color:C.text}}>{t.label}</div>
              </div>
            ))}
          </div>
          <Input label="عنوان الإعلان *" placeholder="مثال: موعد اجتماع..." value={annTitle} onChange={setAnnTitle} />
          <Select label="إرسال الإعلان إلى:" value={annTarget} onChange={setAnnTarget} options={[
            {label: "جميع الأعضاء", value: ""},
            ...membersList.map(m => ({label: m.full_name, value: m.id}))
          ]} />
          <Input label="نص الإعلان *" placeholder="اكتب تفاصيل الإعلان هنا..." value={annBody} onChange={setAnnBody} textarea rows={4} />
          <Btn onClick={handleAddAnnouncement} style={{width:"100%"}} variant="primary">{isSubmittingAnn ? "⏳ جاري النشر..." : "✔️ نشر الإعلان الآن"}</Btn>
        </Card>
      )}

      {showExpenseForm && (
        <Card style={{marginBottom:24, borderTop:`3px solid ${C.accent}`}} className="anim">
          <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>تسجيل مصروف جديد</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16}}>
            <div onClick={() => setExpCategory("wedding")} style={{background:expCategory==="wedding"?C.accentSoft:C.surf2, border:`1px solid ${expCategory==="wedding"?C.accent:C.border}`, borderRadius:8, padding:12, textAlign:"center", cursor:"pointer", transition:"all .2s"}}>
              <div style={{fontSize:20, marginBottom:4}}>💍</div><div style={{fontSize:12, color:C.text}}>نقوط زواج</div>
            </div>
            <div onClick={() => setExpCategory("condolence")} style={{background:expCategory==="condolence"?C.surf2:C.surf2, border:`1px solid ${expCategory==="condolence"?"#94a3b8":C.border}`, borderRadius:8, padding:12, textAlign:"center", cursor:"pointer", transition:"all .2s"}}>
              <div style={{fontSize:20, marginBottom:4}}>🕊️</div><div style={{fontSize:12, color:C.text}}>مساعدة عزاء</div>
            </div>
          </div>
          <Input label="وصف المصروف *" placeholder="مثال: مساعدة زواج..." value={expLabel} onChange={setExpLabel} />
          <Input label="المبلغ (د.أ) *" type="number" placeholder="1000" value={expAmount} onChange={setExpAmount} />
          <Btn onClick={handleAddExpense} style={{width:"100%"}} variant="primary">{isSubmittingExp ? "⏳ جاري الخصم..." : "✔️ تأكيد السحب"}</Btn>
        </Card>
      )}

      <Card>
        <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>الإيصالات بانتظار الاعتماد (المراجعة)</div>
        {isLoading ? ( <div style={{textAlign:"center", padding:40, color:C.muted, fontSize:13}}>⏳ جاري جلب الإيصالات...</div> ) : pendingReceipts.length === 0 ? ( <div style={{textAlign:"center", padding:40, color:C.muted, fontSize:13}}>لا توجد إيصالات معلقة حالياً ✅</div> ) : (
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {pendingReceipts.map(rec => (
              <div key={rec.id} style={{background:C.surf2, borderRadius:12, padding:16, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16}}>
                <div style={{display:"flex", alignItems:"center", gap:16}}>
                  <div onClick={() => setSelectedImage(rec.image_url)} style={{width:50, height:50, background:C.border, borderRadius:8, cursor:"zoom-in", backgroundImage:`url(${rec.image_url})`, backgroundSize:'cover', backgroundPosition:'center', border:`1px solid ${C.muted}`}} />
                  <div>
                    <div style={{fontSize:14, fontWeight:700, color:C.text}}>{rec.full_name}</div>
                    <div style={{fontSize:11, color:C.muted, marginTop:4}}>النوع: <span style={{color:C.accent}}>{rec.for_month && rec.for_year ? `تغطية شهر ${rec.for_month} / ${rec.for_year}` : "تغطية تلقائية (الشهر التالي)"}</span></div>
                    <div style={{fontSize:10, color:C.dim, marginTop:2}}>{new Date(rec.date).toLocaleDateString('ar-JO')}</div>
                  </div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:12}}>
                  <div style={{fontSize:16, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace", color:C.gold, marginLeft:16}}>2 د.أ</div>
                  <Btn variant="green" onClick={() => handleApprove(rec.id)}>اعتماد</Btn>
                  <Btn variant="red" onClick={() => handleRejectReceipt(rec.id)}>رفض</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <RequestsManager />

      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, cursor:"zoom-out"}}>
          <img src={selectedImage} alt="Receipt" style={{maxWidth:"100%", maxHeight:"90vh", borderRadius:8, border:`2px solid ${C.border}`}} />
          <div style={{position:"absolute", top:20, right:20, color:"#fff", fontSize:14, background:"rgba(0,0,0,0.5)", padding:"8px 16px", borderRadius:20}}>اضغط للإغلاق ✕</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isAdminAuth, setIsAdminAuth] = useState(!!localStorage.getItem("admin_token"));
  return isAdminAuth ? <AdminDashboard onLogout={() => {localStorage.removeItem("admin_token"); setIsAdminAuth(false);}} /> : <AdminLogin onLogin={() => setIsAdminAuth(true)} />;
}
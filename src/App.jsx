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

// ── Design tokens (Admin Theme) ───────────────────────────────────────────
const C = {
  bg:"#050505", surf:"#0f172a", surf2:"#1e293b",
  border:"#334155", accent:"#8b5cf6", accentSoft:"#2e1065",
  gold:"#fbbf24", goldSoft:"#452000",
  green:"#10b981", red:"#ef4444",
  text:"#f8fafc", muted:"#94a3b8", dim:"#64748b",
};

// ── Components ────────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return (
    <div style={{
      background:C.surf, border:`1px solid ${C.border}`,
      borderRadius:16, padding:"20px", ...style
    }}>{children}</div>
  );
}

function Btn({ children, onClick, variant="primary", style={} }) {
  const v = {
    primary:{background:C.accent,color:"#fff"},
    green:{background:C.green,color:"#fff"},
    red:{background:"transparent",color:C.red,border:`1px solid ${C.red}50`},
    ghost:{background:"transparent",color:C.text,border:`1px solid ${C.border}`},
  };
  return (
    <button onClick={onClick} style={{
      ...v[variant], borderRadius:8, cursor:"pointer", border:v[variant].border||"none",
      fontFamily:"'Tajawal',sans-serif", fontWeight:600, padding:"8px 16px",
      fontSize: 13, transition:"all .2s", ...style,
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, type="text", placeholder }) {
  return (
    <div style={{marginBottom:16}}>
      <label style={{display:"block", fontSize:12, color:C.dim, marginBottom:6}}>{label}</label>
      <input 
        type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{
          width:"100%", padding:"10px 14px", background:C.surf2, border:`1px solid ${C.border}`,
          borderRadius:8, color:C.text, fontSize:13, fontFamily:"'Tajawal',sans-serif", outline:"none"
        }}
      />
    </div>
  );
}

// ── SCREENS ───────────────────────────────────────────────────────────────

// 1. Admin Login
function AdminLogin({ onLogin }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if(passcode === "2026") onLogin();
    else setError("رمز المرور غير صحيح");
  };

  return (
    <div className="anim" style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
      <style>{G}</style>
      <Card style={{width:"100%", maxWidth:360, textAlign:"center", padding:"40px 20px"}}>
        <div style={{fontSize:54, marginBottom:16}}>👑</div>
        <h2 style={{color:C.text, marginBottom:8}}>بوابة الإدارة</h2>
        <p style={{color:C.muted, fontSize:13, marginBottom:24}}>صندوق عائلة قطيفان - وصول مقيد</p>
        
        {error && <div style={{color:C.red, fontSize:12, marginBottom:16, background:`${C.red}20`, padding:8, borderRadius:8}}>{error}</div>}
        
        <input 
          type="password" placeholder="أدخل رمز المرور الإداري" 
          value={passcode} onChange={e=>setPasscode(e.target.value)}
          style={{width:"100%", padding:"12px", background:C.surf2, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, marginBottom:16, textAlign:"center", letterSpacing:4}}
        />
        <Btn onClick={handleLogin} style={{width:"100%", padding:"12px"}}>تسجيل الدخول</Btn>
      </Card>
    </div>
  );
}

// 2. Admin Dashboard
function AdminDashboard({ onLogout }) {
  const [selectedImage, setSelectedImage] = useState(null);
  
  // داتا الجداول
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // نماذج الإدخال
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expCategory, setExpCategory] = useState("wedding");
  const [expLabel, setExpLabel] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [isSubmittingExp, setIsSubmittingExp] = useState(false);

  const [showAnnounceForm, setShowAnnounceForm] = useState(false);
  const [annType, setAnnType] = useState("update");
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [isSubmittingAnn, setIsSubmittingAnn] = useState(false);

  const reqTypes = { loan: "سلفة", help: "مساعدة", condolence: "عزاء", wedding: "نقوط زواج" };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        
        // جلب الإيصالات والطلبات معاً
        const [receiptsRes, requestsRes] = await Promise.all([
          fetch(`${apiUrl}/api/admin/pending-receipts`),
          fetch(`${apiUrl}/api/admin/requests`)
        ]);

        if (receiptsRes.ok) setPendingReceipts(await receiptsRes.json());
        if (requestsRes.ok) {
          const reqs = await requestsRes.json();
          // تصفية الطلبات المعلقة فقط لعرضها
          setPendingRequests(reqs.filter(r => r.status === 'pending'));
        }
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Handlers ──

  const handleApproveReceipt = async (receiptId) => {
    if (!window.confirm("هل أنت متأكد من اعتماد هذا الإيصال؟")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/approve-receipt/${receiptId}`, { method: 'POST' });
      if (res.ok) {
        setPendingReceipts(prev => prev.filter(rec => rec.id !== receiptId));
        alert("✅ تم الاعتماد بنجاح!");
      } else alert("❌ حدث خطأ أثناء الاعتماد");
    } catch (err) { alert("تعذر الاتصال بالسيرفر"); }
  };

  const handleRejectReceipt = async (receiptId) => {
    if (!window.confirm("هل أنت متأكد من رفض الإيصال؟")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/reject-receipt/${receiptId}`, { method: 'POST' });
      if (res.ok) {
        setPendingReceipts(prev => prev.filter(rec => rec.id !== receiptId));
        alert("تم رفض الإيصال.");
      }
    } catch (err) { alert("خطأ في الاتصال"); }
  };

  const handleUpdateRequest = async (reqId, status) => {
    const actionStr = status === 'approved' ? "الموافقة على" : "رفض";
    if (!window.confirm(`هل أنت متأكد من ${actionStr} هذا الطلب؟`)) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/requests/${reqId}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setPendingRequests(prev => prev.filter(r => r.id !== reqId));
        alert(`✅ تم ${actionStr} الطلب وتحديث الحسابات بنجاح.`);
      } else alert("❌ تعذر التحديث");
    } catch (err) { alert("خطأ في الاتصال"); }
  };

  const handleAddExpense = async () => {
    if (!expLabel || !expAmount) return alert("⚠️ الرجاء تعبئة الوصف والمبلغ");
    setIsSubmittingExp(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: expCategory, label: expLabel, amount: expAmount })
      });
      if (res.ok) {
        alert("✅ تم تسجيل المصروف!");
        setExpLabel(""); setExpAmount(""); setShowExpenseForm(false);
      }
    } catch (err) { alert("خطأ"); }
    setIsSubmittingExp(false);
  };

  const handleAddAnnouncement = async () => {
    if (!annTitle || !annBody) return alert("⚠️ الرجاء تعبئة عنوان ومحتوى الإعلان");
    setIsSubmittingAnn(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: annTitle, body: annBody, type: annType })
      });
      if (res.ok) {
        alert("📣 تم نشر الإعلان بنجاح وسيظهر فوراً لدى الأعضاء!");
        setAnnTitle(""); setAnnBody(""); setShowAnnounceForm(false);
      }
    } catch (err) { alert("خطأ في النشر"); }
    setIsSubmittingAnn(false);
  };

  const downloadReport = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/reports/members`);
      const data = await res.json();
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
      csvContent += "اسم العضو,رقم الجوال,حالة العضوية,إجمالي المدفوعات (د.أ),الذمة المستحقة (د.أ)\n";
      data.forEach(row => {
        csvContent += `${row.full_name},${row.phone_number},${row.membership_status === 'active' ? 'نشط' : 'غير نشط'},${row.total_paid},${row.total_debt}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "تقرير_صندوق_قطيفان.csv");
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (err) { alert("حدث خطأ"); }
  };

  return (
    <div className="anim" style={{padding:"20px", maxWidth:800, margin:"0 auto"}}>
      <style>{G}</style>
      
      {/* ── Header ── */}
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, paddingBottom:16, borderBottom:`1px solid ${C.border}`, flexWrap: "wrap", gap: "10px"}}>
        <div>
          <h1 style={{fontSize:20, color:C.accent}}>لوحة تحكم المدير</h1>
          <div style={{fontSize:12, color:C.muted, marginTop:4}}>مرحباً بك في مركز إدارة الصندوق</div>
        </div>
        <div style={{display:"flex", gap:10, flexWrap: "wrap"}}>
          <Btn onClick={downloadReport} variant="green">📥 تقرير الأعضاء</Btn>
          <Btn onClick={() => { setShowAnnounceForm(!showAnnounceForm); setShowExpenseForm(false); }} variant={showAnnounceForm ? "ghost" : "primary"}>
            {showAnnounceForm ? "إلغاء" : "📣 نشر إعلان"}
          </Btn>
          <Btn onClick={() => { setShowExpenseForm(!showExpenseForm); setShowAnnounceForm(false); }} variant={showExpenseForm ? "ghost" : "primary"}>
            {showExpenseForm ? "إلغاء" : "➖ سحب مصروف"}
          </Btn>
          <Btn onClick={onLogout} variant="red">خروج</Btn>
        </div>
      </header>

      {/* ── Forms ── */}
      {showAnnounceForm && (
        <Card style={{marginBottom:24, borderTop:`3px solid ${C.accent}`}} className="anim">
          <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>نشر إعلان جديد للعائلة</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8, marginBottom:16}}>
            {[["update","📢 تحديث"], ["meeting","📅 اجتماع"], ["honor","🏆 تكريم"], ["condolence","🕊️ عزاء"]].map(([type, label]) => (
              <div key={type} onClick={() => setAnnType(type)} style={{background:annType===type?C.accentSoft:C.surf2, border:`1px solid ${annType===type?C.accent:C.border}`, borderRadius:8, padding:10, textAlign:"center", cursor:"pointer", transition:"all .2s"}}>
                <div style={{fontSize:12, color:C.text}}>{label}</div>
              </div>
            ))}
          </div>
          <Input label="عنوان الإعلان *" placeholder="مثال: ترحيب بالنسخة الجديدة..." value={annTitle} onChange={setAnnTitle} />
          <div style={{marginBottom:16}}>
            <label style={{display:"block", fontSize:12, color:C.dim, marginBottom:6}}>تفاصيل الإعلان *</label>
            <textarea placeholder="اكتب نص الإعلان هنا..." value={annBody} onChange={e => setAnnBody(e.target.value)} style={{width:"100%", padding:"10px 14px", background:C.surf2, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13, fontFamily:"'Tajawal',sans-serif", outline:"none", minHeight:100, resize:"vertical"}} />
          </div>
          <Btn onClick={handleAddAnnouncement} style={{width:"100%"}} variant="primary">
            {isSubmittingAnn ? "⏳ جاري النشر..." : "✔️ نشر الإعلان فوراً"}
          </Btn>
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
          <Btn onClick={handleAddExpense} style={{width:"100%"}} variant="primary">
            {isSubmittingExp ? "⏳ جاري الخصم..." : "✔️ تأكيد سحب المبلغ"}
          </Btn>
        </Card>
      )}

      {/* ── Pending Receipts ── */}
      <Card style={{marginBottom:24}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
          <div style={{fontSize:15, fontWeight:700, color:C.text}}>الإيصالات بانتظار الاعتماد</div>
          <div style={{fontSize:12, color:C.muted}}>{pendingReceipts.length} معلق</div>
        </div>
        
        {isLoading ? (
          <div style={{textAlign:"center", padding:20, color:C.muted, fontSize:13}}>⏳ جاري التحميل...</div>
        ) : pendingReceipts.length === 0 ? (
          <div style={{textAlign:"center", padding:30, background:C.surf2, borderRadius:12, color:C.dim, fontSize:13}}>لا توجد إيصالات معلقة حالياً ✅</div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {pendingReceipts.map(rec => (
              <div key={rec.id} style={{background:C.surf2, borderRadius:12, padding:16, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16}}>
                <div style={{display:"flex", alignItems:"center", gap:16}}>
                  <div onClick={() => setSelectedImage(rec.image)} style={{width:50, height:50, background:C.border, borderRadius:8, cursor:"zoom-in", backgroundImage:`url(${rec.image})`, backgroundSize:'cover', backgroundPosition:'center', border:`1px solid ${C.muted}`}} title="تكبير" />
                  <div>
                    <div style={{fontSize:14, fontWeight:700, color:C.text}}>{rec.memberName}</div>
                    <div style={{fontSize:11, color:C.muted, marginTop:4}}>النوع: <span style={{color:C.accent}}>{rec.months}</span></div>
                    <div style={{fontSize:10, color:C.dim, marginTop:2}}>{rec.date}</div>
                  </div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:12}}>
                  <div style={{fontSize:16, fontWeight:700, fontFamily:"'IBM Plex Mono',monospace", color:C.gold, marginLeft:16}}>{Number(rec.amount).toLocaleString("en-US")} د.أ</div>
                  <Btn variant="green" onClick={() => handleApproveReceipt(rec.id)}>اعتماد</Btn>
                  <Btn variant="red" onClick={() => handleRejectReceipt(rec.id)}>رفض</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Pending Requests (السلف والمساعدات) ── */}
      <Card>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
          <div style={{fontSize:15, fontWeight:700, color:C.text}}>طلبات الأعضاء (سلف ومساعدات)</div>
          <div style={{fontSize:12, color:C.muted}}>{pendingRequests.length} معلق</div>
        </div>

        {isLoading ? (
          <div style={{textAlign:"center", padding:20, color:C.muted, fontSize:13}}>⏳ جاري التحميل...</div>
        ) : pendingRequests.length === 0 ? (
          <div style={{textAlign:"center", padding:30, background:C.surf2, borderRadius:12, color:C.dim, fontSize:13}}>لا توجد طلبات لعرضها ✅</div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {pendingRequests.map(req => (
              <div key={req.id} style={{background:C.surf2, borderRadius:12, padding:16}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12}}>
                  <div>
                    <div style={{fontSize:14, fontWeight:700, color:C.text}}>{req.full_name}</div>
                    <div style={{fontSize:11, color:C.muted, marginTop:2}}>{req.phone_number}</div>
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontSize:16, fontWeight:700, color:C.accent, fontFamily:"'IBM Plex Mono',monospace"}}>{Number(req.amount).toLocaleString("en-US")} د.أ</div>
                    <div style={{fontSize:11, color:C.gold, marginTop:2}}>نوع الطلب: {reqTypes[req.type] || req.type}</div>
                  </div>
                </div>
                
                <div style={{background:C.surf, padding:10, borderRadius:8, marginBottom:12}}>
                  <div style={{fontSize:11, color:C.muted, marginBottom:4}}>السبب:</div>
                  <div style={{fontSize:13, color:C.text}}>{req.reason}</div>
                  {req.timing && <div style={{fontSize:11, color:C.dim, marginTop:8}}>🕒 متوقع في: {req.timing}</div>}
                  {req.type === 'loan' && <div style={{fontSize:11, color:C.dim, marginTop:4}}>🗓️ خطة السداد: {req.repayment_plan} أشهر</div>}
                </div>

                <div style={{display:"flex", gap:10, justifyContent:"flex-end"}}>
                  <Btn variant="green" onClick={() => handleUpdateRequest(req.id, 'approved')}>موافقة وصرف</Btn>
                  <Btn variant="red" onClick={() => handleUpdateRequest(req.id, 'rejected')}>رفض</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal للصورة */}
      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, cursor:"zoom-out"}}>
          <img src={selectedImage} alt="Receipt" style={{maxWidth:"100%", maxHeight:"90vh", borderRadius:8, border:`2px solid ${C.border}`}} />
          <div style={{position:"absolute", top:20, right:20, color:"#fff", fontSize:14, background:"rgba(0,0,0,0.5)", padding:"8px 16px", borderRadius:20}}>اضغط في أي مكان للإغلاق ✕</div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  if (!isAdminAuth) {
    return <AdminLogin onLogin={() => setIsAdminAuth(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsAdminAuth(false)} />;
}
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
  .tab-btn { background:none; border:none; color:#64748b; font-family:'Tajawal',sans-serif; font-size:15px; font-weight:700; padding:10px 20px; cursor:pointer; border-bottom:3px solid transparent; transition:all .2s; }
  .tab-btn.active { color:#8b5cf6; border-bottom:3px solid #8b5cf6; }
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

// ── Helper components ─────────────────────────────────────────────────────
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

// ⬇️ هذا هو المكون المفقود الذي تسبب في انهيار الشاشة! تم إضافته الآن.
function Tag({ label, color=C.accent }) {
  return (
    <span style={{
      background:`${color}20`, color, border:`1px solid ${color}40`,
      borderRadius:6, padding:"2px 10px", fontSize:11, fontWeight:700,
    }}>{label}</span>
  );
}

// ── شاشة تسجيل الدخول ──
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

// ── شاشة إدارة الأعضاء ──
function MembersManager() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);

  const [formData, setFormData] = useState({ full_name: "", phone_number: "", family_branch: "", total_debt: 0, last_paid_date: "" });
  const [bulkData, setBulkData] = useState({ amount: "", branch: "all", status: "all" });

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/members`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
      } else {
        setMembers([]);
      }
    } catch (err) { 
      console.error(err); 
      setMembers([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleSaveMember = async () => {
    if (!formData.full_name || !formData.phone_number) return alert("الاسم ورقم الجوال مطلوبان");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const method = currentMember ? 'PUT' : 'POST';
      const url = currentMember ? `${apiUrl}/api/admin/members/${currentMember.id}` : `${apiUrl}/api/admin/members`;
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert(currentMember ? "تم التحديث بنجاح" : "تمت الإضافة بنجاح");
        setShowAddEdit(false);
        fetchMembers();
      } else alert("حدث خطأ أثناء الحفظ");
    } catch (err) { alert("تعذر الاتصال بالسيرفر"); }
  };

  const handleToggleArchive = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    if (!window.confirm(`هل أنت متأكد من ${newStatus === 'archived' ? 'أرشفة' : 'تفعيل'} هذا العضو؟`)) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/members/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchMembers();
      else alert("حدث خطأ");
    } catch (err) { alert("تعذر الاتصال"); }
  };

  const handleApplyBulkDues = async () => {
    if (!bulkData.amount || isNaN(bulkData.amount)) return alert("أدخل مبلغاً صحيحاً");
    if (!window.confirm(`هل أنت متأكد من تطبيق ذمة بقيمة ${bulkData.amount} د.أ على الفئة المحددة؟`)) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/members/bulk-dues`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bulkData)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowBulk(false);
        fetchMembers();
      } else alert("حدث خطأ");
    } catch (err) { alert("تعذر الاتصال"); }
  };

  const uniqueBranches = ["all", ...new Set(members.map(m => m.family_branch).filter(Boolean))];

  const filteredMembers = members.filter(m => {
    const name = m.full_name || "";
    const phone = m.phone_number || "";
    const branch = m.family_branch || "";
    const q = searchQuery || "";

    const matchQuery = name.includes(q) || phone.includes(q);
    const matchBranch = filterBranch === "all" || branch === filterBranch;
    const debtVal = parseFloat(m.total_debt || 0);
    const matchStatus = filterStatus === "all" ? true : filterStatus === "paid" ? debtVal <= 0 : debtVal > 0;
    
    return matchQuery && matchBranch && matchStatus;
  });

  return (
    <div className="anim">
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10}}>
        <Btn onClick={() => { setCurrentMember(null); setFormData({ full_name: "", phone_number: "", family_branch: "الفرع الأول", total_debt: 0, last_paid_date: "" }); setShowAddEdit(true); }} variant="green">+ إضافة عضو جديد</Btn>
        <Btn onClick={() => setShowBulk(true)} variant="primary">⚖️ تعديل الذمم الجماعي</Btn>
      </div>

      <Card style={{marginBottom:20}}>
        <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>محرك البحث المتقدم (فلترة الأعضاء)</div>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:12}}>
          <Input placeholder="بحث بالاسم أو رقم الجوال..." value={searchQuery} onChange={setSearchQuery} />
          <Select value={filterBranch} onChange={setFilterBranch} options={uniqueBranches.map(b => ({ label: b==='all' ? 'جميع الفروع' : b, value: b }))} />
          <Select value={filterStatus} onChange={setFilterStatus} options={[ {label:"جميع الحالات المالية", value:"all"}, {label:"ملتزم بالسداد", value:"paid"}, {label:"متأخر / متعثر", value:"debt"} ]} />
        </div>
      </Card>

      <Card>
        <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>دليل الأعضاء ({filteredMembers.length})</div>
        {loading ? <div style={{textAlign:"center", color:C.muted}}>⏳ جاري التحميل...</div> : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%", textAlign:"right", borderCollapse:"collapse", minWidth:700}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${C.border}`, color:C.muted, fontSize:12}}>
                  <th style={{padding:12}}>الاسم ورقم الجوال</th>
                  <th style={{padding:12}}>الفرع / الفخذ</th>
                  <th style={{padding:12}}>الذمة المستحقة</th>
                  <th style={{padding:12}}>حالة العضوية</th>
                  <th style={{padding:12}}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => (
                  <tr key={m.id} style={{borderBottom:`1px solid ${C.border}50`, opacity: m.membership_status==='archived' ? 0.5 : 1}}>
                    <td style={{padding:12}}>
                      <div style={{fontWeight:700, color:C.text, fontSize:13}}>{m.full_name || "عضو بدون اسم"}</div>
                      <div style={{fontSize:11, color:C.dim}}>{m.phone_number || "---"}</div>
                    </td>
                    <td style={{padding:12, fontSize:13}}>{m.family_branch || "غير محدد"}</td>
                    <td style={{padding:12}}>
                      <span style={{color: parseFloat(m.total_debt||0)>0 ? C.red : C.green, fontWeight:700, fontFamily:"'IBM Plex Mono'"}}>
                        {Number(m.total_debt||0).toLocaleString()} د.أ
                      </span>
                    </td>
                    <td style={{padding:12}}>
                      <Tag label={m.membership_status==='archived' ? 'مؤرشف' : 'نشط'} color={m.membership_status==='archived' ? C.muted : C.green} />
                    </td>
                    <td style={{padding:12, display:"flex", gap:8}}>
                      <Btn small variant="ghost" onClick={() => { setCurrentMember(m); setFormData({ full_name: m.full_name || "", phone_number: m.phone_number || "", family_branch: m.family_branch || "غير محدد", total_debt: m.total_debt || 0, last_paid_date: m.last_paid_date ? m.last_paid_date.split('T')[0] : "" }); setShowAddEdit(true); }}>تعديل</Btn>
                      <Btn small variant={m.membership_status==='archived' ? "green" : "red"} onClick={() => handleToggleArchive(m.id, m.membership_status)}>
                        {m.membership_status==='archived' ? 'تنشيط' : 'أرشفة'}
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showAddEdit && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20}}>
          <Card style={{width:"100%", maxWidth:400}}>
            <h3 style={{marginBottom:16, color:C.text}}>{currentMember ? "تعديل بيانات العضو" : "إضافة عضو جديد"}</h3>
            <Input label="الاسم الرباعي" value={formData.full_name} onChange={v => setFormData({...formData, full_name:v})} />
            <Input label="رقم الجوال" value={formData.phone_number} onChange={v => setFormData({...formData, phone_number:v})} />
            <Input label="الفرع / الفخذ" placeholder="مثال: الفرع الأول" value={formData.family_branch} onChange={v => setFormData({...formData, family_branch:v})} />
            <Input label="الذمة المستحقة الحالية (دينار)" type="number" value={formData.total_debt} onChange={v => setFormData({...formData, total_debt:v})} />
            <Input label="تاريخ آخر تغطية (اختياري)" type="date" value={formData.last_paid_date} onChange={v => setFormData({...formData, last_paid_date:v})} />
            <div style={{display:"flex", gap:10, marginTop:20}}>
              <Btn style={{flex:1}} onClick={handleSaveMember}>حفظ البيانات</Btn>
              <Btn style={{flex:1}} variant="ghost" onClick={() => setShowAddEdit(false)}>إلغاء</Btn>
            </div>
          </Card>
        </div>
      )}

      {showBulk && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20}}>
          <Card style={{width:"100%", maxWidth:400}}>
            <h3 style={{marginBottom:8, color:C.text}}>تعديل الذمم الجماعي</h3>
            <p style={{fontSize:12, color:C.muted, marginBottom:16}}>سيتم إضافة هذا المبلغ كذمة (دين) على جميع الأعضاء الذين ينطبق عليهم الفلتر.</p>
            <Input label="المبلغ المراد إضافته (د.أ)" type="number" value={bulkData.amount} onChange={v => setBulkData({...bulkData, amount:v})} />
            <Select label="تطبيق على فرع:" value={bulkData.branch} onChange={v => setBulkData({...bulkData, branch:v})} options={uniqueBranches.map(b => ({ label: b==='all' ? 'جميع الفروع' : b, value: b }))} />
            <Select label="تطبيق على حالة:" value={bulkData.status} onChange={v => setBulkData({...bulkData, status:v})} options={[ {label:"جميع الأعضاء", value:"all"}, {label:"الأعضاء النشطين فقط", value:"active"} ]} />
            <div style={{display:"flex", gap:10, marginTop:20}}>
              <Btn style={{flex:1}} variant="primary" onClick={handleApplyBulkDues}>تأكيد التطبيق</Btn>
              <Btn style={{flex:1}} variant="ghost" onClick={() => setShowBulk(false)}>إلغاء</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── العمليات اليومية ──
function OperationsManager() {
  const [requests, setRequests] = useState([]);
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const [selectedImage, setSelectedImage] = useState(null);
  const typeLabels = { loan: "سلفة", help: "مساعدة", condolence: "عزاء", wedding: "نقوط زواج" };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
        const [reqs, recs, mems] = await Promise.all([
          fetch(`${apiUrl}/api/admin/requests`, { headers: getAuthHeaders() }).then(r=>r.json()).catch(()=>([])),
          fetch(`${apiUrl}/api/admin/pending-receipts`, { headers: getAuthHeaders() }).then(r=>r.json()).catch(()=>([])),
          fetch(`${apiUrl}/api/admin/members/list`, { headers: getAuthHeaders() }).then(r=>r.json()).catch(()=>([]))
        ]);
        setRequests(Array.isArray(reqs) ? reqs : []);
        setPendingReceipts(Array.isArray(recs) ? recs : []);
        setMembersList(Array.isArray(mems) ? mems : []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`هل أنت متأكد من ${newStatus === 'approved' ? 'قبول' : 'رفض'} هذا الطلب؟`)) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/requests/${id}/status`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ status: newStatus }) });
      if (res.ok) setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    } catch (error) { alert("تعذر الاتصال"); }
  };

  const handleApprove = async (receiptId) => {
    const amountStr = window.prompt("كم قيمة الدفعة المودعة في هذا الإيصال؟ (كل 2 دينار = 1 شهر تغطية)", "2");
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return alert("❌ الرجاء إدخال مبلغ صحيح");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/approve-receipt/${receiptId}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ amount }) });
      if (res.ok) { setPendingReceipts(prev => prev.filter(rec => rec.id !== receiptId)); alert("✅ تم الاعتماد!"); }
    } catch (err) { alert("تعذر الاتصال"); }
  };

  const handleRejectReceipt = async (receiptId) => {
    if (!window.confirm("هل أنت متأكد من رفض الإيصال؟")) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/reject-receipt/${receiptId}`, { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) setPendingReceipts(prev => prev.filter(rec => rec.id !== receiptId));
    } catch (err) {}
  };

  const handleAddExpense = async () => {
    if (!expLabel || !expAmount) return alert("⚠️ الرجاء تعبئة الوصف والمبلغ");
    setIsSubmittingExp(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/expenses`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ category: expCategory, label: expLabel, amount: expAmount }) });
      if (res.ok) { alert("✅ تم التسجيل!"); setShowExpenseForm(false); }
    } catch (err) {} setIsSubmittingExp(false);
  };

  const handleAddAnnouncement = async () => {
    if (!annTitle || !annBody) return alert("⚠️ جميع الحقول مطلوبة");
    setIsSubmittingAnn(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const payload = { title: annTitle, body: annBody, type: annType, member_id: annTarget || null };
      const res = await fetch(`${apiUrl}/api/admin/announcements`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
      if (res.ok) { alert("✅ تم النشر!"); setShowAnnForm(false); }
    } catch (err) {} setIsSubmittingAnn(false);
  };

  if (loading) return <div style={{textAlign:"center", color:C.muted}}>⏳ جاري التحميل...</div>;

  return (
    <div className="anim">
      <div style={{display:"flex", gap:10, marginBottom:20, flexWrap:"wrap"}}>
        <Btn onClick={() => {setShowAnnForm(!showAnnForm); setShowExpenseForm(false);}} variant={showAnnForm ? "ghost" : "primary"}>{showAnnForm ? "إلغاء الإعلان" : "📣 نشر إعلان"}</Btn>
        <Btn onClick={() => {setShowExpenseForm(!showExpenseForm); setShowAnnForm(false);}} variant={showExpenseForm ? "ghost" : "primary"}>{showExpenseForm ? "إلغاء السحب" : "➖ سحب مصروف"}</Btn>
      </div>

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
          <Input label="عنوان الإعلان *" value={annTitle} onChange={setAnnTitle} />
          <Select label="إرسال الإعلان إلى:" value={annTarget} onChange={setAnnTarget} options={[{label: "جميع الأعضاء", value: ""}, ...membersList.map(m => ({label: m.full_name || "بدون اسم", value: m.id}))]} />
          <Input label="نص الإعلان *" value={annBody} onChange={setAnnBody} textarea rows={4} />
          <Btn onClick={handleAddAnnouncement} style={{width:"100%"}}>{isSubmittingAnn ? "⏳ جاري النشر..." : "✔️ نشر الإعلان"}</Btn>
        </Card>
      )}

      {showExpenseForm && (
        <Card style={{marginBottom:24, borderTop:`3px solid ${C.accent}`}} className="anim">
          <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>تسجيل مصروف جديد</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16}}>
            <div onClick={() => setExpCategory("wedding")} style={{background:expCategory==="wedding"?C.accentSoft:C.surf2, border:`1px solid ${expCategory==="wedding"?C.accent:C.border}`, borderRadius:8, padding:12, textAlign:"center", cursor:"pointer"}}>
              <div style={{fontSize:20, marginBottom:4}}>💍</div><div style={{fontSize:12, color:C.text}}>نقوط زواج</div>
            </div>
            <div onClick={() => setExpCategory("condolence")} style={{background:expCategory==="condolence"?C.surf2:C.surf2, border:`1px solid ${expCategory==="condolence"?"#94a3b8":C.border}`, borderRadius:8, padding:12, textAlign:"center", cursor:"pointer"}}>
              <div style={{fontSize:20, marginBottom:4}}>🕊️</div><div style={{fontSize:12, color:C.text}}>مساعدة عزاء</div>
            </div>
          </div>
          <Input label="وصف المصروف *" value={expLabel} onChange={setExpLabel} />
          <Input label="المبلغ (د.أ) *" type="number" value={expAmount} onChange={setExpAmount} />
          <Btn onClick={handleAddExpense} style={{width:"100%"}}>{isSubmittingExp ? "⏳..." : "✔️ تأكيد السحب"}</Btn>
        </Card>
      )}

      <Card style={{marginBottom:24}}>
        <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>الإيصالات بانتظار الاعتماد (المراجعة)</div>
        {pendingReceipts.length === 0 ? ( <div style={{textAlign:"center", padding:20, color:C.muted, fontSize:13}}>لا توجد إيصالات معلقة ✅</div> ) : (
          <div style={{display:"flex", flexDirection:"column", gap:12}}>
            {pendingReceipts.map(rec => (
              <div key={rec.id} style={{background:C.surf2, borderRadius:12, padding:16, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16}}>
                <div style={{display:"flex", alignItems:"center", gap:16}}>
                  <div onClick={() => setSelectedImage(rec.image_url)} style={{width:50, height:50, background:C.border, borderRadius:8, cursor:"zoom-in", backgroundImage:`url(${rec.image_url})`, backgroundSize:'cover', backgroundPosition:'center'}} />
                  <div>
                    <div style={{fontSize:14, fontWeight:700, color:C.text}}>{rec.full_name || "بدون اسم"}</div>
                    <div style={{fontSize:11, color:C.muted, marginTop:4}}>النوع: <span style={{color:C.accent}}>{rec.for_month && rec.for_year ? `تغطية شهر ${rec.for_month} / ${rec.for_year}` : "تغطية تلقائية (الشهر التالي)"}</span></div>
                    <div style={{fontSize:10, color:C.dim, marginTop:2}}>{new Date(rec.date).toLocaleDateString('ar-JO')}</div>
                  </div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:12}}>
                  <Btn variant="green" onClick={() => handleApprove(rec.id)}>اعتماد الدفعة</Btn>
                  <Btn variant="red" onClick={() => handleRejectReceipt(rec.id)}>رفض</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ borderTop:`3px solid ${C.accent}`}}>
        <div style={{fontSize:15, fontWeight:700, marginBottom:16, color:C.text}}>طلبات الأعضاء (سلف ومساعدات)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {requests.map(req => (
            <div key={req.id} style={{ background: C.surf2, padding: 16, borderRadius: 12, border: `1px solid ${C.border}`}}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{fontSize:20}}>{req.type==='wedding'?'💍':req.type==='condolence'?'🕊️':req.type==='help'?'🤝':'💰'}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize:14, color:C.text }}>{req.full_name || "بدون اسم"}</h3>
                    <div style={{fontSize:11, color:C.muted}}>{req.phone_number || "---"}</div>
                  </div>
                </div>
                <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: req.status === 'pending' ? `${C.gold}20` : req.status === 'approved' ? `${C.green}20` : `${C.red}20`, color: req.status === 'pending' ? C.gold : req.status === 'approved' ? C.green : C.red }}>
                  {req.status === 'pending' ? 'قيد الانتظار' : req.status === 'approved' ? 'تم القبول' : 'مرفوض'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.text, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background:C.surf, padding:12, borderRadius:8 }}>
                <div><span style={{color:C.muted}}>النوع:</span> {typeLabels[req.type]}</div>
                <div><span style={{color:C.muted}}>المبلغ:</span> <strong style={{color:C.gold}}>{Number(req.amount).toLocaleString()} د.أ</strong></div>
                <div><span style={{color:C.muted}}>تاريخ الحاجة:</span> {req.timing || "غير محدد"}</div>
                {req.type === 'loan' && <div><span style={{color:C.muted}}>السداد:</span> {req.repayment_plan} أشهر</div>}
                <div style={{ gridColumn: "1 / -1", lineHeight: 1.6 }}><span style={{color:C.muted}}>السبب:</span> {req.reason}</div>
              </div>
              {req.status === 'pending' && (
                <div style={{ display: "flex", gap: 10, marginTop:12 }}>
                  <Btn onClick={() => handleUpdateStatus(req.id, 'approved')} variant="green" style={{flex:1}}>✅ قبول الطلب</Btn>
                  <Btn onClick={() => handleUpdateStatus(req.id, 'rejected')} variant="red" style={{flex:1}}>❌ رفض الطلب</Btn>
                </div>
              )}
            </div>
          ))}
          {requests.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding:20 }}>لا توجد طلبات لعرضها</div>}
        </div>
      </Card>

      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, cursor:"zoom-out"}}>
          <img src={selectedImage} alt="Receipt" style={{maxWidth:"100%", maxHeight:"90vh", borderRadius:8, border:`2px solid ${C.border}`}} />
          <div style={{position:"absolute", top:20, right:20, color:"#fff", fontSize:14, background:"rgba(0,0,0,0.5)", padding:"8px 16px", borderRadius:20}}>اضغط للإغلاق ✕</div>
        </div>
      )}
    </div>
  );
}

// ── الواجهة الرئيسية للمدير ──
function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("operations");

  const downloadReport = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/reports/members`, { headers: getAuthHeaders() });
      
      if (!res.ok) {
        alert("تعذر تحميل التقرير (تأكد من الصلاحيات)");
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        alert("صيغة التقرير غير صحيحة");
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
      csvContent += "اسم العضو,رقم الجوال,الفرع,حالة العضوية,إجمالي المدفوعات (د.أ),الذمة المستحقة (د.أ),تاريخ آخر دفعة\n";
      
      data.forEach(row => { 
        const formattedPhone = `="${row.phone_number || ''}"`;
        const memberStatus = row.membership_status === 'active' ? 'نشط' : 'مؤرشف';
        const lastPaid = row.last_paid_date ? new Date(row.last_paid_date).toLocaleDateString('en-GB') : 'غير محدد';
        csvContent += `${row.full_name || 'بدون اسم'},${formattedPhone},${row.family_branch || 'غير محدد'},${memberStatus},${row.total_paid || 0},${row.total_debt || 0},${lastPaid}\n`; 
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", "تقرير_صندوق_قطيفان.csv");
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (err) { alert("تعذر تحميل التقرير"); }
  };

  return (
    <div className="anim" style={{padding:"20px", maxWidth:900, margin:"0 auto"}}>
      <style>{G}</style>
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap: "wrap", gap: "10px"}}>
        <div>
          <h1 style={{fontSize:22, color:C.accent}}>لوحة تحكم المدير</h1>
          <div style={{fontSize:12, color:C.muted, marginTop:4}}>مركز إدارة صندوق عائلة قطيفان</div>
        </div>
        <div style={{display:"flex", gap:10, flexWrap: "wrap"}}>
          <Btn onClick={downloadReport} variant="green">📥 تحميل التقرير (CSV)</Btn>
          <Btn onClick={onLogout} variant="red">تسجيل الخروج</Btn>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div style={{display:"flex", gap:10, borderBottom:`1px solid ${C.border}`, marginBottom:24}}>
        <button className={`tab-btn ${activeTab === "operations" ? "active" : ""}`} onClick={() => setActiveTab("operations")}>العمليات اليومية</button>
        <button className={`tab-btn ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>إدارة الأعضاء والذمم</button>
      </div>

      {activeTab === "operations" ? <OperationsManager /> : <MembersManager />}
      
    </div>
  );
}

export default function App() {
  const [isAdminAuth, setIsAdminAuth] = useState(!!localStorage.getItem("admin_token"));
  return isAdminAuth ? <AdminDashboard onLogout={() => {localStorage.removeItem("admin_token"); setIsAdminAuth(false);}} /> : <AdminLogin onLogin={() => setIsAdminAuth(true)} />;
}
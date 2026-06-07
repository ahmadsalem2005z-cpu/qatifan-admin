import { useState, useEffect } from "react";

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

// دالة مساعدة لإرسال التوكن تلقائياً
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem("admin_token")}`,
  'Content-Type': 'application/json'
});

function Card({ children, style={} }) {
  return <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:16, padding:"20px", ...style }}>{children}</div>;
}

function Btn({ children, onClick, variant="primary", style={} }) {
  const v = {
    primary:{background:C.accent,color:"#fff"},
    green:{background:C.green,color:"#fff"},
    red:{background:"transparent",color:C.red,border:`1px solid ${C.red}50`},
    ghost:{background:"transparent",color:C.text,border:`1px solid ${C.border}`},
  };
  return (
    <button onClick={onClick} style={{ ...v[variant], borderRadius:8, cursor:"pointer", border:v[variant].border||"none", fontFamily:"'Tajawal',sans-serif", fontWeight:600, padding:"8px 16px", fontSize: 13, transition:"all .2s", ...style }}>
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

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/auth/admin-login`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ username, password }) 
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        onLogin();
      } else setError(data.error || "بيانات الإدارة غير صحيحة"); 
    } catch (err) { setError("تعذر الاتصال بالسيرفر"); }
  };

  return (
    <div className="anim" style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20}}>
      <style>{G}</style>
      <Card style={{width:"100%", maxWidth:360, textAlign:"center"}}>
        <h2>بوابة الإدارة</h2>
        {error && <div style={{color:C.red, margin:10}}>{error}</div>}
        <Input placeholder="اسم المستخدم" value={username} onChange={setUsername} />
        <Input type="password" placeholder="كلمة المرور" value={password} onChange={setPassword} />
        <Btn onClick={handleLogin} style={{width:"100%"}}>تسجيل الدخول</Btn>
      </Card>
    </div>
  );
}

function RequestsManager() {
  const [requests, setRequests] = useState([]);
  
  useEffect(() => {
    const fetchRequests = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/requests`, { headers: getAuthHeaders() });
      if(res.ok) setRequests(await res.json());
    };
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
    await fetch(`${apiUrl}/api/admin/requests/${id}/status`, { 
        method: 'POST', 
        headers: getAuthHeaders(), 
        body: JSON.stringify({ status: newStatus }) 
    });
    window.location.reload();
  };

  return (
    <Card style={{marginTop: 24}}>
      <div style={{fontWeight:700, marginBottom:16}}>طلبات الأعضاء</div>
      {requests.map(req => (
        <div key={req.id} style={{background:C.surf2, padding:10, marginBottom:10, borderRadius:8}}>
          <div>{req.full_name} - {req.amount} د.أ</div>
          <Btn onClick={() => handleUpdateStatus(req.id, 'approved')} variant="green" small>قبول</Btn>
          <Btn onClick={() => handleUpdateStatus(req.id, 'rejected')} variant="red" small>رفض</Btn>
        </div>
      ))}
    </Card>
  );
}

function AdminDashboard({ onLogout }) {
  const [pendingReceipts, setPendingReceipts] = useState([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
      const res = await fetch(`${apiUrl}/api/admin/pending-receipts`, { headers: getAuthHeaders() });
      if (res.ok) setPendingReceipts(await res.json());
    };
    fetchReceipts();
  }, []);

  const handleApprove = async (id) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://qatifan-fund-production.up.railway.app';
    await fetch(`${apiUrl}/api/admin/approve-receipt/${id}`, { method: 'POST', headers: getAuthHeaders() });
    window.location.reload();
  };

  return (
    <div style={{padding:20, maxWidth:800, margin:"0 auto"}}>
      <Btn onClick={onLogout} variant="red">خروج</Btn>
      <Card style={{marginTop:20}}>
        <h3>الإيصالات المعلقة</h3>
        {pendingReceipts.map(r => (
            <div key={r.id} style={{display:'flex', justifyContent:'space-between', padding:10}}>
                <span>{r.memberName}</span>
                <Btn variant="green" onClick={() => handleApprove(r.id)}>اعتماد</Btn>
            </div>
        ))}
      </Card>
      <RequestsManager />
    </div>
  );
}

export default function App() {
  const [isAdminAuth, setIsAdminAuth] = useState(!!localStorage.getItem("admin_token"));
  return isAdminAuth ? <AdminDashboard onLogout={() => {localStorage.removeItem("admin_token"); setIsAdminAuth(false);}} /> : <AdminLogin onLogin={() => setIsAdminAuth(true)} />;
}
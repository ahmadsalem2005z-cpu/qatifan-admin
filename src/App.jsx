import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

// ── Inline styles for RTL + custom fonts ──────────────────────────────
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=IBM+Plex+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { direction: rtl; font-family: 'Tajawal', sans-serif; background: #0b0f1a; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #0b0f1a; }
  ::-webkit-scrollbar-thumb { background: #2a3a5c; border-radius: 3px; }
  .mono { font-family: 'IBM Plex Mono', monospace; }
  @keyframes fadeSlide { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes pulse-ring { 0%,100% { box-shadow: 0 0 0 0 rgba(99,179,237,0.4); } 50% { box-shadow: 0 0 0 8px rgba(99,179,237,0); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  .anim-in { animation: fadeSlide 0.35s ease both; }
  .pulse-badge { animation: pulse-ring 2s ease-in-out infinite; }
  .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
`;

// ── Design tokens ──────────────────────────────────────────────────────
const C = {
  bg:        "#0b0f1a",
  surface:   "#111827",
  surface2:  "#1a2235",
  border:    "#1e2d44",
  accent:    "#3b82f6",
  accentSoft:"#1d3557",
  gold:      "#f59e0b",
  goldSoft:  "#2d2006",
  green:     "#10b981",
  greenSoft: "#052e16",
  red:       "#ef4444",
  redSoft:   "#2d0a0a",
  purple:    "#a78bfa",
  purpleSoft:"#1e1040",
  text:      "#e2e8f0",
  textMuted: "#64748b",
  textDim:   "#94a3b8",
};

// ── Mock data ──────────────────────────────────────────────────────────
const MOCK = {
  balance:        47850.00,
  pendingDebt:    12400.00,
  membersCount:   28,
  paidThisMonth:  19,
  totalThisMonth: 24,

  expensesByCategory: [
    { name: "عزاء",     value: 8200,  color: "#a78bfa" },
    { name: "نقوط زواج",value: 14500, color: "#f59e0b" },
    { name: "طوارئ",    value: 3100,  color: "#ef4444" },
    { name: "إدارية",   value: 1250,  color: "#3b82f6" },
  ],

  monthlyTrend: [
    { month: "يناير", إيداع: 2800, صرف: 1200 },
    { month: "فبراير", إيداع: 3100, صرف: 2800 },
    { month: "مارس",  إيداع: 2750, صرف: 900  },
    { month: "أبريل", إيداع: 3200, صرف: 3500 },
    { month: "مايو",  إيداع: 2900, صرف: 1800 },
    { month: "يونيو", إيداع: 3050, صرف: 2200 },
  ],

  overdueMembers: [
    { id:"1", name:"أحمد محمد القطيفان",   months:3, amount:450, phone:"+966501111111", lastPaid:"مارس 2025" },
    { id:"2", name:"سلطان علي القطيفان",   months:2, amount:300, phone:"+966502222222", lastPaid:"أبريل 2025" },
    { id:"3", name:"محمد ناصر القطيفان",   months:5, amount:750, phone:"+966503333333", lastPaid:"يناير 2025" },
    { id:"4", name:"خالد سعد القطيفان",    months:1, amount:150, phone:"+966504444444", lastPaid:"مايو 2025" },
    { id:"5", name:"عبدالرحمن عمر القطيفان",months:4,amount:600, phone:"+966505555555", lastPaid:"فبراير 2025" },
    { id:"6", name:"يوسف حسن القطيفان",    months:2, amount:300, phone:"+966506666666", lastPaid:"أبريل 2025" },
  ],

  recentTransactions: [
    { id:"t1", type:"deposit",    label:"دفعة — عبدالله القطيفان",   amount:150, date:"اليوم، 11:30" },
    { id:"t2", type:"withdrawal", label:"نقوط زواج — سالم القطيفان", amount:1000, date:"أمس، 14:00" },
    { id:"t3", type:"deposit",    label:"دفعة — فاطمة القطيفان",     amount:150, date:"أمس، 09:15" },
    { id:"t4", type:"withdrawal", label:"عزاء — عائلة المطيري",       amount:500, date:"22 يونيو" },
    { id:"t5", type:"deposit",    label:"دفعة — سعد القطيفان",        amount:300, date:"21 يونيو" },
  ],
};

// ══════════════════════════════════════════════════════════════
//  COMPONENTS
// ══════════════════════════════════════════════════════════════

function StatCard({ label, value, sub, color = C.accent, icon, mono = true }) {
  return (
    <div className="card-hover" style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: "24px 28px",
      borderTop: `3px solid ${color}`,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{label}</span>
        <span style={{
          fontSize: 22, width: 40, height: 40, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: `${color}18`, borderRadius: 10,
        }}>{icon}</span>
      </div>
      <div style={{
        fontSize: 26, fontWeight: 800,
        fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined,
        color: C.text, letterSpacing: mono ? "0.02em" : undefined,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.textDim }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{title}</h2>
        {sub && <p style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function Btn({ children, variant="primary", onClick, small, disabled, style={} }) {
  const base = {
    border: "none", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Tajawal', sans-serif", fontWeight: 600,
    padding: small ? "7px 14px" : "11px 22px",
    fontSize: small ? 13 : 14,
    transition: "all 0.18s ease",
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
  const variants = {
    primary:  { background: C.accent,  color: "#fff" },
    gold:     { background: C.gold,    color: "#000" },
    ghost:    { background: "transparent", color: C.textDim, border: `1px solid ${C.border}` },
    danger:   { background: C.red,     color: "#fff" },
    green:    { background: C.green,   color: "#fff" },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Badge({ label, color = C.accent }) {
  return (
    <span style={{
      background: `${color}20`, color, border: `1px solid ${color}40`,
      borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700,
    }}>{label}</span>
  );
}

function Tag({ n }) {
  if (n >= 4) return <Badge label={`${n} أشهر`} color={C.red} />;
  if (n >= 2) return <Badge label={`${n} أشهر`} color={C.gold} />;
  return <Badge label="شهر واحد" color={C.accent} />;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, backdropFilter:"blur(4px)",
    }}>
      <div className="anim-in" style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 20, padding: 32, width: "min(520px,95vw)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{
            background:"none", border:"none", color:C.textMuted,
            cursor:"pointer", fontSize:20, lineHeight:1,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type="text", placeholder, textarea, rows=3 }) {
  const inputStyle = {
    width:"100%", padding:"11px 14px",
    background: C.surface2, border:`1px solid ${C.border}`,
    borderRadius:10, color:C.text, fontSize:14,
    fontFamily:"'Tajawal', sans-serif", outline:"none",
    resize: textarea ? "vertical" : undefined,
  };
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:"block", fontSize:13, color:C.textDim, marginBottom:6, fontWeight:500 }}>{label}</label>}
      {textarea
        ? <textarea style={{ ...inputStyle, minHeight: rows*44 }} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} />
        : <input style={inputStyle} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:"block", fontSize:13, color:C.textDim, marginBottom:6, fontWeight:500 }}>{label}</label>}
      <select
        value={value} onChange={e=>onChange(e.target.value)}
        style={{
          width:"100%", padding:"11px 14px",
          background: C.surface2, border:`1px solid ${C.border}`,
          borderRadius:10, color:C.text, fontSize:14,
          fontFamily:"'Tajawal', sans-serif", outline:"none", cursor:"pointer",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SCREENS
// ══════════════════════════════════════════════════════════════

// 1. Dashboard ─────────────────────────────────────────────────
function Dashboard() {
  const paidPct = Math.round((MOCK.paidThisMonth / MOCK.totalThisMonth) * 100);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 16px" }}>
        <div style={{ color:C.textDim, fontSize:12, marginBottom:6 }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ color:p.color, fontSize:13, fontWeight:600 }}>
            {p.name}: {p.value.toLocaleString("ar-SA")} ر.س
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }} className="anim-in">

      {/* KPI Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16 }}>
        <StatCard label="رصيد الصندوق البنكي" value={`${MOCK.balance.toLocaleString("ar-SA")} ر.س`}
          icon="🏦" color={C.green} sub="محدّث: اليوم 11:30" />
        <StatCard label="إجمالي الذمم المستحقة" value={`${MOCK.pendingDebt.toLocaleString("ar-SA")} ر.س`}
          icon="⚠️" color={C.gold} sub={`على ${MOCK.overdueMembers.length} أعضاء`} />
        <StatCard label="أعضاء الصندوق" value={MOCK.membersCount} icon="👥" color={C.purple}
          sub="28 عضو نشط" mono={false} />
        <StatCard label="الإجمالي المصروف" value="27,050 ر.س"
          icon="📤" color={C.red} sub="منذ بداية العام" />
      </div>

      {/* Compliance meter */}
      <div style={{
        background: C.surface, border:`1px solid ${C.border}`, borderRadius:16,
        padding:"24px 28px",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:C.text }}>نسبة الالتزام — يونيو 2025</div>
            <div style={{ fontSize:12, color:C.textMuted, marginTop:3 }}>
              {MOCK.paidThisMonth} من أصل {MOCK.totalThisMonth} عضواً سدّدوا هذا الشهر
            </div>
          </div>
          <div style={{
            fontSize:28, fontWeight:800, color: paidPct>=80 ? C.green : paidPct>=60 ? C.gold : C.red,
            fontFamily:"'IBM Plex Mono', monospace",
          }}>{paidPct}%</div>
        </div>
        <div style={{ height:10, background:C.surface2, borderRadius:99 }}>
          <div style={{
            width:`${paidPct}%`, height:"100%",
            background: paidPct>=80 ? C.green : paidPct>=60 ? C.gold : C.red,
            borderRadius:99, transition:"width 1s ease",
          }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:11, color:C.textMuted }}>
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Expense donut */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <SectionHeader title="توزيع المصروفات" sub="إجمالي منذ بداية العام" />
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={MOCK.expensesByCategory} cx="50%" cy="45%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={4}>
                {MOCK.expensesByCategory.map((e,i) => (
                  <Cell key={i} fill={e.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={v=>[`${v.toLocaleString("ar-SA")} ر.س`]} />
              <Legend
                formatter={(v, entry) => (
                  <span style={{ color: C.textDim, fontSize: 12 }}>{v}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly bar */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <SectionHeader title="الحركة المالية الشهرية" sub="الإيداعات مقابل المصروفات" />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={MOCK.monthlyTrend} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fill:C.textMuted, fontSize:11, fontFamily:"Tajawal" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:C.textMuted, fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="إيداع"  fill={C.green}  radius={[6,6,0,0]} />
              <Bar dataKey="صرف"   fill={C.purple} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
        <SectionHeader title="آخر المعاملات" />
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {MOCK.recentTransactions.map((tx, i) => (
            <div key={tx.id} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"12px 14px", borderRadius:10,
              background: i%2===0 ? C.surface2 : "transparent",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{
                  width:32, height:32, borderRadius:8, display:"flex",
                  alignItems:"center", justifyContent:"center", fontSize:16,
                  background: tx.type==="deposit" ? C.greenSoft : C.purpleSoft,
                }}>
                  {tx.type==="deposit" ? "⬇️" : "⬆️"}
                </span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{tx.label}</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>{tx.date}</div>
                </div>
              </div>
              <div style={{
                fontFamily:"'IBM Plex Mono', monospace", fontWeight:700, fontSize:14,
                color: tx.type==="deposit" ? C.green : C.purple,
              }}>
                {tx.type==="deposit" ? "+" : "-"}{tx.amount.toLocaleString("ar-SA")} ر.س
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. Dues & Reminders ──────────────────────────────────────────
function DuesScreen() {
  const [members, setMembers]         = useState(MOCK.overdueMembers);
  const [payModal, setPayModal]       = useState(null);  // member obj
  const [reminderModal, setReminderModal] = useState(null);
  const [payAmount, setPayAmount]     = useState("");
  const [payRef, setPayRef]           = useState("");
  const [toast, setToast]             = useState(null);
  const [search, setSearch]           = useState("");

  const showToast = (msg, color = C.green) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePay = () => {
    if (!payAmount || isNaN(payAmount)) return showToast("أدخل مبلغاً صحيحاً", C.red);
    setMembers(m => m.filter(x => x.id !== payModal.id));
    setPayModal(null);
    showToast(`✅ تم تسجيل دفعة ${Number(payAmount).toLocaleString("ar-SA")} ر.س لـ ${payModal.name}`);
  };

  const handleReminder = () => {
    setReminderModal(null);
    showToast(`📱 تم إرسال التذكير لـ ${reminderModal.name} عبر الواتساب`);
  };

  const filtered = members.filter(m => m.name.includes(search));

  return (
    <div className="anim-in">
      {toast && (
        <div style={{
          position:"fixed", top:24, left:"50%", transform:"translateX(-50%)",
          background: toast.color, color:"#fff", padding:"12px 28px",
          borderRadius:12, fontWeight:700, fontSize:14, zIndex:2000,
          boxShadow:"0 8px 30px rgba(0,0,0,0.4)",
        }}>{toast.msg}</div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:C.text }}>إدارة الذمم والتنبيهات</h2>
          <p style={{ fontSize:13, color:C.textMuted, marginTop:4 }}>
            {members.length} عضو لديهم متأخرات — إجمالي: {members.reduce((s,m)=>s+m.amount,0).toLocaleString("ar-SA")} ر.س
          </p>
        </div>
        <Btn onClick={() => showToast("📤 تم جدولة تذكير جماعي لجميع الأعضاء", C.accent)}>
          📣 تذكير جماعي
        </Btn>
      </div>

      {/* Search */}
      <div style={{ marginBottom:20 }}>
        <input
          placeholder="بحث باسم العضو..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
          style={{
            width:"100%", padding:"11px 16px",
            background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:12, color:C.text, fontSize:14,
            fontFamily:"'Tajawal', sans-serif", outline:"none",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{
          display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto",
          padding:"12px 20px", background:C.surface2,
          borderBottom:`1px solid ${C.border}`,
          fontSize:12, fontWeight:700, color:C.textMuted,
        }}>
          <span>الاسم</span>
          <span>الأشهر المتأخرة</span>
          <span>المبلغ المستحق</span>
          <span>آخر دفعة</span>
          <span>إجراء</span>
        </div>
        {filtered.map((m, i) => (
          <div key={m.id} style={{
            display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr auto",
            padding:"16px 20px", alignItems:"center",
            borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : "none",
            background: i%2===0 ? "transparent" : `${C.surface2}70`,
            transition:"background 0.15s",
          }}>
            <div>
              <div style={{ fontWeight:600, color:C.text, fontSize:14 }}>{m.name}</div>
              <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>{m.phone}</div>
            </div>
            <Tag n={m.months} />
            <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontWeight:700, color:C.gold, fontSize:14 }}>
              {m.amount.toLocaleString("ar-SA")} ر.س
            </div>
            <div style={{ fontSize:12, color:C.textDim }}>{m.lastPaid}</div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn small variant="green" onClick={() => { setPayAmount(""); setPayRef(""); setPayModal(m); }}>
                💰 دفعة
              </Btn>
              <Btn small variant="ghost" onClick={() => setReminderModal(m)}>
                📱 تذكير
              </Btn>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:40, color:C.textMuted }}>لا توجد نتائج</div>
        )}
      </div>

      {/* Pay Modal */}
      {payModal && (
        <Modal title={`تسجيل دفعة — ${payModal.name}`} onClose={() => setPayModal(null)}>
          <div style={{ padding:"0 0 8px", marginBottom:16 }}>
            <div style={{ display:"flex", gap:20 }}>
              <div style={{ background:C.goldSoft, borderRadius:10, padding:"10px 16px", flex:1 }}>
                <div style={{ fontSize:11, color:C.textMuted }}>المبلغ المستحق</div>
                <div style={{ fontSize:18, fontWeight:800, color:C.gold, fontFamily:"'IBM Plex Mono'" }}>
                  {payModal.amount.toLocaleString("ar-SA")} ر.س
                </div>
              </div>
              <div style={{ background:C.purpleSoft, borderRadius:10, padding:"10px 16px", flex:1 }}>
                <div style={{ fontSize:11, color:C.textMuted }}>الأشهر المتأخرة</div>
                <div style={{ fontSize:18, fontWeight:800, color:C.purple }}>{payModal.months} أشهر</div>
              </div>
            </div>
          </div>
          <Input label="المبلغ المدفوع (ر.س)" value={payAmount} onChange={setPayAmount} type="number" placeholder="150" />
          <Input label="رقم الحوالة البنكية (اختياري)" value={payRef} onChange={setPayRef} placeholder="REF-2025-001" />
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
            <Btn variant="ghost" onClick={() => setPayModal(null)}>إلغاء</Btn>
            <Btn variant="green" onClick={handlePay}>✅ تأكيد الاستلام</Btn>
          </div>
        </Modal>
      )}

      {/* Reminder Modal */}
      {reminderModal && (
        <Modal title={`إرسال تذكير — ${reminderModal.name}`} onClose={() => setReminderModal(null)}>
          <div style={{
            background:C.accentSoft, borderRadius:12, padding:16, marginBottom:20,
            fontSize:13, lineHeight:1.8, color:C.textDim, direction:"rtl",
          }}>
            📱 سيُرسَل التذكير التالي على الواتساب:<br/><br/>
            <strong style={{ color:C.text }}>
              السلام عليكم أخ {reminderModal.name}، نُذكّركم بمستحقات صندوق عائلة قطيفان
              بقيمة {reminderModal.amount.toLocaleString("ar-SA")} ر.س. يُرجى التكرّم بالتحويل على حساب الصندوق. شكراً 🤍
            </strong>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn variant="ghost" onClick={() => setReminderModal(null)}>إلغاء</Btn>
            <Btn variant="primary" onClick={handleReminder}>📤 إرسال الآن</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// 3. Expense Screen ────────────────────────────────────────────
function ExpenseScreen() {
  const [form, setForm]     = useState({ category:"", beneficiary:"", amount:"", description:"", file:null });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  const CATEGORIES = [
    { value:"", label:"اختر التصنيف..." },
    { value:"condolence", label:"🕊️ عزاء" },
    { value:"wedding",    label:"💍 نقوط زواج" },
    { value:"emergency",  label:"🚨 طارئ" },
    { value:"admin",      label:"📋 مصاريف إدارية" },
    { value:"other",      label:"📦 أخرى" },
  ];

  const categoryLabel = {
    condolence:"عزاء", wedding:"نقوط زواج", emergency:"طارئ",
    admin:"مصاريف إدارية", other:"أخرى",
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.category)    e.category    = "اختر التصنيف";
    if (!form.beneficiary) e.beneficiary = "اسم المستفيد مطلوب";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = "أدخل مبلغاً صحيحاً";
    if (!form.description) e.description = "الوصف مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ category:"", beneficiary:"", amount:"", description:"", file:null });
    }, 4000);
  };

  return (
    <div className="anim-in">
      <h2 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>اعتماد صرف مبلغ</h2>
      <p style={{ fontSize:13, color:C.textMuted, marginBottom:28 }}>
        سيُخصَم المبلغ من رصيد الصندوق بعد التأكيد مع التحقق من السيولة
      </p>

      {submitted && (
        <div className="anim-in" style={{
          background:C.greenSoft, border:`1px solid ${C.green}40`,
          borderRadius:14, padding:24, marginBottom:24, textAlign:"center",
        }}>
          <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.green }}>تم اعتماد الصرف بنجاح</div>
          <div style={{ fontSize:13, color:C.textDim, marginTop:6 }}>
            تم خصم {Number(form.amount || 0).toLocaleString("ar-SA")} ر.س من رصيد الصندوق
            وإرسال إشعار للمستفيد
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        {/* Form */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:28 }}>
          <Select
            label="تصنيف الصرف *"
            value={form.category}
            onChange={v => f("category", v)}
            options={CATEGORIES}
          />
          {errors.category && <div style={{ color:C.red, fontSize:12, marginTop:-12, marginBottom:12 }}>{errors.category}</div>}

          <Input label="اسم المستفيد *" value={form.beneficiary} onChange={v=>f("beneficiary",v)}
            placeholder="مثال: سالم محمد القطيفان (عريس)" />
          {errors.beneficiary && <div style={{ color:C.red, fontSize:12, marginTop:-12, marginBottom:12 }}>{errors.beneficiary}</div>}

          <Input label="المبلغ (ر.س) *" value={form.amount} onChange={v=>f("amount",v)}
            type="number" placeholder="500" />
          {errors.amount && <div style={{ color:C.red, fontSize:12, marginTop:-12, marginBottom:12 }}>{errors.amount}</div>}

          <Input label="الوصف / التفاصيل *" value={form.description} onChange={v=>f("description",v)}
            placeholder="مثال: نقوط زواج — مناسبة زواج الأخ سالم" textarea />
          {errors.description && <div style={{ color:C.red, fontSize:12, marginTop:-12, marginBottom:12 }}>{errors.description}</div>}

          {/* File upload */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:13, color:C.textDim, marginBottom:6, fontWeight:500 }}>
              إيصال التحويل البنكي (اختياري)
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border:`2px dashed ${form.file ? C.green : C.border}`,
                borderRadius:12, padding:"20px 16px", textAlign:"center",
                cursor:"pointer", transition:"all 0.2s",
                background: form.file ? C.greenSoft : C.surface2,
              }}
            >
              {form.file ? (
                <div style={{ color:C.green }}>
                  <div style={{ fontSize:24, marginBottom:4 }}>📎</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{form.file.name}</div>
                  <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>
                    {(form.file.size/1024).toFixed(0)} KB
                  </div>
                </div>
              ) : (
                <div style={{ color:C.textMuted }}>
                  <div style={{ fontSize:28, marginBottom:6 }}>📤</div>
                  <div style={{ fontSize:13 }}>اضغط لرفع الإيصال</div>
                  <div style={{ fontSize:11, marginTop:2 }}>PNG / JPG / PDF</div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file" accept=".png,.jpg,.jpeg,.pdf"
                style={{ display:"none" }}
                onChange={e => f("file", e.target.files[0])}
              />
            </div>
          </div>

          <Btn variant="gold" onClick={handleSubmit} style={{ width:"100%" }}>
            ✅ اعتماد الصرف
          </Btn>
        </div>

        {/* Preview */}
        <div>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:28, marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.textDim, marginBottom:16 }}>معاينة السند</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                ["التصنيف",    form.category ? categoryLabel[form.category] : "—"],
                ["المستفيد",   form.beneficiary || "—"],
                ["المبلغ",     form.amount ? `${Number(form.amount).toLocaleString("ar-SA")} ر.س` : "—"],
                ["التاريخ",    new Date().toLocaleDateString("ar-SA")],
              ].map(([k,v]) => (
                <div key={k} style={{
                  display:"flex", justifyContent:"space-between",
                  paddingBottom:10, borderBottom:`1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize:12, color:C.textMuted }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{v}</span>
                </div>
              ))}
            </div>
            {form.description && (
              <div style={{
                marginTop:14, background:C.surface2, borderRadius:10, padding:12,
                fontSize:12, color:C.textDim, lineHeight:1.8,
              }}>{form.description}</div>
            )}
          </div>

          {/* Fund balance after */}
          {form.amount && !isNaN(form.amount) && Number(form.amount) > 0 && (
            <div style={{
              background: Number(form.amount) > MOCK.balance * 0.9 ? C.redSoft : C.greenSoft,
              border:`1px solid ${Number(form.amount) > MOCK.balance*0.9 ? C.red : C.green}40`,
              borderRadius:14, padding:16,
            }}>
              <div style={{ fontSize:12, color:C.textMuted, marginBottom:6 }}>الرصيد المتوقع بعد الصرف</div>
              <div style={{
                fontSize:22, fontWeight:800,
                fontFamily:"'IBM Plex Mono', monospace",
                color: Number(form.amount) > MOCK.balance*0.9 ? C.red : C.green,
              }}>
                {(MOCK.balance - Number(form.amount)).toLocaleString("ar-SA")} ر.س
              </div>
              {Number(form.amount) > MOCK.balance * 0.9 && (
                <div style={{ fontSize:11, color:C.red, marginTop:6 }}>
                  ⚠️ تحذير: سيكون الرصيد دون نسبة الاحتياطي المقررة
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 4. Settings Screen ───────────────────────────────────────────
function SettingsScreen() {
  const [subscription, setSubscription] = useState("150");
  const [whatsappMsg, setWhatsappMsg]   = useState(
    "السلام عليكم أخ/ة {name} 👋\nنُذكّركم بأن لديكم ذمم متأخرة بقيمة {amount} ر.س.\nيُرجى التحويل على حساب الصندوق:\nIBAN: {iban}\nشكراً لالتزامكم 🤍"
  );
  const [emailSubject, setEmailSubject] = useState("تذكير — مستحقات صندوق عائلة قطيفان");
  const [emailBody, setEmailBody]       = useState(
    "عزيزي/عزيزتي {name}،\nنُذكّركم بوجود مستحقات بقيمة {amount} ر.س للصرف على اشتراكات الصندوق.\n\nبيانات التحويل:\n- الاسم: صندوق عائلة قطيفان\n- IBAN: {iban}\n\nمع التقدير،\nإدارة صندوق عائلة قطيفان"
  );
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const VARS = ["{name}", "{amount}", "{iban}", "{months}"];

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} style={{
      background: activeTab===id ? C.accentSoft : "none",
      border: activeTab===id ? `1px solid ${C.accent}40` : "1px solid transparent",
      color: activeTab===id ? C.accent : C.textMuted,
      borderRadius:10, padding:"8px 18px", fontSize:13,
      fontFamily:"'Tajawal', sans-serif", fontWeight:600,
      cursor:"pointer", transition:"all 0.15s",
    }}>{label}</button>
  );

  return (
    <div className="anim-in">
      <h2 style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:6 }}>إعدادات النظام</h2>
      <p style={{ fontSize:13, color:C.textMuted, marginBottom:24 }}>تخصيص قواعد الصندوق ونصوص الرسائل الآلية</p>

      {saved && (
        <div className="anim-in" style={{
          background:C.greenSoft, border:`1px solid ${C.green}40`,
          borderRadius:12, padding:"12px 20px", marginBottom:20, fontSize:13,
          color:C.green, fontWeight:600,
        }}>✅ تم حفظ الإعدادات بنجاح</div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        <TabBtn id="general"   label="⚙️ عام" />
        <TabBtn id="whatsapp"  label="📱 واتساب" />
        <TabBtn id="email"     label="📧 البريد" />
      </div>

      {activeTab === "general" && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:28 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:20 }}>الإعدادات العامة</div>

          <Input label="قيمة الاشتراك الشهري (ر.س)" value={subscription}
            onChange={setSubscription} type="number" placeholder="150" />

          {/* Cron status */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:13, color:C.textDim, marginBottom:10, fontWeight:500 }}>
              حالة المهام الآلية
            </label>
            {[
              { label:"توليد الذمم الشهرية",   schedule:"1 من كل شهر — 06:00",     status:"active" },
              { label:"إرسال التذكيرات",        schedule:"كل أحد — 10:00",          status:"active" },
              { label:"إعادة إرسال الفاشلة",   schedule:"كل ساعة",                  status:"active" },
            ].map(job => (
              <div key={job.label} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"12px 16px", background:C.surface2, borderRadius:10, marginBottom:8,
              }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{job.label}</div>
                  <div style={{ fontSize:11, color:C.textMuted }}>{job.schedule}</div>
                </div>
                <Badge label="يعمل" color={C.green} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:13, color:C.textDim, marginBottom:10, fontWeight:500 }}>
              نسبة الاحتياطي الإلزامي
            </label>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <input type="range" min="5" max="30" defaultValue="10"
                style={{ flex:1, accentColor: C.accent }} />
              <span style={{
                fontFamily:"'IBM Plex Mono'", fontWeight:700,
                color:C.accent, fontSize:16, minWidth:40,
              }}>10%</span>
            </div>
            <div style={{ fontSize:11, color:C.textMuted, marginTop:6 }}>
              لا يُصرف من الصندوق إذا انخفض الرصيد دون هذه النسبة
            </div>
          </div>

          <Btn variant="primary" onClick={handleSave} style={{ width:"100%" }}>💾 حفظ الإعدادات</Btn>
        </div>
      )}

      {activeTab === "whatsapp" && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:28 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>رسالة تذكير الواتساب</div>
          <p style={{ fontSize:12, color:C.textMuted, marginBottom:20 }}>
            هذا النص يُرسل تلقائياً للأعضاء المتأخرين كل أحد
          </p>

          {/* Variables guide */}
          <div style={{
            background:C.surface2, borderRadius:10, padding:14, marginBottom:20,
            display:"flex", flexWrap:"wrap", gap:8, alignItems:"center",
          }}>
            <span style={{ fontSize:12, color:C.textMuted, marginLeft:8 }}>المتغيرات المتاحة:</span>
            {VARS.map(v => (
              <span key={v} onClick={() => setWhatsappMsg(m => m + v)}
                style={{
                  background:C.accentSoft, color:C.accent, borderRadius:6,
                  padding:"3px 10px", fontSize:12, fontFamily:"'IBM Plex Mono'",
                  cursor:"pointer", border:`1px solid ${C.accent}40`,
                }}>{v}</span>
            ))}
          </div>

          <Input label="نص الرسالة" value={whatsappMsg} onChange={setWhatsappMsg} textarea rows={6} />

          {/* Preview */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, color:C.textDim, marginBottom:8 }}>معاينة الرسالة:</div>
            <div style={{
              background:"#1a2a1a", border:`1px solid #2a4a2a`,
              borderRadius:12, padding:16, fontSize:13, color:"#90ee90",
              lineHeight:1.9, direction:"rtl", fontFamily:"'Tajawal'",
              whiteSpace:"pre-wrap",
            }}>
              {whatsappMsg
                .replace("{name}", "أحمد القطيفان")
                .replace("{amount}", "450")
                .replace("{iban}", "SA12 3456 7890")
                .replace("{months}", "3")}
            </div>
          </div>

          <Btn variant="primary" onClick={handleSave} style={{ width:"100%" }}>💾 حفظ الرسالة</Btn>
        </div>
      )}

      {activeTab === "email" && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:28 }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:20 }}>إعدادات البريد الإلكتروني</div>

          <div style={{
            background:C.surface2, borderRadius:10, padding:14, marginBottom:20,
            display:"flex", flexWrap:"wrap", gap:8, alignItems:"center",
          }}>
            <span style={{ fontSize:12, color:C.textMuted, marginLeft:8 }}>المتغيرات:</span>
            {VARS.map(v => (
              <span key={v} onClick={() => setEmailBody(b => b + v)}
                style={{
                  background:C.accentSoft, color:C.accent, borderRadius:6,
                  padding:"3px 10px", fontSize:12, fontFamily:"'IBM Plex Mono'",
                  cursor:"pointer", border:`1px solid ${C.accent}40`,
                }}>{v}</span>
            ))}
          </div>

          <Input label="عنوان البريد (Subject)" value={emailSubject} onChange={setEmailSubject} placeholder="تذكير — صندوق عائلة قطيفان" />
          <Input label="نص الرسالة" value={emailBody} onChange={setEmailBody} textarea rows={7} />

          <Btn variant="primary" onClick={handleSave} style={{ width:"100%" }}>💾 حفظ إعدادات البريد</Btn>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState("dashboard");

  const NAV = [
    { id:"dashboard",  label:"لوحة القيادة",         icon:"📊" },
    { id:"dues",       label:"الذمم والتنبيهات",      icon:"⏰" },
    { id:"expenses",   label:"اعتماد الصرف",          icon:"💸" },
    { id:"settings",   label:"إعدادات النظام",         icon:"⚙️" },
  ];

  return (
    <>
      <style>{globalStyle}</style>
      <div style={{
        minHeight:"100vh", background:C.bg,
        display:"flex", direction:"rtl",
        fontFamily:"'Tajawal', sans-serif",
      }}>

        {/* Sidebar */}
        <aside style={{
          width:240, background:C.surface, borderLeft:`1px solid ${C.border}`,
          display:"flex", flexDirection:"column", flexShrink:0,
          position:"sticky", top:0, height:"100vh",
        }}>
          {/* Logo */}
          <div style={{
            padding:"28px 24px 20px",
            borderBottom:`1px solid ${C.border}`,
          }}>
            <div style={{ fontSize:11, color:C.textMuted, fontWeight:600, letterSpacing:2, marginBottom:8 }}>
              صندوق
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:C.text, lineHeight:1.2 }}>
              عائلة قطيفان
            </div>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:5,
              background:C.greenSoft, borderRadius:20, padding:"3px 10px",
              marginTop:10, fontSize:11, color:C.green, fontWeight:600,
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:C.green, display:"inline-block" }} />
              النظام يعمل
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding:"16px 12px", flex:1 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => setScreen(n.id)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:12,
                padding:"11px 14px", borderRadius:12, marginBottom:4,
                background: screen===n.id ? C.accentSoft : "none",
                border: screen===n.id ? `1px solid ${C.accent}30` : "1px solid transparent",
                color: screen===n.id ? C.accent : C.textDim,
                cursor:"pointer", textAlign:"right",
                fontFamily:"'Tajawal', sans-serif", fontWeight: screen===n.id ? 700 : 500,
                fontSize:14, transition:"all 0.15s",
              }}>
                <span style={{ fontSize:18 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          {/* Fund balance quick view */}
          <div style={{
            margin:12, background:C.surface2, borderRadius:14, padding:16,
            border:`1px solid ${C.border}`,
          }}>
            <div style={{ fontSize:11, color:C.textMuted, marginBottom:4 }}>رصيد الصندوق</div>
            <div style={{
              fontSize:16, fontWeight:800, color:C.green,
              fontFamily:"'IBM Plex Mono', monospace",
            }}>
              {MOCK.balance.toLocaleString("ar-SA")}
            </div>
            <div style={{ fontSize:10, color:C.textMuted }}>ريال سعودي</div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex:1, padding:"32px 36px", overflowY:"auto", maxWidth:"calc(100vw - 240px)" }}>
          {/* Header */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:28, paddingBottom:20, borderBottom:`1px solid ${C.border}`,
          }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, color:C.text }}>
                {NAV.find(n=>n.id===screen)?.label}
              </h1>
              <p style={{ fontSize:12, color:C.textMuted, marginTop:3 }}>
                {new Date().toLocaleDateString("ar-SA", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
              </p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div className="pulse-badge" style={{
                background:C.surface2, border:`1px solid ${C.border}`,
                borderRadius:10, padding:"8px 14px", fontSize:12, color:C.textDim,
                display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:C.accent, display:"inline-block" }} />
                مرحباً، المدير
              </div>
            </div>
          </div>

          {/* Screen content */}
          <div key={screen}>
            {screen === "dashboard" && <Dashboard />}
            {screen === "dues"      && <DuesScreen />}
            {screen === "expenses"  && <ExpenseScreen />}
            {screen === "settings"  && <SettingsScreen />}
          </div>
        </main>
      </div>
    </>
  );
}
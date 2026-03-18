"use client";

import { useState, useEffect, useRef } from "react";

/* ── DATA ─────────────────────────────────────────────────── */
const services = [
  { icon: "🦷", title: "General Checkup",    desc: "Comprehensive oral examination and cleaning",  duration: "45 min",  price: "₹800"    },
  { icon: "✨", title: "Teeth Whitening",    desc: "Professional laser whitening treatment",       duration: "60 min",  price: "₹3,500"  },
  { icon: "📐", title: "Orthodontics",       desc: "Braces, aligners and bite correction",         duration: "30 min",  price: "₹1,200"  },
  { icon: "💉", title: "Root Canal",         desc: "Pain-free endodontic therapy",                 duration: "90 min",  price: "₹5,000"  },
  { icon: "🔩", title: "Dental Implants",    desc: "Permanent tooth replacement solutions",        duration: "120 min", price: "₹25,000" },
  { icon: "💎", title: "Cosmetic Dentistry", desc: "Veneers, bonding and smile design",            duration: "75 min",  price: "₹8,000"  },
];

const doctors = [
  { name: "Dr. Priya Sharma", spec: "Orthodontist",     exp: "12 yrs", initials: "PS", slots: ["9:00","11:00","14:00"]  },
  { name: "Dr. Arjun Mehta",  spec: "Endodontist",      exp: "9 yrs",  initials: "AM", slots: ["10:00","13:00","16:00"] },
  { name: "Dr. Neha Gupta",   spec: "Cosmetic Dentist", exp: "7 yrs",  initials: "NG", slots: ["9:30","12:00","15:30"]  },
];

const steps = [
  { num: "01", label: "Choose a service",  desc: "Browse treatments tailored to your needs"     },
  { num: "02", label: "Pick your doctor",  desc: "Select from our team of verified specialists" },
  { num: "03", label: "Select time slot",  desc: "Find a time that fits your schedule"          },
  { num: "04", label: "Confirm booking",   desc: "AI confirmation sent to your inbox instantly" },
];

const FIELDS: [string, string, string][] = [
  ["Full Name",     "text",  "Rajesh Kumar"    ],
  ["Phone Number",  "tel",   "+91 98765 43210" ],
  ["Email Address", "email", "rajesh@email.com"],
  ["Date of Birth", "date",  ""                ],
];

const FOOTER_COLS: [string, string[]][] = [
  ["Services", ["General Checkup","Orthodontics","Cosmetic","Implants","Root Canal"]],
  ["Contact",  ["GS Road, Guwahati","+91 361 000 0000","hello@dentala.in","Mon–Sat  9am–7pm"]],
];

const TICKER = Array(10)
  .fill(["General Dentistry","·","Orthodontics","·","Cosmetic","·","Implants","·","Root Canal","·","Whitening","·"])
  .flat();

/* ── COMPONENT ────────────────────────────────────────────── */
export default function HomePage() {
  const [activeService,  setActiveService]  = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedSlot,   setSelectedSlot]   = useState<string | null>(null);
  const [scrollY,        setScrollY]        = useState(0);
  const [booked,         setBooked]         = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleBook = () => {
    if (activeService !== null && selectedDoctor !== null && selectedSlot) {
      setBooked(true);
      setTimeout(() => setBooked(false), 3200);
    }
  };

  const goto = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navSolid = scrollY > 60;

  return (
    <>
      {/* ── TOAST ─────────────────────────────────────────── */}
      <div className={`toast${booked ? " show" : ""}`}>
        ✓ Appointment confirmed — check your email
      </div>

      {/* ── NAV ───────────────────────────────────────────── */}
      <nav className={`nav${navSolid ? " solid" : ""}`}>
        <a href="#home" className="nav-logo">
          <div className="nav-logo-dot">✦</div>
          DENTALA
        </a>

        <div className="nav-links">
          {[["Services","services"],["Doctors","doctors"],["Book","book"],["About","about"]].map(([l,id]) => (
            <a key={id} href={`#${id}`} className="nav-link">{l}</a>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          {/* Desktop only CTA — hidden on mobile via globals.css */}
          <button className="btn btn-outline btn-sm nav-desktop-cta" onClick={() => goto("book")}>
            Emergency Care
          </button>
          <button className="nav-hamburger" aria-label="Toggle menu"
            onClick={() => setMobileOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-mobile${mobileOpen ? " open" : ""}`}>
        {[["Services","services"],["Doctors","doctors"],["Book","book"],["About","about"]].map(([l,id]) => (
          <a key={id} href={`#${id}`} className="nav-link" onClick={() => goto(id)}>{l}</a>
        ))}
        <button className="btn btn-primary btn-sm" style={{ marginTop:"8px" }}
          onClick={() => goto("book")}>
          Book Appointment
        </button>
      </div>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        id="home"
        ref={heroRef}
        style={{
          minHeight:  "100vh",
          display:    "flex",
          alignItems: "center",
          padding:    "calc(var(--nav-h) + 40px) var(--page-x) 80px",
          position:   "relative",
          overflow:   "hidden",
          background: "linear-gradient(160deg,#ffffff 0%,#edf8f7 60%,#d0eeec 100%)",
        }}
      >
        {/* Dot grid texture */}
        <div style={{
          position:        "absolute", inset:0, pointerEvents:"none",
          backgroundImage: "linear-gradient(rgba(30,142,136,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(30,142,136,.06) 1px,transparent 1px)",
          backgroundSize:  "72px 72px",
        }} />

        {/* Floating orb — uses .float-y from globals */}
        <div className="float-y" style={{
          position:      "absolute", right:"5%", top:"15%",
          width:         "420px",    height:"420px", borderRadius:"50%",
          background:    "radial-gradient(circle,rgba(30,142,136,.12) 0%,transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Spinning ring with 4 dots — uses .spin-ring from globals */}
        <div className="spin-ring" style={{
          position:      "absolute", right:"7%", top:"17%",
          width:         "320px",    height:"320px",
        }}>
          {[0,90,180,270].map(deg => (
            <div key={deg} style={{
              position:        "absolute",
              width:           "8px", height:"8px", borderRadius:"50%",
              background:      "var(--teal-400)",
              top:"50%",       left:"50%",
              transformOrigin: "0 0",
              transform:       `rotate(${deg}deg) translateX(158px) translateY(-4px)`,
              opacity:         .7,
            }} />
          ))}
        </div>

        {/* Hero content */}
        <div style={{ maxWidth:"680px", position:"relative", zIndex:1 }}>
          <span className="label-xs fu-1" style={{ display:"block", marginBottom:"24px" }}>
            Premium dental care · Guwahati, Assam
          </span>

          <h1 className="fu-2" style={{
            fontFamily:    "var(--font-head)",
            fontSize:      "clamp(44px,7vw,84px)",
            fontWeight:    700,
            lineHeight:    1.08,
            letterSpacing: "-.025em",
            color:         "var(--fg)",
            marginBottom:  "28px",
          }}>
            Your smile,{" "}
            <span className="h-display" style={{ fontSize:"clamp(48px,7.5vw,90px)" }}>
              perfected.
            </span>
          </h1>

          <p className="fu-3" style={{
            fontFamily:   "var(--font-body)",
            fontSize:     "17px",
            lineHeight:   1.75,
            color:        "var(--fg-muted)",
            maxWidth:     "460px",
            marginBottom: "40px",
          }}>
            AI-powered appointment booking meets world-class dental care.
            Reserve your visit in under 60 seconds.
          </p>

          <div className="fu-4" style={{ display:"flex", gap:"16px", flexWrap:"wrap", marginBottom:"56px" }}>
            <button className="btn btn-primary btn-lg" onClick={() => goto("book")}>Book Appointment</button>
            <button className="btn btn-outline btn-lg" onClick={() => goto("services")}>View Services</button>
          </div>

          {/* Stats row */}
          <div className="fu-4" style={{
            display:"flex", gap:"40px", flexWrap:"wrap",
            paddingTop:"36px", borderTop:"1px solid var(--border)",
          }}>
            {[["4,200+","Patients treated"],["15+","Years of care"],["98%","Satisfaction rate"]].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily:"var(--font-head)", fontSize:"28px", fontWeight:700, color:"var(--teal-500)", letterSpacing:"-.02em", lineHeight:1 }}>{v}</div>
                <div style={{ fontFamily:"var(--font-body)", fontSize:"12px", color:"var(--fg-dim)", marginTop:"5px", letterSpacing:".03em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────── */}
      <div className="marquee-wrap" style={{ background:"var(--teal-500)", padding:"14px 0" }}>
        <div className="marquee-track" style={{
          fontFamily:"var(--font-body)", fontSize:"12px", fontWeight:500,
          letterSpacing:".18em", color:"rgba(255,255,255,.8)", textTransform:"uppercase",
        }}>
          {TICKER.map((t,i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="section section-alt section-divider">
        <span className="label-xs" style={{ display:"block", marginBottom:"14px" }}>Process</span>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700, marginBottom:"48px", maxWidth:"360px", color:"var(--fg)" }}>
          Four steps to a healthier smile
        </h2>
        <div className="grid-4">
          {steps.map((s,i) => (
            <div key={i} className="step-card">
              <div className="step-num">{s.num}</div>
              <h3 style={{ fontFamily:"var(--font-head)", fontSize:"17px", fontWeight:600, color:"var(--fg)", marginBottom:"8px" }}>{s.label}</h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"13px", color:"var(--fg-muted)", lineHeight:1.6 }}>{s.desc}</p>
              <div className="step-arrow">→</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────── */}
      <section id="services" className="section section-divider">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"48px", flexWrap:"wrap", gap:"16px" }}>
          <div>
            <span className="label-xs" style={{ display:"block", marginBottom:"12px" }}>Our Services</span>
            <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700, color:"var(--fg)" }}>What we offer</h2>
          </div>
          <span className="badge badge-teal">6 specialties</span>
        </div>
        <div className="grid-3">
          {services.map((s,i) => (
            <div key={i} className={`service-card${activeService===i?" active":""}`}
              onClick={() => setActiveService(i===activeService?null:i)}>
              <div className="service-icon">{s.icon}</div>
              <h3 style={{ fontFamily:"var(--font-head)", fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"var(--fg)" }}>{s.title}</h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"13px", color:"var(--fg-muted)", lineHeight:1.65, marginBottom:"20px" }}>{s.desc}</p>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span className="badge badge-muted">{s.duration}</span>
                <span style={{ fontFamily:"var(--font-body)", fontSize:"14px", fontWeight:600, color:"var(--teal-600)" }}>From {s.price}</span>
              </div>
              {activeService===i && (
                <div style={{ marginTop:"18px", paddingTop:"18px", borderTop:"1px solid var(--border)" }}>
                  <button className="btn btn-primary btn-full"
                    onClick={e => { e.stopPropagation(); goto("book"); }}>
                    Book This Service
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── DOCTORS ───────────────────────────────────────── */}
      <section id="doctors" className="section section-alt section-divider">
        <span className="label-xs" style={{ display:"block", marginBottom:"14px" }}>Our Team</span>
        <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700, marginBottom:"48px", color:"var(--fg)" }}>
          Meet your doctors
        </h2>
        <div className="grid-3">
          {doctors.map((d,i) => (
            <div key={i} className={`doctor-card${selectedDoctor===i?" selected":""}`}
              onClick={() => { setSelectedDoctor(i===selectedDoctor?null:i); setSelectedSlot(null); }}>
              <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"18px" }}>
                <div className="avatar">{d.initials}</div>
                <div>
                  <h3 style={{ fontFamily:"var(--font-head)", fontSize:"16px", fontWeight:600, color:"var(--fg)", marginBottom:"5px" }}>{d.name}</h3>
                  <span className="badge badge-teal" style={{ fontSize:"11px" }}>{d.spec}</span>
                </div>
              </div>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"13px", color:"var(--fg-muted)" }}>
                {d.exp} experience
              </p>
              {selectedDoctor===i && (
                <div style={{ marginTop:"18px", paddingTop:"18px", borderTop:"1px solid var(--border)" }}>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:"11px", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--fg-dim)", marginBottom:"12px" }}>
                    Today&apos;s available slots
                  </p>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {d.slots.map(slot => (
                      <button key={slot} className={`slot-btn${selectedSlot===slot?" active":""}`}
                        onClick={e => { e.stopPropagation(); setSelectedSlot(slot); }}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── BOOKING ───────────────────────────────────────── */}
      <section id="book" className="section section-divider">
        <div className="container-sm">
          <span className="label-xs" style={{ display:"block", textAlign:"center", marginBottom:"14px" }}>Booking</span>
          <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(28px,3.5vw,44px)", fontWeight:700, textAlign:"center", color:"var(--fg)", marginBottom:"10px" }}>
            Reserve your visit
          </h2>
          <p style={{ textAlign:"center", fontFamily:"var(--font-body)", fontSize:"15px", color:"var(--fg-muted)", marginBottom:"44px" }}>
            Our AI assistant will confirm your booking instantly
          </p>

          <div className="card" style={{ padding:"40px" }}>
            <div className="grid-2" style={{ marginBottom:"20px" }}>
              {FIELDS.map(([lbl,type,ph]) => (
                <div className="form-field" key={lbl}>
                  <label className="form-label">{lbl}</label>
                  <input type={type} placeholder={ph} className="form-input" />
                </div>
              ))}
            </div>

            <div className="form-field" style={{ marginBottom:"24px" }}>
              <label className="form-label">Notes / Symptoms</label>
              <textarea placeholder="Describe any pain, sensitivity, or concerns..." rows={3}
                className="form-input" style={{ resize:"vertical" }} />
            </div>

            <div className="summary-box" style={{ marginBottom:"28px" }}>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"11px", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--fg-dim)", marginBottom:"14px" }}>
                Booking Summary
              </p>
              <div className="grid-3" style={{ gap:"16px" }}>
                {([
                  ["Service", activeService  !== null ? services[activeService].title                               : "—"],
                  ["Doctor",  selectedDoctor !== null ? doctors[selectedDoctor].name.split(" ").slice(0,2).join(" ") : "—"],
                  ["Time",    selectedSlot   ?? "—"],
                ] as [string,string][]).map(([lbl,val]) => (
                  <div key={lbl}>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:"11px", color:"var(--fg-dim)", marginBottom:"4px" }}>{lbl}</p>
                    <p style={{
                      fontFamily: "var(--font-head)", fontSize:"15px", fontWeight:600,
                      color: val==="—" ? "var(--fg-dim)" : lbl==="Time" ? "var(--teal-600)" : "var(--fg)",
                    }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-lg btn-full"
              disabled={activeService===null||selectedDoctor===null||!selectedSlot}
              onClick={handleBook}>
              Confirm Appointment
            </button>
            <p style={{ textAlign:"center", fontFamily:"var(--font-body)", fontSize:"12px", color:"var(--fg-dim)", marginTop:"14px" }}>
              Free cancellation up to 24 hours before your visit
            </p>
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────── */}
      <section id="about" style={{
        background: "linear-gradient(135deg,var(--teal-600) 0%,var(--teal-800) 100%)",
        padding:    "80px var(--page-x)",
        borderTop:  "1px solid var(--teal-700)",
      }}>
        <div style={{ maxWidth:"600px", margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:"var(--font-disp)", fontSize:"clamp(26px,3.5vw,42px)", fontWeight:400, fontStyle:"italic", color:"#fff", marginBottom:"16px" }}>
            Trusted dental care since 2009
          </h2>
          <p style={{ fontFamily:"var(--font-body)", fontSize:"16px", lineHeight:1.75, color:"rgba(255,255,255,.78)", marginBottom:"36px" }}>
            Combining modern AI scheduling with warm, personalised care.
            Every visit comfortable, effective, and stress-free.
          </p>
          <button className="btn btn-lg" onClick={() => goto("book")}
            style={{ background:"#fff", color:"var(--teal-700)", fontFamily:"var(--font-body)", fontWeight:600, padding:"14px 36px", borderRadius:"var(--r-lg)", border:"none" }}>
            Book Your First Visit
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
              <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"var(--teal-500)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"#fff", fontSize:"15px" }}>✦</span>
              </div>
              <span style={{ fontFamily:"var(--font-head)", fontSize:"17px", fontWeight:700, color:"var(--teal-600)", letterSpacing:".04em" }}>DENTALA</span>
            </div>
            <p style={{ fontFamily:"var(--font-body)", fontSize:"13px", lineHeight:1.75, color:"var(--fg-muted)" }}>
              Premium AI-assisted dental care in Guwahati, Assam. Making healthy smiles accessible since 2009.
            </p>
          </div>
          <div className="footer-links">
            {FOOTER_COLS.map(([heading,items]) => (
              <div key={heading}>
                <p className="footer-col-title">{heading}</p>
                {items.map(item => <p key={item} className="footer-col-item">{item}</p>)}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Dentala. All rights reserved.</span>
          <span className="footer-copy">Powered by AI · Built with care</span>
        </div>
      </footer>
    </>
  );
}
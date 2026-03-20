"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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
  { name: "Dr. Priya Sharma", spec: "Orthodontist",     exp: "12 yrs", initials: "PS" },
  { name: "Dr. Arjun Mehta",  spec: "Endodontist",      exp: "9 yrs",  initials: "AM" },
  { name: "Dr. Neha Gupta",   spec: "Cosmetic Dentist", exp: "7 yrs",  initials: "NG" },
];

const steps = [
  { num: "01", label: "Choose a service",  desc: "Browse treatments tailored to your needs"     },
  { num: "02", label: "Pick your doctor",  desc: "Select from our team of verified specialists" },
  { num: "03", label: "Select time slot",  desc: "Find a time that fits your schedule"          },
  { num: "04", label: "Confirm booking",   desc: "AI confirmation sent to your inbox instantly" },
];

const FOOTER_COLS: [string, string[]][] = [
  ["Services", ["General Checkup","Orthodontics","Cosmetic","Implants","Root Canal"]],
  ["Quick Links", ["Dashboard", "Booking", "Doctors", "AI Chat"]],
  ["Contact",  ["GS Road, Guwahati","+91 361 000 0000","hello@dentala.in","Mon–Sat  9am–7pm"]],
];

const TICKER = Array(10)
  .fill(["General Dentistry","·","Orthodontics","·","Cosmetic","·","Implants","·","Root Canal","·","Whitening","·"])
  .flat();

/* ── COMPONENT ────────────────────────────────────────────── */
export default function HomePage() {
  const [scrollY,    setScrollY]    = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatPulse,  setChatPulse]  = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Stop chat pulse after 8s
  useEffect(() => {
    const t = setTimeout(() => setChatPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const goto = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navSolid = scrollY > 60;

  return (
    <>
      {/* ── NAV ───────────────────────────────────────────── */}
      <nav className={`nav${navSolid ? " solid" : ""}`}>
        <a href="#home" className="nav-logo">
          <div className="nav-logo-dot">✦</div>
          DENTALA
        </a>

        <div className="nav-links">
          {[["Services","services"],["Doctors","doctors"],["How It Works","steps"],["About","about"]].map(([l,id]) => (
            <a key={id} href={`#${id}`} className="nav-link">{l}</a>
          ))}
          <Link href="/dashboard" className="nav-link" style={{ color: "var(--teal-600)", fontWeight: 600 }}>
            Dashboard →
          </Link>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <Link href="/chat" className="btn btn-outline btn-sm nav-desktop-cta" style={{ gap:"6px" }}>
            💬 AI Chat
          </Link>
          <Link href="/booking" className="btn btn-primary btn-sm nav-desktop-cta">
            Book Now
          </Link>
          <button className="nav-hamburger" aria-label="Toggle menu"
            onClick={() => setMobileOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-mobile${mobileOpen ? " open" : ""}`}>
        {[["Services","services"],["Doctors","doctors"],["How It Works","steps"],["About","about"]].map(([l,id]) => (
          <a key={id} href={`#${id}`} className="nav-link" onClick={() => goto(id)}>{l}</a>
        ))}
        <Link href="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)} style={{ color: "var(--teal-600)", fontWeight: 600 }}>
          Dashboard
        </Link>
        <Link href="/chat" className="nav-link" onClick={() => setMobileOpen(false)}>
          💬 AI Chat
        </Link>
        <Link href="/booking" className="btn btn-primary btn-sm" style={{ marginTop:"8px" }} onClick={() => setMobileOpen(false)}>
          Book Appointment
        </Link>
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
        {/* Dot grid */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage: "linear-gradient(rgba(30,142,136,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(30,142,136,.06) 1px,transparent 1px)",
          backgroundSize:  "72px 72px",
        }} />

        {/* Floating orb */}
        <div className="float-y" style={{
          position:"absolute", right:"5%", top:"15%",
          width:"420px", height:"420px", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(30,142,136,.12) 0%,transparent 70%)",
          pointerEvents:"none",
        }} />

        {/* Hero content */}
        <div style={{ maxWidth:"680px", position:"relative", zIndex:1 }}>
          <span className="label-xs fu-1" style={{ display:"block", marginBottom:"24px" }}>
            Premium dental care · Guwahati, Assam
          </span>

          <h1 className="fu-2" style={{
            fontFamily:"var(--font-head)",
            fontSize:"clamp(44px,7vw,84px)",
            fontWeight:700, lineHeight:1.08,
            letterSpacing:"-.025em",
            color:"var(--fg)", marginBottom:"28px",
          }}>
            Your smile,{" "}
            <span className="h-display" style={{ fontSize:"clamp(48px,7.5vw,90px)" }}>
              perfected.
            </span>
          </h1>

          <p className="fu-3" style={{
            fontFamily:"var(--font-body)", fontSize:"17px",
            lineHeight:1.75, color:"var(--fg-muted)",
            maxWidth:"460px", marginBottom:"40px",
          }}>
            AI-powered appointment booking meets world-class dental care.
            Reserve your visit in under 60 seconds.
          </p>

          <div className="fu-4" style={{ display:"flex", gap:"12px", flexWrap:"wrap", marginBottom:"56px" }}>
            <Link href="/booking" className="btn btn-primary btn-lg">Book Appointment</Link>
            <Link href="/chat" className="btn btn-outline btn-lg" style={{ gap:"8px" }}>
              💬 Talk to AI
            </Link>
            <button className="btn btn-ghost btn-lg" onClick={() => goto("services")}>View Services</button>
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
      <section id="steps" className="section section-alt section-divider">
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
            <div key={i} className="service-card">
              <div className="service-icon">{s.icon}</div>
              <h3 style={{ fontFamily:"var(--font-head)", fontSize:"18px", fontWeight:600, marginBottom:"8px", color:"var(--fg)" }}>{s.title}</h3>
              <p style={{ fontFamily:"var(--font-body)", fontSize:"13px", color:"var(--fg-muted)", lineHeight:1.65, marginBottom:"20px" }}>{s.desc}</p>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span className="badge badge-muted">{s.duration}</span>
                <span style={{ fontFamily:"var(--font-body)", fontSize:"14px", fontWeight:600, color:"var(--teal-600)" }}>From {s.price}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"40px" }}>
          <Link href="/booking" className="btn btn-primary btn-lg">
            Book a Service →
          </Link>
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
            <div key={i} className="doctor-card">
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
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:"40px" }}>
          <Link href="/doctors" className="btn btn-outline btn-lg">
            View All Doctors & Availability →
          </Link>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="section section-divider" style={{ padding:"60px var(--page-x)" }}>
        <div style={{
          display:"grid", gridTemplateColumns:"1fr auto", gap:"32px", alignItems:"center",
          background:"linear-gradient(135deg, var(--teal-50), var(--bg-muted))",
          border:"1px solid var(--border)", borderRadius:"var(--r-xl)",
          padding:"40px 48px",
        }}>
          <div>
            <h3 style={{ fontFamily:"var(--font-head)", fontSize:"22px", fontWeight:700, color:"var(--fg)", marginBottom:"10px" }}>
              💬 Need help deciding?
            </h3>
            <p style={{ fontFamily:"var(--font-body)", fontSize:"15px", color:"var(--fg-muted)", maxWidth:"440px", lineHeight:1.65 }}>
              Our AI dental assistant can answer questions, check availability, and book appointments — all through a simple conversation.
            </p>
          </div>
          <Link href="/chat" className="btn btn-primary btn-lg" style={{ whiteSpace:"nowrap" }}>
            Chat with AI Assistant
          </Link>
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
          <Link href="/booking" className="btn btn-lg" style={{ background:"#fff", color:"var(--teal-700)", fontFamily:"var(--font-body)", fontWeight:600, padding:"14px 36px", borderRadius:"var(--r-lg)", border:"none" }}>
            Book Your First Visit
          </Link>
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
                {items.map(item => {
                  // Quick Links → route links
                  const routes: Record<string, string> = { Dashboard:"/dashboard", Booking:"/booking", Doctors:"/doctors", "AI Chat":"/chat" };
                  if (routes[item]) {
                    return <Link key={item} href={routes[item]} className="footer-col-item" style={{ display:"block" }}>{item}</Link>;
                  }
                  return <p key={item} className="footer-col-item">{item}</p>;
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2025 Dentala. All rights reserved.</span>
          <span className="footer-copy">Powered by AI · Built with care</span>
        </div>
      </footer>

      {/* ── FLOATING CHAT BUTTON ──────────────────────────── */}
      <Link
        href="/chat"
        className="floating-chat-btn"
        aria-label="Open AI Chat"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {chatPulse && <span className="floating-chat-pulse" />}
      </Link>
    </>
  );
}
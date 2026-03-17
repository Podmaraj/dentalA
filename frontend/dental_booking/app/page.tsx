"use client";

import { useState, useEffect, useRef } from "react";

const services = [
  { icon: "✦", title: "General Checkup", desc: "Comprehensive oral examination and cleaning", duration: "45 min", price: "₹800" },
  { icon: "◈", title: "Teeth Whitening", desc: "Professional laser whitening treatment", duration: "60 min", price: "₹3,500" },
  { icon: "⬡", title: "Orthodontics", desc: "Braces, aligners and bite correction", duration: "30 min", price: "₹1,200" },
  { icon: "◉", title: "Root Canal", desc: "Pain-free endodontic therapy", duration: "90 min", price: "₹5,000" },
  { icon: "✧", title: "Dental Implants", desc: "Permanent tooth replacement solutions", duration: "120 min", price: "₹25,000" },
  { icon: "⬢", title: "Cosmetic Dentistry", desc: "Veneers, bonding and smile design", duration: "75 min", price: "₹8,000" },
];

const doctors = [
  { name: "Dr. Priya Sharma", spec: "Orthodontist", exp: "12 yrs", slots: ["9:00", "11:00", "14:00"] },
  { name: "Dr. Arjun Mehta", spec: "Endodontist", exp: "9 yrs", slots: ["10:00", "13:00", "16:00"] },
  { name: "Dr. Neha Gupta", spec: "Cosmetic Dentist", exp: "7 yrs", slots: ["9:30", "12:00", "15:30"] },
];

const steps = [
  { num: "01", label: "Choose a service" },
  { num: "02", label: "Pick your doctor" },
  { num: "03", label: "Select time slot" },
  { num: "04", label: "Confirm booking" },
];

export default function HomePage() {
  const [activeService, setActiveService] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [booked, setBooked] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleBook = () => {
    if (activeService !== null && selectedDoctor !== null && selectedSlot) {
      setBooked(true);
      setTimeout(() => setBooked(false), 3000);
    }
  };

  return (
    <main style={{ fontFamily: "var(--font-display)", background: "var(--background)", color: "var(--foreground)", minHeight: "100vh", overflowX: "hidden" }}>

      <style>{`
        /* All colour tokens come from globals.css — no hex values here */

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        ::selection { background: var(--accent-500); color: var(--background); }

        .nav-link {
          font-family: var(--font-ui);
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--foreground-muted);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .nav-link:hover { color: var(--primary-500); }

        .service-card {
          border: 1px solid var(--border);
          padding: 32px 28px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          background: transparent;
          position: relative;
          overflow: hidden;
        }
        .service-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(30,142,136,0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        .service-card:hover::before, .service-card.active::before { opacity: 1; }
        .service-card:hover, .service-card.active {
          border-color: var(--primary-400);
          transform: translateY(-2px);
        }

        .doctor-card {
          border: 1px solid var(--border);
          padding: 28px 24px;
          cursor: pointer;
          transition: all 0.35s;
          background: var(--background-subtle);
        }
        .doctor-card:hover, .doctor-card.selected {
          border-color: var(--primary-400);
          background: var(--background-muted);
        }

        .slot-btn {
          font-family: var(--font-ui);
          font-size: 12px;
          padding: 8px 16px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--foreground);
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 0.05em;
          border-radius: var(--radius-md);
        }
        .slot-btn:hover, .slot-btn.active {
          border-color: var(--primary-400);
          color: var(--primary-500);
          background: var(--primary-50);
        }

        .cta-btn {
          font-family: var(--font-ui);
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: var(--primary-500);
          color: var(--foreground-inverse);
          border: none;
          padding: 18px 48px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
          border-radius: var(--radius-md);
        }
        .cta-btn:hover { background: var(--primary-600); transform: translateY(-1px); }
        .cta-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .outline-btn {
          font-family: var(--font-ui);
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: transparent;
          color: var(--primary-500);
          border: 1px solid var(--primary-500);
          padding: 14px 36px;
          cursor: pointer;
          transition: all 0.3s;
          border-radius: var(--radius-md);
        }
        .outline-btn:hover { background: var(--primary-50); }

        .section-label {
          font-family: var(--font-ui);
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--primary-500);
          margin-bottom: 16px;
          display: block;
        }

        .divider {
          width: 60px;
          height: 1px;
          background: var(--primary-400);
          opacity: 0.5;
        }

        .success-banner {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(-100px);
          background: var(--primary-500);
          color: var(--foreground-inverse);
          padding: 16px 40px;
          font-family: var(--font-ui);
          font-size: 12px;
          letter-spacing: 0.1em;
          transition: transform 0.5s cubic-bezier(0.23,1,0.32,1);
          z-index: 9999;
          white-space: nowrap;
          border-radius: var(--radius-lg);
        }
        .success-banner.show { transform: translateX(-50%) translateY(0); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s cubic-bezier(0.23,1,0.32,1) both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.25s; }
        .fade-up-3 { animation-delay: 0.4s; }
        .fade-up-4 { animation-delay: 0.55s; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .marquee-track {
          display: flex;
          gap: 60px;
          animation: marquee 20s linear infinite;
          white-space: nowrap;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      {/* Success Banner */}
      <div className={`success-banner${booked ? " show" : ""}`}>
        Appointment confirmed — check your email
      </div>

      {/* Navigation */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "20px 60px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: scrollY > 80 ? "1px solid var(--border)" : "1px solid transparent", background: scrollY > 80 ? "var(--nav-bg)" : "transparent", backdropFilter: scrollY > 80 ? "blur(20px)" : "none", transition: "all 0.4s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, border: "1px solid var(--primary-500)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "var(--primary-500)", fontSize: 14 }}>✦</span>
          </div>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 13, letterSpacing: "0.2em", color: "var(--primary-500)" }}>DENTALA</span>
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          {["Services", "Doctors", "Book Now", "About"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(" ", "")}`} className="nav-link">{l}</a>
          ))}
        </div>
        <button className="outline-btn" style={{ padding: "10px 24px", fontSize: "10px" }}>Emergency</button>
      </nav>

      {/* Hero */}
      <section ref={heroRef} id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", padding: "120px 60px 80px", overflow: "hidden" }}>
        {/* Decorative background grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--border-muted) 1px, transparent 1px), linear-gradient(90deg, var(--border-muted) 1px, transparent 1px)", backgroundSize: "80px 80px", pointerEvents: "none" }} />

        {/* Floating orb */}
        <div style={{ position: "absolute", right: "8%", top: "20%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(30,142,136,0.08) 0%, transparent 70%)", animation: "float 6s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "10%", top: "22%", width: 300, height: 300, border: "1px solid var(--border-brand)", borderRadius: "50%", animation: "spin-slow 30s linear infinite", pointerEvents: "none" }}>
          {[0,90,180,270].map(deg => (
            <div key={deg} style={{ position: "absolute", width: 6, height: 6, background: "var(--primary-400)", borderRadius: "50%", top: "50%", left: "50%", transformOrigin: "0 0", transform: `rotate(${deg}deg) translateX(148px) translateY(-3px)`, opacity: 0.6 }} />
          ))}
        </div>

        <div style={{ maxWidth: 700, position: "relative", zIndex: 1 }}>
          <span className="section-label fade-up fade-up-1" style={{ marginBottom: 32 }}>Premium dental care · Guwahati, Assam</span>
          <h1 className="fade-up fade-up-2" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(56px, 8vw, 96px)", fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.02em", marginBottom: 32 }}>
            Your smile,<br />
            <em style={{ fontFamily: "var(--font-display)", color: "var(--primary-500)", fontStyle: "italic", fontWeight: 400 }}>perfected.</em>
          </h1>
          <p className="fade-up fade-up-3" style={{ fontFamily: "var(--font-body)", fontSize: 18, fontWeight: 300, lineHeight: 1.8, color: "var(--foreground-muted)", maxWidth: 480, marginBottom: 48 }}>
            AI-powered appointment booking meets world-class dental care. Reserve your visit in under 60 seconds.
          </p>
          <div className="fade-up fade-up-4" style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <button className="cta-btn" onClick={() => document.getElementById("book")?.scrollIntoView({ behavior: "smooth" })}>
              Book Appointment
            </button>
            <button className="outline-btn" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>
              View Services
            </button>
          </div>

          {/* Stats row */}
          <div className="fade-up fade-up-4" style={{ display: "flex", gap: 48, marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--border)" }}>
            {[["4,200+", "Patients treated"], ["15+", "Years of care"], ["98%", "Satisfaction rate"]].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, color: "var(--primary-500)", letterSpacing: "-0.02em" }}>{val}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--foreground-subtle)", letterSpacing: "0.1em", marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "16px 0", overflow: "hidden", background: "var(--background-subtle)" }}>
        <div className="marquee-track" style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.2em", color: "var(--foreground-subtle)", textTransform: "uppercase" }}>
          {Array(8).fill(["General Dentistry", "✦", "Orthodontics", "✦", "Cosmetic", "✦", "Implants", "✦", "Root Canal", "✦", "Whitening", "✦"]).flat().map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section style={{ padding: "100px 60px", borderBottom: "1px solid var(--border)" }}>
        <span className="section-label">Process</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 700, marginBottom: 64, maxWidth: 400, color: "var(--foreground)" }}>
          Four steps to a healthier smile
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background: "var(--background)", padding: "40px 32px", position: "relative" }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 48, color: "var(--primary-100)", fontWeight: 800, lineHeight: 1, marginBottom: 20 }}>{s.num}</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 18, fontWeight: 400, color: "var(--foreground)" }}>{s.label}</div>
              <div style={{ position: "absolute", bottom: 24, right: 24, width: 32, height: 32, border: "1px solid var(--border-brand)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--primary-500)", fontSize: 14 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ padding: "100px 60px", borderBottom: "1px solid var(--border)", background: "var(--background-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56 }}>
          <div>
            <span className="section-label">Our Services</span>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 700, color: "var(--foreground)" }}>What we offer</h2>
          </div>
          <div className="divider" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border)" }}>
          {services.map((s, i) => (
            <div key={i} className={`service-card${activeService === i ? " active" : ""}`} style={{ background: "var(--background)" }} onClick={() => setActiveService(i === activeService ? null : i)}>
              <div style={{ fontSize: 24, marginBottom: 20, color: "var(--primary-500)", opacity: 0.8 }}>{s.icon}</div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600, marginBottom: 10, color: "var(--foreground)" }}>{s.title}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--foreground-muted)", lineHeight: 1.7, marginBottom: 24 }}>{s.desc}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--foreground-subtle)", letterSpacing: "0.1em" }}>{s.duration}</span>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600, color: "var(--primary-500)" }}>From {s.price}</span>
              </div>
              {activeService === i && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                  <button className="cta-btn" style={{ width: "100%", padding: "14px" }} onClick={(e) => { e.stopPropagation(); document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }}>
                    Book This Service
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" style={{ padding: "100px 60px", borderBottom: "1px solid var(--border)" }}>
        <span className="section-label">Our Team</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 700, marginBottom: 56, color: "var(--foreground)" }}>Meet your doctors</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {doctors.map((d, i) => (
            <div key={i} className={`doctor-card${selectedDoctor === i ? " selected" : ""}`} onClick={() => setSelectedDoctor(i === selectedDoctor ? null : i)}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: `1px solid ${selectedDoctor === i ? "var(--primary-400)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 24, transition: "border-color 0.3s" }}>
                {["♦", "◈", "✧"][i]}
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, marginBottom: 4, color: "var(--foreground)" }}>{d.name}</h3>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--primary-500)", letterSpacing: "0.1em", marginBottom: 16 }}>{d.spec}</p>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--foreground-subtle)", marginBottom: 24 }}>{d.exp} experience</p>

              {selectedDoctor === i && (
                <div>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.15em", color: "var(--foreground-muted)", marginBottom: 12, textTransform: "uppercase" }}>Today&apos;s Slots</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {d.slots.map(slot => (
                      <button key={slot} className={`slot-btn${selectedSlot === slot ? " active" : ""}`} onClick={(e) => { e.stopPropagation(); setSelectedSlot(slot); }}>
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

      {/* Booking Form */}
      <section id="book" style={{ padding: "100px 60px", borderBottom: "1px solid var(--border)", background: "var(--background-subtle)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <span className="section-label" style={{ display: "block", textAlign: "center" }}>Booking</span>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 700, textAlign: "center", marginBottom: 16, color: "var(--foreground)" }}>
            Reserve your visit
          </h2>
          <p style={{ textAlign: "center", color: "var(--foreground-muted)", fontFamily: "var(--font-ui)", fontSize: 12, marginBottom: 56, letterSpacing: "0.05em" }}>
            Our AI assistant will confirm your booking instantly
          </p>

          <div style={{ border: "1px solid var(--card-border)", padding: 48, background: "var(--card-bg)", borderRadius: "var(--radius-xl)", boxShadow: "var(--card-shadow)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
              {[["Full Name", "text", "Rajesh Kumar"], ["Phone Number", "tel", "+91 98765 43210"], ["Email Address", "email", "rajesh@email.com"], ["Date of Birth", "date", ""]].map(([lbl, type, ph]) => (
                <div key={lbl as string}>
                  <label style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.15em", color: "var(--foreground-muted)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>{lbl as string}</label>
                  <input
                    type={type as string}
                    placeholder={ph as string}
                    style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)", padding: "14px 16px", fontSize: 15, fontFamily: "var(--font-body)", outline: "none", transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)", borderRadius: "var(--radius-md)" }}
                    onFocus={e => { e.target.style.borderColor = "var(--input-border-focus)"; e.target.style.boxShadow = "0 0 0 3px var(--input-ring)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--input-border)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.15em", color: "var(--foreground-muted)", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Notes / Symptoms</label>
              <textarea
                placeholder="Describe any pain or concerns..."
                rows={3}
                style={{ width: "100%", background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--input-text)", padding: "14px 16px", fontSize: 15, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)", borderRadius: "var(--radius-md)" }}
                onFocus={e => { e.target.style.borderColor = "var(--input-border-focus)"; e.target.style.boxShadow = "0 0 0 3px var(--input-ring)"; }}
                onBlur={e => { e.target.style.borderColor = "var(--input-border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Booking Summary */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "20px 24px", marginBottom: 32, borderRadius: "var(--radius-lg)" }}>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.2em", color: "var(--foreground-subtle)", marginBottom: 16, textTransform: "uppercase" }}>Booking Summary</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                <div>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--foreground-subtle)", marginBottom: 4 }}>SERVICE</p>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>{activeService !== null ? services[activeService].title : "—"}</p>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--foreground-subtle)", marginBottom: 4 }}>DOCTOR</p>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>{selectedDoctor !== null ? doctors[selectedDoctor].name.split(" ").slice(0, 2).join(" ") : "—"}</p>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--foreground-subtle)", marginBottom: 4 }}>TIME</p>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: selectedSlot ? "var(--primary-500)" : "var(--foreground-subtle)" }}>{selectedSlot ?? "—"}</p>
                </div>
              </div>
            </div>

            <button className="cta-btn" style={{ width: "100%", padding: "20px", fontSize: 13 }} disabled={activeService === null || selectedDoctor === null || !selectedSlot} onClick={handleBook}>
              Confirm Appointment
            </button>
            <p style={{ textAlign: "center", fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--foreground-subtle)", marginTop: 16, letterSpacing: "0.1em" }}>
              Free cancellation up to 24 hours before your visit
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "60px 60px 40px", borderTop: "1px solid var(--border)", background: "var(--background-muted)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, border: "1px solid var(--primary-500)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--primary-500)", fontSize: 14 }}>✦</span>
              </div>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 13, letterSpacing: "0.2em", color: "var(--primary-500)" }}>DENTALA</span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--foreground-muted)", maxWidth: 260, lineHeight: 1.8 }}>
              Premium dental care powered by AI-assisted booking. Guwahati, Assam.
            </p>
          </div>
          <div style={{ display: "flex", gap: 60 }}>
            {[["Services", ["General", "Orthodontics", "Cosmetic", "Implants"]], ["Contact", ["GS Road, Guwahati", "+91 361 000 0000", "hello@dentala.in", "Mon–Sat 9–7"]]].map(([heading, items]) => (
              <div key={heading as string}>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.2em", color: "var(--primary-500)", marginBottom: 20, textTransform: "uppercase" }}>{heading as string}</p>
                {(items as string[]).map(item => (
                  <p key={item} style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--foreground-muted)", marginBottom: 10, lineHeight: 1.6 }}>{item}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", justifyContent: "space-between" }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--foreground-subtle)", letterSpacing: "0.1em" }}>© 2025 DENTALA. ALL RIGHTS RESERVED.</p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--foreground-subtle)", letterSpacing: "0.1em" }}>POWERED BY AI · BUILT WITH CARE</p>
        </div>
      </footer>

    </main>
  );
}
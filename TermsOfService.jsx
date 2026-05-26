import { useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 760, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=28,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const S = ({ children }) => <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: "32px 0 12px", lineHeight: 1.25 }}>{children}</h2>;
const P = ({ children }) => <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.7, margin: "0 0 14px" }}>{children}</p>;

export default function TermsOfService() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}`}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(6,19,37,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/subscribe" style={{ color: "#fff", fontSize: 12, fontWeight: 600, background: ELECTRIC, padding: "7px 16px", borderRadius: 5 }}>Subscribe</a>
        </div>
      </nav>

      <section style={{ background: DEEP, padding: "72px 28px 24px" }}>
        <div style={WRAP}>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 4px" }}>Terms of Service</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Last updated: May 2026</p>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "32px 28px 64px" }}>
        <div style={WRAP}>
          <P>These terms govern your use of contactcentercx.com ("the Site"), operated by The Center of CX ("we," "us," "our"). By accessing or using the Site, you agree to these terms.</P>

          <S>Use of the site</S>
          <P>The Site provides CX and contact center technology intelligence, interactive tools, vendor assessments, and educational content for professional use. You may access and use the Site for your own professional and organizational purposes. You may not scrape, crawl, or systematically download content from the Site for reproduction, resale, or redistribution without our written permission.</P>

          <S>Interactive tools</S>
          <P>Our interactive tools (calculators, assessments, diagnostics, and builders) are provided for informational and planning purposes. Tool outputs are based on the inputs you provide and our independently developed models and methodologies. They are not a substitute for professional consulting, legal, financial, or technical advice specific to your situation.</P>
          <P>We make reasonable efforts to ensure tool calculations are accurate, but we do not warrant that any tool output is error-free or appropriate for your specific operational decisions. You are responsible for validating tool outputs against your own data and judgment before making business decisions based on them.</P>

          <S>Vendor assessments</S>
          <P>Vendor scores, tier classifications, competitive intelligence, and assessments published on this Site are independently developed based on our published methodologies. No vendor pays to appear on this Site, to receive a higher score, or to influence their assessment. Our assessments represent our professional analysis at the time of publication and may be updated as market conditions and vendor capabilities change.</P>
          <P>Vendor assessments are not endorsements or guarantees of vendor performance. They are analytical tools designed to help CX professionals make informed decisions. Your vendor selection should include your own evaluation, reference checks, and due diligence beyond what this Site provides.</P>

          <S>User-submitted content</S>
          <P>When you submit information through our tools, forms, or review system, you grant us permission to use that information as described in our <a href="/privacy" style={{ color: ELECTRIC, fontWeight: 600 }}>Privacy Policy</a>. For community reviews, you represent that your review reflects your genuine professional experience and is not submitted on behalf of a vendor for the purpose of manipulation.</P>

          <S>Downloadable reports</S>
          <P>Reports generated by our tools are for your internal professional use. You may share them within your organization and with vendors you are evaluating. You may not sell, redistribute, or publish reports as your own work product without attribution. Reports include our branding and are generated from our proprietary models.</P>

          <S>Intellectual property</S>
          <P>All content on this Site — including text, scoring methodologies, tool designs, frameworks, assessments, and visual design — is owned by The Center of CX and protected by applicable intellectual property laws. You may reference and cite our content with attribution. You may not reproduce substantial portions of our content, methodologies, or tool designs for commercial use.</P>

          <S>Buyer guides and research</S>
          <P>Buyer guides, research articles, and frameworks provided through this Site are for professional educational use. They may be shared within your organization. They may not be redistributed, resold, or published externally without our written permission.</P>

          <S>Advisory services</S>
          <P>Advisory services referenced on this Site are separate engagements governed by their own agreements. Nothing on this Site constitutes an advisory engagement or creates a client relationship. Advisory availability, scope, and pricing are determined on a case-by-case basis.</P>

          <S>Limitation of liability</S>
          <P>The Site and all content, tools, and services are provided "as is" without warranties of any kind, express or implied. We are not liable for any damages arising from your use of the Site, including but not limited to direct, indirect, incidental, or consequential damages. This includes decisions made based on tool outputs, vendor assessments, or any other content on the Site.</P>
          <P>Our total liability for any claim related to the Site shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.</P>

          <S>Indemnification</S>
          <P>You agree to indemnify and hold harmless The Center of CX from any claims, damages, or expenses arising from your use of the Site, your violation of these terms, or your violation of any third-party rights.</P>

          <S>Governing law</S>
          <P>These terms are governed by the laws of the State of Arizona, without regard to conflict of law principles. Any disputes shall be resolved in the courts located in Maricopa County, Arizona.</P>

          <S>Changes to these terms</S>
          <P>We may update these terms from time to time. The "Last updated" date at the top reflects the most recent revision. Continued use of the Site after changes constitutes acceptance of the updated terms.</P>

          <S>Contact</S>
          <P>Questions about these terms can be directed to: <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>contactcentercx.com/contact</a></P>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "32px 28px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={22} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

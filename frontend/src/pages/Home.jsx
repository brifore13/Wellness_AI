import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import Auth from '../components/Auth';
import {
  FaCommentDots,
  FaCalendar,
  FaBars,
  FaLock,
  FaChevronRight,
  FaRunning,
  FaHeartbeat,
} from 'react-icons/fa';

const features = [
  {
    icon: FaCommentDots,
    title: 'Ask Benny',
    description: 'Performance Q&A powered by AI. Get specific, protocol-level answers on training, nutrition, recovery, and biomarkers — not generic advice.',
    cta: 'Start chatting',
    path: '/chat',
    available: true,
  },
  {
    icon: FaCalendar,
    title: 'Daily Check-In',
    description: 'Log your nutrition, fitness, stress, and sleep each day. Benny analyzes your inputs and surfaces the one thing most limiting your performance today.',
    cta: 'Check in',
    path: '/daily-checkin',
    available: true,
  },
  {
    icon: FaBars,
    title: 'Wellness Priorities',
    description: 'Rank your top 5 health goals. Benny uses your priorities to personalize recommendations across every feature in the app.',
    cta: 'Set priorities',
    path: '/wellness-priorities',
    available: true,
  },
  {
    icon: FaRunning,
    title: 'Build a Plan',
    description: 'Input your goals, baseline fitness, and available days. Benny generates a structured week-by-week training protocol — not a chat response, a real plan.',
    cta: 'Coming soon',
    path: null,
    available: false,
  },
];

// ─── Feature Card ─────────────────────────────────────────────
const FeatureCard = ({ feature }) => {
  const navigate = useNavigate();
  const { session, guestMode, enterGuestMode } = useSession();

  const handleClick = () => {
    if (!feature.available) return;
    if (!session && !guestMode) enterGuestMode();
    navigate(feature.path);
  };

  const Icon = feature.icon;

  return (
    <div
      onClick={handleClick}
      className={`
        group flex flex-col gap-4 p-6 rounded-2xl
        bg-wa-card border border-wa-accent/20
        transition-all duration-200 ease-in-out
        ${feature.available
          ? 'cursor-pointer hover:-translate-y-1 hover:border-wa-accent-lt hover:shadow-lg'
          : 'opacity-55 cursor-default'}
      `}
    >
      {/* Icon row */}
      <div className="flex items-center justify-between">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${feature.available
            ? 'bg-wa-accent/20 border border-wa-accent-lt/20'
            : 'bg-wa-bg/60'}
        `}>
          <Icon
            size={18}
            className={feature.available ? 'text-wa-accent-lt' : 'text-wa-dim'}
          />
        </div>

        {!feature.available && (
          <span className="flex items-center gap-1 text-[10px] text-wa-dim bg-wa-bg/80 border border-wa-accent/20 px-2 py-1 rounded-full">
            <FaLock size={9} />
            Coming soon
          </span>
        )}
      </div>

      {/* Text */}
      <div>
        <h3 className={`text-[15px] font-semibold mb-1.5 ${feature.available ? 'text-wa-text' : 'text-wa-dim'}`}>
          {feature.title}
        </h3>
        <p className="text-[12.5px] text-wa-dim leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-2">
        {feature.available ? (
          <span className="flex items-center gap-1 text-[13px] font-medium text-wa-accent-lt group-hover:gap-2 transition-all duration-200">
            {feature.cta}
            <FaChevronRight size={11} />
          </span>
        ) : (
          <span className="text-[13px] text-wa-dim opacity-50">
            {feature.cta}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Home Page ────────────────────────────────────────────────
function Home() {
  const { session, guestMode, enterGuestMode } = useSession();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleGetStarted = () => {
    if (session) navigate('/chat');
    else setShowAuth(true);
  };

  const handleContinueAsGuest = () => {
    if (!guestMode) enterGuestMode();
    navigate('/chat');
  };

  return (
    <div className="min-h-screen flex flex-col bg-wa-bg" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(136,189,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(136,189,242,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-[18px] border-b border-wa-accent/20"
        style={{ backgroundColor: 'rgba(56,73,89,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center bg-wa-accent/20 border border-wa-accent-lt/25">
            <FaHeartbeat size={16} className="text-wa-accent-lt" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-wa-text">
            Wellness AI
          </span>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            <button
              onClick={() => navigate('/chat')}
              className="text-[13px] text-wa-dim hover:text-wa-text transition-colors duration-150 bg-transparent border-none cursor-pointer"
            >
              Go to app →
            </button>
          ) : (
            <>
              {/* Try as guest */}
              <button
                onClick={handleContinueAsGuest}
                className="text-[13px] text-wa-dim hover:text-wa-text transition-colors duration-150 bg-transparent border-none cursor-pointer"
              >
                Try as guest
              </button>

              {/* Sign in */}
              <button
                onClick={() => setShowAuth(true)}
                className="text-[13px] font-medium px-[18px] py-2 rounded-lg cursor-pointer
                           bg-wa-accent text-white border-none
                           hover:bg-wa-accent-lt hover:text-[#1a2530]
                           transition-all duration-150"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-6 pt-[110px] pb-16">

        {/* Hero */}
        <div
          className="text-center max-w-[620px] mb-[72px]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.4px] uppercase px-3 py-1 rounded-full mb-6 text-wa-accent-lt border border-wa-accent-lt/30 bg-wa-accent-lt/10">
            <span className="w-1.5 h-1.5 rounded-full bg-wa-accent-lt animate-pulse inline-block" />
            Performance optimization
          </div>

          {/* Headline */}
          <h1
            className="text-[50px] font-bold tracking-[-1.5px] leading-[1.12] mb-5 text-wa-text"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Train smarter.<br />
            <span className="text-wa-accent-pale">Recover better.</span>
          </h1>

          {/* Subheading */}
          <p className="text-wa-dim text-[16px] leading-[1.75] mb-8">
            Benny is a performance AI built for optimizers — people who track data,
            want protocol-level answers, and don't need encouragement.
            Ask anything. Build your plan. Log your progress.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Get started free */}
            <button
              onClick={handleGetStarted}
              className="font-semibold text-[14px] px-[26px] py-3 rounded-lg cursor-pointer border-none
                         bg-wa-accent text-white
                         hover:bg-wa-accent-lt hover:text-[#1a2530]
                         transition-all duration-150"
            >
              Get started free
            </button>

            {/* Try without signing up */}
            {!session && (
              <button
                onClick={handleContinueAsGuest}
                className="font-medium text-[14px] px-[26px] py-3 rounded-lg cursor-pointer
                           bg-transparent text-wa-accent-lt border border-wa-accent-lt/25
                           hover:border-wa-accent-lt/70 hover:text-wa-text
                           transition-all duration-150"
              >
                Try without signing up
              </button>
            )}
          </div>
        </div>

        {/* Cards */}
        <div
          className="w-full max-w-[980px]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
          }}
        >
          <p className="text-center text-[10px] tracking-[0.18em] uppercase text-wa-dim mb-5">
            What Benny can do
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <p
          className="text-wa-dim/50 text-[11px] text-center mt-[52px]"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.3s',
          }}
        >
          Built by Brianna Foreman · React · FastAPI · PostgreSQL · OpenAI
        </p>
      </main>

      <Auth isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

export default Home;

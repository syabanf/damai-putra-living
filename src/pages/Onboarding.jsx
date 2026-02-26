import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, ChevronRight, Globe } from 'lucide-react';

const SLIDES = [
  {
    headline: 'Endless Lifestyle\nExperiences',
    subheadline: 'Explore dining, events, and lifestyle\ndestinations around you.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=90',
  },
  {
    headline: 'Smart Living,\nSimplified',
    subheadline: 'Access property services, permits, and\ntownship facilities in one app.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=90',
  },
  {
    headline: 'Exclusive Benefits\n& Rewards',
    subheadline: 'Enjoy rewards, promos, and exclusive\nresident privileges.',
    image: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&q=90',
  },
];

const LANGS = ['EN', 'ID'];

export default function Onboarding() {
  const [slide, setSlide] = useState(0);
  const [lang, setLang] = useState('EN');
  const [langOpen, setLangOpen] = useState(false);

  const handleNext = () => {
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1);
    } else {
      base44.auth.redirectToLogin(createPageUrl('Home'));
    }
  };

  const handleSkip = () => {
    base44.auth.redirectToLogin(createPageUrl('Home'));
  };

  const current = SLIDES[slide];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background image with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${current.image}')` }}
        />
      </AnimatePresence>

      {/* Dark gradient overlay — stronger at bottom */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.75) 70%, rgba(0,0,0,0.95) 100%)' }}
      />

      {/* TOP BAR */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-2">
        {/* Logo */}
        <div>
          <p className="text-white/70 text-[10px] tracking-widest uppercase">Damai Putra</p>
          <p className="text-white font-bold text-base leading-tight" style={{ letterSpacing: '-0.01em' }}>Living</p>
        </div>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/25 text-white/80 text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
          >
            <Globe className="w-3 h-3" />
            {lang}
          </button>
          {langOpen && (
            <div className="absolute right-0 top-9 rounded-xl overflow-hidden shadow-xl border border-white/10"
              style={{ background: 'rgba(20,20,20,0.9)', backdropFilter: 'blur(12px)' }}>
              {LANGS.map(l => (
                <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                  className={`block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${l === lang ? 'text-white' : 'text-white/50 hover:text-white'}`}>
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SPACER — pushes content down */}
      <div className="flex-1" />

      {/* BOTTOM CONTENT */}
      <div className="relative z-10 px-6 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <h2 className="text-4xl font-bold text-white leading-tight mb-3"
              style={{ whiteSpace: 'pre-line', letterSpacing: '-0.02em' }}>
              {current.headline}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8"
              style={{ whiteSpace: 'pre-line' }}>
              {current.subheadline}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Carousel dots */}
        <div className="flex gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="h-1.5 rounded-full transition-all duration-400"
              style={{
                width: i === slide ? 28 : 6,
                background: i === slide ? '#1F86C7' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>

        {/* CTA Buttons */}
        <button
          onClick={handleNext}
          className="w-full h-14 rounded-2xl font-semibold text-base text-white flex items-center justify-center gap-2 mb-3"
          style={{ background: '#1F86C7', boxShadow: '0 8px 28px rgba(31,134,199,0.40)' }}
        >
          {slide === SLIDES.length - 1 ? (
            <> Get Started <ArrowRight className="w-5 h-5" /> </>
          ) : (
            <> Continue <ChevronRight className="w-5 h-5" /> </>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="w-full h-11 rounded-2xl text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
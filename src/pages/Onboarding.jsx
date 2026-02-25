import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Building2, Shield, FileCheck, ArrowRight, ChevronRight } from 'lucide-react';

const slides = [
  {
    icon: Building2,
    title: "Manage Your Unit",
    description: "Register and manage your property unit with ease. Track ownership status and unit details all in one place.",
    bg: "#8A8076",
    shadow: "rgba(138,128,118,0.35)"
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Your data is protected with enterprise-grade security. Verified units ensure a trusted community.",
    bg: "#6e6560",
    shadow: "rgba(110,101,96,0.35)"
  },
  {
    icon: FileCheck,
    title: "Digital Permits",
    description: "Submit renovation, moving, and event permits digitally. Track approvals in real-time.",
    bg: "#5a524e",
    shadow: "rgba(90,82,78,0.35)"
  }
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate(createPageUrl('Register'));
    }
  };

  const handleSkip = () => {
    navigate(createPageUrl('Login'));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-end p-6">
        <button
          onClick={handleSkip}
          className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <div
              className="w-32 h-32 rounded-3xl flex items-center justify-center mb-12"
              style={{
                backgroundColor: slides[currentSlide].bg,
                boxShadow: `0 20px 40px ${slides[currentSlide].shadow}`
              }}
            >
              {React.createElement(slides[currentSlide].icon, { className: "w-16 h-16 text-white" })}
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              {slides[currentSlide].title}
            </h2>

            <p className="text-slate-500 text-base leading-relaxed max-w-xs">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-8 pb-12">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8' : 'w-2 bg-slate-200'
              }`}
              style={index === currentSlide ? { backgroundColor: '#8A8076' } : {}}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full h-14 text-white rounded-2xl font-semibold text-base"
          style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 8px 24px rgba(138,128,118,0.35)' }}
        >
          {currentSlide === slides.length - 1 ? (
            <>Get Started <ArrowRight className="w-5 h-5 ml-2" /></>
          ) : (
            <>Continue <ChevronRight className="w-5 h-5 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
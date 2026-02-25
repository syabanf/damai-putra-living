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
    color: "from-teal-500 to-teal-600"
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Your data is protected with enterprise-grade security. Verified units ensure a trusted community.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: FileCheck,
    title: "Digital Permits",
    description: "Submit renovation, moving, and event permits digitally. Track approvals in real-time.",
    color: "from-emerald-500 to-emerald-600"
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
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center mb-12 shadow-lg shadow-teal-200/50`}>
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
                index === currentSlide ? 'w-8 bg-teal-600' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="w-full h-14 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-2xl font-semibold text-base shadow-lg shadow-teal-200/50"
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
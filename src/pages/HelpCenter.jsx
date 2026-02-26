import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, MessageCircle, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    category: 'Unit Registration',
    items: [
      { q: 'How do I register my unit?', a: 'Go to My Unit → tap "Register Unit", fill in your property details, upload a supporting document (e.g. AJB or IMB), and submit. Our team will review and approve within 2–3 business days.' },
      { q: 'What documents are required for unit registration?', a: 'You need a valid ownership document such as AJB (Akta Jual Beli), SHM, or SHGB. For tenants, a rental agreement signed by the owner is required.' },
      { q: 'How long does unit approval take?', a: 'Unit verification typically takes 2–3 business days. You will receive a notification once your unit status is updated.' },
    ]
  },
  {
    category: 'Permits & Services',
    items: [
      { q: 'How do I submit a permit application?', a: 'Navigate to Permits → tap "New Application", select your unit, choose the permit type, fill in the required details, and submit. You can track the progress in real-time.' },
      { q: 'What types of permits are available?', a: 'Available permits include: Activity Permit (Izin Kegiatan), Minor & Major Renovation, Land Development (Kavling), Excavation, Move-In / Move-Out, and Contractor Access.' },
      { q: 'How can I check my permit status?', a: 'Open the Permits page and tap on any permit card to see the detailed status, workflow progress, and management notes.' },
    ]
  },
  {
    category: 'App & Account',
    items: [
      { q: 'How do I update my profile information?', a: 'Profile information like your full name and email is managed through your account settings. Contact management if you need to update your registered email.' },
      { q: 'What should I do if I forget my password?', a: 'On the login screen, tap "Forgot Password" and enter your registered email address. You will receive a reset link shortly.' },
      { q: 'How do I enable notifications?', a: 'Go to Profile → Notifications to manage your notification preferences. Make sure your device allows notifications for the Damai Putra app.' },
    ]
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between p-4 text-left gap-3">
        <p className="text-sm font-semibold text-slate-700 leading-snug">{q}</p>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="px-4 pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenter() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F4F5F7' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-200 bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <h1 className="font-bold text-xl text-slate-800">Help Center</h1>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-5 rounded-2xl p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #8A7F73, #5a524e)' }}>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-base">How can we help?</p>
          <p className="text-white/70 text-xs mt-0.5">Browse FAQs or contact our support team</p>
        </div>
      </div>

      {/* FAQs */}
      <div className="px-4 mt-5 space-y-4">
        {faqs.map(section => (
          <div key={section.category}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{section.category}</p>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {section.items.map(item => <AccordionItem key={item.q} q={item.q} a={item.a} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="px-4 mt-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Still need help?</p>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <a href="https://wa.me/628001234567" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border-b border-slate-100 active:bg-slate-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">WhatsApp Support</p>
              <p className="text-xs text-slate-400">Chat with our team</p>
            </div>
          </a>
          <a href="tel:+628001234567"
            className="flex items-center gap-4 p-4 border-b border-slate-100 active:bg-slate-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
              <Phone className="w-5 h-5 text-[#1F86C7]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Call Center</p>
              <p className="text-xs text-slate-400">0800-1234-567 (Free)</p>
            </div>
          </a>
          <a href="mailto:support@damaiputra.com"
            className="flex items-center gap-4 p-4 active:bg-slate-50">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Email Support</p>
              <p className="text-xs text-slate-400">support@damaiputra.com</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
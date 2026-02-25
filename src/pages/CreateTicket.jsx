import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, FileCheck, MessageSquare, Wrench, Wrench as WrenchIcon, 
  Truck, Calendar, Users, Check, Upload, X, FileText, Clock, User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  { id: 'permit', label: 'Digital Permit', icon: FileCheck, color: 'bg-blue-500' },
  { id: 'complaint', label: 'Complaint', icon: MessageSquare, color: 'bg-red-500' },
  { id: 'general_service', label: 'General Service', icon: WrenchIcon, color: 'bg-purple-500' },
];

const PERMIT_TYPES = [
  { id: 'renovation', label: 'Renovation Permit', icon: Wrench, description: 'For construction or renovation work' },
  { id: 'moving_in', label: 'Moving In Permit', icon: Truck, description: 'For moving into the unit' },
  { id: 'moving_out', label: 'Moving Out Permit', icon: Truck, description: 'For moving out of the unit' },
  { id: 'event', label: 'Event Permit', icon: Calendar, description: 'For hosting events in common areas' },
  { id: 'contractor_access', label: 'Contractor Access', icon: Users, description: 'For allowing contractors to enter' },
];

export default function CreateTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get('type');
  
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(preselectedType ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showReview, setShowReview] = useState(false);
  
  const [formData, setFormData] = useState({
    category: preselectedType ? 'permit' : '',
    permit_type: preselectedType || '',
    activity_date: '',
    activity_time: '',
    description: '',
    visitor_name: '',
    visitor_phone: '',
    visitor_id: '',
    document_urls: []
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        // Not logged in
      }
    };
    loadUser();
  }, []);

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const approvedUnit = units.find(u => u.status === 'approved');

  const createTicketMutation = useMutation({
    mutationFn: (data) => base44.entities.Ticket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      navigate(createPageUrl('TicketSubmitted'));
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setUploadedFiles(prev => [...prev, { name: file.name, url: file_url }]);
        setFormData(prev => ({ 
          ...prev, 
          document_urls: [...prev.document_urls, file_url] 
        }));
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    
    setLoading(false);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      document_urls: prev.document_urls.filter((_, i) => i !== index)
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData({ ...formData, category: categoryId });
    if (categoryId === 'permit') {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handlePermitTypeSelect = (typeId) => {
    setFormData({ ...formData, permit_type: typeId });
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    await createTicketMutation.mutateAsync({
      ...formData,
      unit_id: approvedUnit?.id,
      unit_number: approvedUnit?.unit_number,
      tower: approvedUnit?.tower,
      property_name: approvedUnit?.property_name,
      user_email: user?.email,
      status: 'open'
    });
  };

  const needsVisitorInfo = ['contractor_access', 'event'].includes(formData.permit_type);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-4 border-b border-slate-100">
        <button
          onClick={() => {
            if (showReview) {
              setShowReview(false);
            } else if (step > 1) {
              setStep(step - 1);
            } else {
              navigate(-1);
            }
          }}
          className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Create Ticket</h1>
          <p className="text-sm text-slate-500">
            {step === 1 ? 'Choose category' : 
             step === 2 ? 'Select permit type' : 
             'Fill in details'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? 'bg-teal-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Category */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">What do you need?</h2>
                <p className="text-slate-500 text-sm mt-1">Select a ticket category</p>
              </div>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 flex items-center gap-4 transition-all"
                >
                  <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center`}>
                    <cat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">{cat.label}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 2: Permit Type */}
          {step === 2 && formData.category === 'permit' && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Permit Type</h2>
                <p className="text-slate-500 text-sm mt-1">What kind of permit do you need?</p>
              </div>

              {PERMIT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handlePermitTypeSelect(type.id)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    formData.permit_type === type.id
                      ? 'border-stone-400 bg-stone-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formData.permit_type === type.id ? 'bg-teal-500' : 'bg-slate-100'
                  }`}>
                    <type.icon className={`w-6 h-6 ${
                      formData.permit_type === type.id ? 'text-white' : 'text-slate-500'
                    }`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-800">{type.label}</p>
                    <p className="text-sm text-slate-500">{type.description}</p>
                  </div>
                  {formData.permit_type === type.id && (
                    <Check className="w-5 h-5" style={{ color: '#8A8076' }} />
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 3: Details Form */}
          {step === 3 && !showReview && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5 pb-32"
            >
              {/* Auto-filled Unit Info */}
              {approvedUnit && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Unit Information</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Unit</span>
                    <span className="text-sm font-medium text-slate-800">{approvedUnit.unit_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Property</span>
                    <span className="text-sm font-medium text-slate-800">{approvedUnit.property_name}</span>
                  </div>
                  {approvedUnit.tower && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Tower</span>
                      <span className="text-sm font-medium text-slate-800">{approvedUnit.tower}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Activity Date</Label>
                  <Input
                    type="date"
                    value={formData.activity_date}
                    onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Time</Label>
                  <Input
                    type="time"
                    value={formData.activity_time}
                    onChange={(e) => setFormData({ ...formData, activity_time: e.target.value })}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Description</Label>
                <Textarea
                  placeholder="Describe your request in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px] rounded-xl resize-none"
                />
              </div>

              {needsVisitorInfo && (
                <>
                  <div className="border-t border-slate-100 pt-5">
                    <p className="text-sm font-semibold text-slate-800 mb-4">
                      {formData.permit_type === 'contractor_access' ? 'Contractor Details' : 'Visitor Details'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Name</Label>
                    <Input
                      placeholder="Enter name"
                      value={formData.visitor_name}
                      onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.visitor_phone}
                      onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">ID Number</Label>
                    <Input
                      placeholder="Enter ID number"
                      value={formData.visitor_id}
                      onChange={(e) => setFormData({ ...formData, visitor_id: e.target.value })}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </>
              )}

              {/* File Upload */}
              <div className="space-y-4">
                <Label className="text-slate-700 font-medium">Supporting Documents</Label>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-50 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-teal-600" />
                          <span className="text-sm text-slate-700">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="block cursor-pointer">
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-teal-400 hover:bg-teal-50/50 transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 text-sm">Upload Documents</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </motion.div>
          )}

          {/* Review */}
          {showReview && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 pb-32"
            >
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-slate-800">Review Submission</h2>
                <p className="text-slate-500 text-sm mt-1">Confirm your request details</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Category</span>
                  <span className="text-slate-800 text-sm font-medium capitalize">{formData.category}</span>
                </div>
                {formData.permit_type && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Permit Type</span>
                    <span className="text-slate-800 text-sm font-medium capitalize">
                      {formData.permit_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Unit</span>
                  <span className="text-slate-800 text-sm font-medium">{approvedUnit?.unit_number}</span>
                </div>
                {formData.activity_date && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Date</span>
                    <span className="text-slate-800 text-sm font-medium">
                      {new Date(formData.activity_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {formData.activity_time && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Time</span>
                    <span className="text-slate-800 text-sm font-medium">{formData.activity_time}</span>
                  </div>
                )}
              </div>

              {formData.description && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-500 text-sm mb-2">Description</p>
                  <p className="text-slate-800 text-sm">{formData.description}</p>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-500 text-sm mb-2">Documents ({uploadedFiles.length})</p>
                  {uploadedFiles.map((file, i) => (
                    <p key={i} className="text-slate-800 text-sm">{file.name}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      {step === 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6">
          <Button
            onClick={() => {
              if (showReview) {
                handleSubmit();
              } else {
                setShowReview(true);
              }
            }}
            disabled={loading}
            className="w-full h-14 text-white rounded-2xl font-semibold text-base"
            style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 8px 24px rgba(138,128,118,0.35)' }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : showReview ? (
              'Submit Request'
            ) : (
              'Review Submission'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Building2, Upload, FileText, User, Home as HomeIcon,
  Check, AlertCircle, ChevronDown, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROPERTIES = [
  { id: 'damai-putra-1', name: 'Damai Putra Residence 1', towers: ['A', 'B', 'C'] },
  { id: 'damai-putra-2', name: 'Damai Putra Residence 2', towers: ['D', 'E'] },
  { id: 'damai-putra-3', name: 'Damai Putra Business Park', towers: [] },
];

export default function AddUnit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    property_name: '',
    tower: '',
    unit_number: '',
    ownership_status: '',
    document_url: '',
    agree_terms: false
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

  const selectedProperty = PROPERTIES.find(p => p.name === formData.property_name);

  const createUnitMutation = useMutation({
    mutationFn: (data) => base44.entities.Unit.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      navigate(createPageUrl('UnitSubmitted'));
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, url: file_url });
      setFormData({ ...formData, document_url: file_url });
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setLoading(false);
  };

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.property_name) newErrors.property_name = 'Please select a property';
      if (selectedProperty?.towers.length > 0 && !formData.tower) {
        newErrors.tower = 'Please select a tower';
      }
      if (!formData.unit_number) newErrors.unit_number = 'Please enter unit number';
    } else if (step === 2) {
      if (!formData.ownership_status) newErrors.ownership_status = 'Please select ownership status';
    } else if (step === 3) {
      if (!formData.agree_terms) newErrors.agree_terms = 'Please agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowConfirmation(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    await createUnitMutation.mutateAsync({
      ...formData,
      status: 'pending',
      user_email: user?.email,
      user_name: user?.full_name
    });
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: 'linear-gradient(160deg, #f5f3f0 0%, #ece8e3 50%, #e8e2db 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-5 rounded-b-3xl" style={{ background: 'linear-gradient(150deg, #8A8076 0%, #6e6560 45%, #3d3733 100%)' }}>
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Register Unit</h1>
            <p className="text-sm text-white/50">Step {step} of 3</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{ backgroundColor: s <= step ? '#fff' : 'rgba(255,255,255,0.2)' }}
            />
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="px-5 pt-5">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)' }}>
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Unit Information</h2>
                <p className="text-slate-500 text-sm mt-1">Select your property details</p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Property Name</Label>
                <Select
                  value={formData.property_name}
                  onValueChange={(value) => setFormData({ ...formData, property_name: value, tower: '' })}
                >
                  <SelectTrigger className={`h-14 rounded-xl ${errors.property_name ? 'border-red-300' : ''}`}>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTIES.map((prop) => (
                      <SelectItem key={prop.id} value={prop.name}>
                        {prop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.property_name && <p className="text-red-500 text-xs">{errors.property_name}</p>}
              </div>

              {selectedProperty?.towers.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Tower</Label>
                  <Select
                    value={formData.tower}
                    onValueChange={(value) => setFormData({ ...formData, tower: value })}
                  >
                    <SelectTrigger className={`h-14 rounded-xl ${errors.tower ? 'border-red-300' : ''}`}>
                      <SelectValue placeholder="Select tower" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProperty.towers.map((tower) => (
                        <SelectItem key={tower} value={tower}>
                          Tower {tower}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tower && <p className="text-red-500 text-xs">{errors.tower}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Unit Number</Label>
                <Input
                  placeholder="e.g., 12A, 0501"
                  value={formData.unit_number}
                  onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                  className={`h-14 rounded-xl ${errors.unit_number ? 'border-red-300' : ''}`}
                />
                {errors.unit_number && <p className="text-red-500 text-xs">{errors.unit_number}</p>}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)' }}>
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Ownership Details</h2>
                <p className="text-slate-500 text-sm mt-1">Confirm your ownership status</p>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">Ownership Status</Label>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, ownership_status: 'owner' })}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all backdrop-blur-xl ${
                    formData.ownership_status === 'owner'
                      ? 'border-amber-400 bg-amber-50/80'
                      : 'border-white/80 bg-white/70 hover:bg-white/90'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formData.ownership_status === 'owner' ? 'bg-amber-500' : 'bg-slate-100'
                  }`}>
                    <HomeIcon className={`w-6 h-6 ${
                      formData.ownership_status === 'owner' ? 'text-white' : 'text-slate-500'
                    }`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-800">Owner</p>
                    <p className="text-sm text-slate-500">I own this unit</p>
                  </div>
                  {formData.ownership_status === 'owner' && (
                    <Check className="w-5 h-5" style={{ color: '#8A8076' }} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, ownership_status: 'tenant' })}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all backdrop-blur-xl ${
                    formData.ownership_status === 'tenant'
                      ? 'border-blue-400 bg-blue-50/80'
                      : 'border-white/80 bg-white/70 hover:bg-white/90'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formData.ownership_status === 'tenant' ? 'bg-blue-500' : 'bg-slate-100'
                  }`}>
                    <User className={`w-6 h-6 ${
                      formData.ownership_status === 'tenant' ? 'text-white' : 'text-slate-500'
                    }`} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-800">Tenant</p>
                    <p className="text-sm text-slate-500">I am renting this unit</p>
                  </div>
                  {formData.ownership_status === 'tenant' && (
                    <Check className="w-5 h-5" style={{ color: '#8A8076' }} />
                  )}
                </button>
                
                {errors.ownership_status && <p className="text-red-500 text-xs">{errors.ownership_status}</p>}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)' }}>
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Supporting Document</h2>
                <p className="text-slate-500 text-sm mt-1">Upload proof of ownership (optional)</p>
              </div>

              <div className="space-y-4">
                {uploadedFile ? (
                  <div className="p-4 bg-white/70 rounded-xl border border-white/80 backdrop-blur-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f5f3f1' }}>
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{uploadedFile.name}</p>
                        <p className="text-xs text-slate-500">Uploaded successfully</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setFormData({ ...formData, document_url: '' });
                      }}
                      className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="p-8 border-2 border-dashed border-stone-300/70 rounded-xl text-center hover:border-stone-400 hover:bg-white/50 bg-white/30 backdrop-blur-sm transition-colors">
                      <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 font-medium">Upload Document</p>
                      <p className="text-slate-400 text-sm mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}

                <div className="bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl p-4">
                  <p className="text-slate-700 text-sm">
                    <strong>Accepted documents:</strong>
                  </p>
                  <ul className="text-slate-500 text-sm mt-2 space-y-1">
                    <li>• Certificate of ownership</li>
                    <li>• Rental agreement</li>
                    <li>• Unit purchase receipt</li>
                  </ul>
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <Checkbox
                    id="terms"
                    checked={formData.agree_terms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agree_terms: checked })}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                    I confirm that the information provided is accurate and I agree to the{' '}
                    <span className="font-medium" style={{ color: '#8A8076' }}>Terms of Service</span> and{' '}
                    <span className="font-medium" style={{ color: '#8A8076' }}>Privacy Policy</span>
                  </label>
                </div>
                {errors.agree_terms && <p className="text-red-500 text-xs">{errors.agree_terms}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6">
        <Button
          onClick={handleNext}
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
          ) : step === 3 ? (
            'Submit Registration'
          ) : (
            'Continue'
          )}
        </Button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f5f3f1' }}>
                  <AlertCircle className="w-8 h-8" style={{ color: '#8A8076' }} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Confirm Submission</h3>
                <p className="text-slate-500 text-sm mt-2">
                  Please review your unit registration details before submitting.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Property</span>
                  <span className="text-slate-800 text-sm font-medium">{formData.property_name}</span>
                </div>
                {formData.tower && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Tower</span>
                    <span className="text-slate-800 text-sm font-medium">{formData.tower}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Unit Number</span>
                  <span className="text-slate-800 text-sm font-medium">{formData.unit_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Status</span>
                  <span className="text-slate-800 text-sm font-medium capitalize">{formData.ownership_status}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 h-12 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl text-white"
                  style={{ backgroundColor: '#8A8076' }}
                >
                  {loading ? 'Submitting...' : 'Confirm'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
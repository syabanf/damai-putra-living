import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, CheckCircle2, X } from 'lucide-react';

export default function ScanBill() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: () => base44.entities.UserPoints.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const addPointsMutation = useMutation({
    mutationFn: async (points) => {
      const current = userPoints?.[0];
      if (current) {
        await base44.entities.UserPoints.update(current.id, {
          balance: (current.balance || 0) + points,
          total_earned: (current.total_earned || 0) + points,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPoints', user?.email] });
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileUrl = await base44.integrations.Core.UploadFile({ file });
      // Mock QR code scanning - in production this would use a QR code library
      const mockPoints = Math.floor(Math.random() * 50) + 100; // 100-150 points
      setScannedData({ success: true, points: mockPoints, reference: `BILL-${Date.now()}` });
    } catch (error) {
      setScannedData({ success: false, error: 'Failed to scan bill' });
    }
  };

  const confirmPoints = async () => {
    if (scannedData?.success && scannedData?.points) {
      addPointsMutation.mutate(scannedData.points);
    }
  };

  const resetScan = () => {
    setScannedData(null);
    setShowCamera(false);
  };

  const currentPoints = userPoints?.[0]?.balance || 0;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(160deg, #F5F4F2 0%, #edecea 55%, #e7e5e2 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 pt-4 px-4 pb-4" style={{ background: 'rgba(245,244,242,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(createPageUrl('Rewards'))} className="p-2 rounded-xl active:scale-95 transition-transform" style={{ background: 'rgba(255,255,255,0.75)' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: '#2E2E2E' }} />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#2E2E2E' }}>Scan Bill</h1>
            <p className="text-xs text-slate-500">Add points from paid bills</p>
          </div>
        </div>
      </div>

      {/* Current Points */}
      <div className="mx-4 mt-5 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)', boxShadow: '0 4px 20px rgba(31,182,213,0.3)' }}>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">Current Balance</p>
        <p className="text-white font-bold text-3xl">{currentPoints.toLocaleString()}</p>
        <p className="text-white/60 text-xs mt-2">points</p>
      </div>

      {/* Main Content */}
      {!scannedData ? (
        <div className="px-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#e6f8fb' }}>
              <Camera className="w-8 h-8" style={{ color: '#1FB6D5' }} />
            </div>
            <h2 className="font-bold text-lg text-slate-800 mb-2">Scan Your Bill</h2>
            <p className="text-sm text-slate-500 mb-6">Take a photo of your paid bill QR code to add points to your account.</p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 mb-3"
              style={{ background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)', boxShadow: '0 3px 10px rgba(31,182,213,0.35)' }}
            >
              Choose Photo from Gallery
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <p className="text-xs text-slate-400 mt-4">Supported formats: JPG, PNG</p>
          </motion.div>

          <div className="mt-8 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}>
            <h3 className="font-bold text-slate-800 mb-3">How it works</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="font-bold text-teal-600 flex-shrink-0">1</span>
                <span>Make a purchase at any participating merchant</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-teal-600 flex-shrink-0">2</span>
                <span>Get your paid bill receipt with QR code</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-teal-600 flex-shrink-0">3</span>
                <span>Scan the QR code here to earn points</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-teal-600 flex-shrink-0">4</span>
                <span>Points added instantly to your account</span>
              </li>
            </ul>
          </div>
        </div>
      ) : scannedData.success ? (
        <div className="px-4 mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: '#d1fae5' }}
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </motion.div>

            <h2 className="font-bold text-xl text-slate-800 mb-2">Bill Verified!</h2>
            <p className="text-sm text-slate-500 mb-6">Your purchase has been verified successfully.</p>

            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-widest mb-1">Points Earned</p>
              <p className="text-emerald-700 font-bold text-3xl">+{scannedData.points}</p>
            </div>

            <div className="text-left bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Reference ID:</span>
                <span className="font-semibold text-slate-800">{scannedData.reference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">New Balance:</span>
                <span className="font-semibold text-slate-800">{(currentPoints + scannedData.points).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={confirmPoints}
              disabled={addPointsMutation.isPending}
              className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 mb-3"
              style={{ background: addPointsMutation.isPending ? '#cbd5e1' : 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)', boxShadow: '0 3px 10px rgba(31,182,213,0.35)' }}
            >
              {addPointsMutation.isPending ? 'Adding Points...' : 'Confirm & Add Points'}
            </button>

            {addPointsMutation.isSuccess && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-emerald-600 font-semibold">
                Points added to your account! ✓
              </motion.p>
            )}
          </motion.div>
        </div>
      ) : (
        <div className="px-4 mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.85)' }}
          >
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: '#fee2e2' }}>
              <X className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="font-bold text-lg text-slate-800 mb-2">Scan Failed</h2>
            <p className="text-sm text-slate-500 mb-6">{scannedData.error}</p>
            <button
              onClick={resetScan}
              className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1FB6D5 0%, #0F9BB8 100%)' }}
            >
              Try Again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
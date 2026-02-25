import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Plus, ChevronRight, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/navigation/BottomNav';
import StatusBadge from '@/components/ui/StatusBadge';

export default function MyUnit() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: () => base44.entities.Unit.list(),
  });

  const userUnits = user ? units.filter(u => u.user_email === user.email) : units;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 border-amber-100';
      case 'approved':
        return 'bg-emerald-50 border-emerald-100';
      case 'rejected':
        return 'bg-red-50 border-red-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">My Unit</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your registered units</p>
      </div>

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : userUnits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Building2 className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">No Units Registered</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Register your first unit to access all property management features.
            </p>
            <Button
              onClick={() => navigate(createPageUrl('AddUnit'))}
              className="text-white rounded-xl h-12 px-6"
              style={{ background: 'linear-gradient(135deg, #8A8076, #6e6560)', boxShadow: '0 4px 16px rgba(138,128,118,0.3)' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Register Unit
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {userUnits.map((unit, index) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(createPageUrl('UnitDetail') + `?id=${unit.id}`)}
                  className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer hover:shadow-md transition-all ${getStatusBg(unit.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200/50">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{unit.unit_number}</h3>
                        <p className="text-slate-500 text-sm mt-0.5">{unit.property_name}</p>
                        {unit.tower && (
                          <p className="text-slate-400 text-xs mt-1">Tower {unit.tower}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={unit.status} />
                      <span className="text-xs text-slate-400 capitalize">
                        {unit.ownership_status}
                      </span>
                    </div>
                  </div>

                  {unit.status === 'rejected' && unit.rejection_note && (
                    <div className="mt-4 p-3 bg-red-100 rounded-xl">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-800 text-xs font-medium">Rejection Note:</p>
                          <p className="text-red-700 text-xs mt-1">{unit.rejection_note}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {unit.status === 'approved' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified Unit</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  )}

                  {unit.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-amber-100 flex items-center gap-2 text-amber-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Waiting for approval</span>
                    </div>
                  )}

                  {unit.status === 'rejected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(createPageUrl('AddUnit') + `?resubmit=${unit.id}`);
                      }}
                      className="mt-4 w-full border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resubmit Application
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <Button
              onClick={() => navigate(createPageUrl('AddUnit'))}
              variant="outline"
              className="w-full h-14 rounded-xl border-2 border-dashed border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-slate-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Unit
            </Button>
          </div>
        )}
      </div>

      <BottomNav currentPage="MyUnit" />
    </div>
  );
}
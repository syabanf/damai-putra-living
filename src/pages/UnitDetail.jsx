import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building2, User, FileText, Calendar, CheckCircle,
  Clock, XCircle, AlertCircle, Ticket, ChevronRight, RefreshCw, Video
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import StatusBadge from '@/components/ui/StatusBadge';

export default function UnitDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const unitId = urlParams.get('id');

  const { data: unit, isLoading } = useQuery({
    queryKey: ['unit', unitId],
    queryFn: async () => {
      const units = await base44.entities.Unit.filter({ id: unitId });
      return units[0];
    },
    enabled: !!unitId,
  });

  // Admin simulation - update status
  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }) => 
      base44.entities.Unit.update(unitId, { 
        status, 
        rejection_note: note || null 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit', unitId] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Unit not found</p>
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('MyUnit'))}
            className="mt-4"
          >
            Back to My Unit
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (unit.status) {
      case 'approved': return 'from-emerald-500 to-emerald-600';
      case 'rejected': return 'from-red-500 to-red-600';
      default: return 'from-amber-500 to-amber-600';
    }
  };

  const getStatusIcon = () => {
    switch (unit.status) {
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* Header */}
      <div className={`bg-gradient-to-br ${getStatusColor()} px-6 pt-6 pb-16 rounded-b-3xl`}>
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Unit Details</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{unit.unit_number}</h2>
            <p className="text-white/80">{unit.property_name}</p>
            {unit.tower && <p className="text-white/60 text-sm">Tower {unit.tower}</p>}
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="px-6 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                unit.status === 'approved' ? 'bg-emerald-100' :
                unit.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                <StatusIcon className={`w-6 h-6 ${
                  unit.status === 'approved' ? 'text-emerald-600' :
                  unit.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-bold text-slate-800 capitalize">{unit.status}</p>
              </div>
            </div>
            <StatusBadge status={unit.status} />
          </div>

          {unit.status === 'rejected' && unit.rejection_note && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-red-800 text-sm font-medium mb-1">Rejection Reason:</p>
              <p className="text-red-700 text-sm">{unit.rejection_note}</p>
            </div>
          )}

          {unit.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-amber-700 text-sm">
                Your registration is being reviewed. You'll be notified once approved.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Info Cards */}
      <div className="px-6 mt-6 space-y-4">
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ownership Status</p>
              <p className="font-semibold text-slate-800 capitalize">{unit.ownership_status}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Registered On</p>
              <p className="font-semibold text-slate-800">
                {new Date(unit.created_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {unit.document_url && (
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Supporting Document</p>
                  <p className="font-semibold text-slate-800">Uploaded</p>
                </div>
              </div>
              <a
                href={unit.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 text-sm font-medium"
              >
                View
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {unit.status === 'approved' && (
        <div className="px-6 mt-6">
          <Button
            onClick={() => navigate(createPageUrl('Tickets'))}
            className="w-full h-14 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-2xl font-semibold shadow-lg shadow-teal-200/50"
          >
            <Ticket className="w-5 h-5 mr-2" />
            Create Support Ticket
          </Button>
        </div>
      )}

      {unit.status === 'rejected' && (
        <div className="px-6 mt-6">
          <Button
            onClick={() => navigate(createPageUrl('AddUnit') + `?resubmit=${unit.id}`)}
            className="w-full h-14 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-2xl font-semibold shadow-lg shadow-teal-200/50"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Resubmit Application
          </Button>
        </div>
      )}

      {/* Surveillance */}
      {unit.status === 'approved' && (
        <div className="px-6 mt-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Unit Surveillance</h2>
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Live</span>
              </div>
              <span className="text-xs text-slate-500">Unit {unit.unit_number}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Front Door', status: 'online' },
                { label: 'Corridor', status: 'online' },
              ].map((cam, i) => (
                <div key={i} className="bg-slate-800 rounded-xl p-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-900 flex items-center justify-center flex-shrink-0">
                    <Video className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{cam.label}</p>
                    <p className="text-xs text-emerald-500">{cam.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <p className="text-xs text-slate-500">2 cameras active</p>
              <button className="text-xs font-medium text-slate-300 flex items-center gap-1">
                Request Footage <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Simulation Panel */}
      <div className="px-6 mt-8">
        <div className="bg-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">
            🔧 Admin Simulation (Demo Only)
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatusMutation.mutate({ status: 'approved' })}
              className="flex-1 bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatusMutation.mutate({ 
                status: 'rejected', 
                note: 'Document unclear. Please upload a clearer copy.' 
              })}
              className="flex-1 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatusMutation.mutate({ status: 'pending' })}
              className="flex-1 bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
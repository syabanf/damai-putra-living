import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileCheck, Clock, CheckCircle, XCircle, Download,
  QrCode, Calendar, MapPin, User, Phone, FileText, AlertCircle,
  Building2, Wrench, Truck, Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import StatusBadge from '@/components/ui/StatusBadge';

const permitTypeIcons = {
  renovation: Wrench,
  moving_in: Truck,
  moving_out: Truck,
  event: Calendar,
  contractor_access: Users,
};

export default function TicketDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');
  const [showQR, setShowQR] = useState(false);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const tickets = await base44.entities.Ticket.filter({ id: ticketId });
      return tickets[0];
    },
    enabled: !!ticketId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, note }) => {
      const updates = { status };
      if (note) updates.rejection_note = note;
      if (status === 'approved') {
        updates.permit_id = `PRM-${Date.now().toString(36).toUpperCase()}`;
        updates.valid_from = new Date().toISOString().split('T')[0];
        updates.valid_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        updates.qr_code = `PERMIT-${updates.permit_id}`;
      }
      return base44.entities.Ticket.update(ticketId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Ticket not found</p>
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('Tickets'))}
            className="mt-4"
          >
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  const Icon = permitTypeIcons[ticket.permit_type] || FileCheck;

  const getStatusColor = () => {
    switch (ticket.status) {
      case 'approved': return 'from-emerald-500 to-emerald-600';
      case 'rejected': return 'from-red-500 to-red-600';
      case 'in_progress': return 'from-blue-500 to-blue-600';
      case 'closed': return 'from-slate-500 to-slate-600';
      default: return 'from-amber-500 to-amber-600';
    }
  };

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
          <h1 className="text-lg font-bold text-white">Ticket Details</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white capitalize">
              {ticket.permit_type?.replace(/_/g, ' ') || ticket.category}
            </h2>
            <p className="text-white/80">{ticket.unit_number}</p>
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
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-bold text-slate-800 capitalize">{ticket.status?.replace(/_/g, ' ')}</p>
            </div>
            <StatusBadge status={ticket.status} />
          </div>

          {ticket.status === 'approved' && ticket.permit_id && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-800 font-semibold">Permit #{ticket.permit_id}</span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-4 text-sm text-emerald-700">
                <span>Valid: {new Date(ticket.valid_from).toLocaleDateString()}</span>
                <span>-</span>
                <span>{new Date(ticket.valid_until).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {ticket.status === 'rejected' && ticket.rejection_note && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-red-800 text-sm font-medium mb-1">Rejection Reason:</p>
              <p className="text-red-700 text-sm">{ticket.rejection_note}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Permit Card (if approved) */}
      {ticket.status === 'approved' && (
        <div className="px-6 mt-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider">Digital Permit</p>
                <h3 className="text-xl font-bold mt-1 capitalize">
                  {ticket.permit_type?.replace(/_/g, ' ')}
                </h3>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-teal-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-slate-400 text-xs">Permit ID</p>
                <p className="font-semibold">{ticket.permit_id}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Unit</p>
                <p className="font-semibold">{ticket.unit_number}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Valid From</p>
                <p className="font-semibold">{new Date(ticket.valid_from).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">Valid Until</p>
                <p className="font-semibold">{new Date(ticket.valid_until).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowQR(true)}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Show QR
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="px-6 mt-6 space-y-4">
        {ticket.activity_date && (
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Scheduled Date</p>
                <p className="font-semibold text-slate-800">
                  {new Date(ticket.activity_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {ticket.activity_time && ` at ${ticket.activity_time}`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Property</p>
              <p className="font-semibold text-slate-800">{ticket.property_name}</p>
              {ticket.tower && <p className="text-sm text-slate-500">Tower {ticket.tower}</p>}
            </div>
          </div>
        </div>

        {ticket.description && (
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-2">Description</p>
            <p className="text-slate-800">{ticket.description}</p>
          </div>
        )}

        {ticket.visitor_name && (
          <div className="bg-white rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              {ticket.permit_type === 'contractor_access' ? 'Contractor Details' : 'Visitor Details'}
            </p>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-700">{ticket.visitor_name}</span>
            </div>
            {ticket.visitor_phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{ticket.visitor_phone}</span>
              </div>
            )}
            {ticket.visitor_id && (
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">ID: {ticket.visitor_id}</span>
              </div>
            )}
          </div>
        )}

        {ticket.document_urls?.length > 0 && (
          <div className="bg-white rounded-xl p-4">
            <p className="text-sm text-slate-500 mb-3">Attachments</p>
            <div className="space-y-2">
              {ticket.document_urls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span className="text-sm text-slate-700">Document {index + 1}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

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
                note: 'Request does not meet requirements. Please provide additional documentation.' 
              })}
              className="flex-1 bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
            >
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatusMutation.mutate({ status: 'open' })}
              className="flex-1 bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setShowQR(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 text-center max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="grid grid-cols-5 gap-1">
                {Array(25).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-sm ${Math.random() > 0.5 ? 'bg-slate-800' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
            <p className="font-bold text-slate-800 mb-1">Permit #{ticket.permit_id}</p>
            <p className="text-slate-500 text-sm mb-6">Show this QR code to security</p>
            <Button
              onClick={() => setShowQR(false)}
              className="w-full bg-slate-800 hover:bg-slate-900"
            >
              Close
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
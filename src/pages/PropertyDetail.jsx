import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BedDouble, Bath, Car, Maximize2, MapPin, ChevronRight, Phone, MessageCircle, Zap, Trees, Building2 } from 'lucide-react';

const CATEGORY_LABEL = {
  apartment: 'Apartment',
  kavling: 'Kavling',
  bizpark: 'Bizpark',
  residential: 'Residential',
  commercial: 'Commercial',
};

const FACILITY_ICONS = {
  default: Zap,
  balcony: Trees,
  rooftop: Building2,
  garden: Trees,
};

const formatPrice = (n) => {
  if (!n) return null;
  return n.toLocaleString('id-ID');
};

export default function PropertyDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showAllInfo, setShowAllInfo] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => base44.entities.Property.filter({ id }).then(r => r[0]),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#1F86C7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <p className="text-slate-500 font-medium">Property not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#1F86C7] font-semibold">Go Back</button>
      </div>
    );
  }

  const allImages = [property.image_url, ...(property.gallery_urls || [])].filter(Boolean);
  const activeImg = allImages[galleryIdx] || null;

  const specRange = (min, max, unit = '') => {
    if (!min && !max) return null;
    if (!max || min === max) return `${min}${unit}`;
    return `${min}–${max}${unit}`;
  };

  const handleContact = () => {
    if (property.whatsapp_number) {
      const msg = encodeURIComponent(`Halo, saya tertarik dengan properti ${property.name}`);
      window.open(`https://wa.me/${property.whatsapp_number}?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-28">

      {/* Hero Gallery */}
      <div className="relative w-full aspect-video bg-slate-200 overflow-hidden">
        {activeImg ? (
          <img src={activeImg} alt={property.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%)' }} />

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-9 h-9 rounded-xl flex items-center justify-center border border-white/30"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Promo badge */}
        {property.promo_badge && (
          <span className="absolute top-12 right-4 text-[10px] font-bold text-white px-2.5 py-1 rounded-full"
            style={{ background: '#1F86C7' }}>
            {property.promo_badge}
          </span>
        )}

        {/* Gallery dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, i) => (
              <button key={i} onClick={() => setGalleryIdx(i)}
                className="rounded-full transition-all"
                style={{ width: i === galleryIdx ? 20 : 6, height: 6, background: i === galleryIdx ? '#fff' : 'rgba(255,255,255,0.45)' }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-5 space-y-6">

        {/* Basic info */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1F86C7' }}>
            {CATEGORY_LABEL[property.category] || property.category}
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-0.5 leading-tight">{property.name}</h1>
          {property.location && (
            <div className="flex items-center gap-1.5 mt-1.5 text-slate-500 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{property.location}</span>
            </div>
          )}

          {/* Specs */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
            {specRange(property.land_size_min, property.land_size_max, 'm²') && (
              <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <span>{specRange(property.land_size_min, property.land_size_max, 'm²')}</span>
              </div>
            )}
            {specRange(property.bedroom_min, property.bedroom_max) && (
              <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                <BedDouble className="w-4 h-4 text-slate-400" />
                <span>{specRange(property.bedroom_min, property.bedroom_max)}</span>
              </div>
            )}
            {specRange(property.bathroom_min, property.bathroom_max) && (
              <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                <Bath className="w-4 h-4 text-slate-400" />
                <span>{specRange(property.bathroom_min, property.bathroom_max)}</span>
              </div>
            )}
            {specRange(property.parking_min, property.parking_max) && (
              <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                <Car className="w-4 h-4 text-slate-400" />
                <span>{specRange(property.parking_min, property.parking_max)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Information */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-800 text-base">Information</h2>
            <button onClick={() => setShowAllInfo(!showAllInfo)}
              className="text-sm font-semibold flex items-center gap-0.5" style={{ color: '#1F86C7' }}>
              {showAllInfo ? 'Show Less' : 'View All'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2.5 text-sm text-slate-600">
            {property.address && <InfoRow label="Address" value={property.address} />}
            {property.tower_info && <InfoRow label="Tower / Block" value={property.tower_info} />}
            {property.lift_count && <InfoRow label="Lift" value={`${property.lift_count} units`} />}
            {property.facility_count && <InfoRow label="Facilities" value={`${property.facility_count} facilities`} />}
            {showAllInfo && property.description && (
              <div className="pt-2 text-slate-500 text-sm leading-relaxed">{property.description}</div>
            )}
          </div>
        </div>

        {/* Facilities */}
        {property.facilities?.length > 0 && (
          <>
            <div className="border-t border-slate-100" />
            <div>
              <h2 className="font-bold text-slate-800 text-base mb-3">Facilities</h2>
              <div className="grid grid-cols-2 gap-2">
                {property.facilities.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Zap className="w-4 h-4 flex-shrink-0" style={{ color: '#1F86C7' }} />
                    <span className="text-sm text-slate-700 font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Price */}
        {property.price_start && (
          <>
            <div className="border-t border-slate-100" />
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Start From</p>
              <p className="text-3xl font-bold text-slate-800 leading-tight">
                IDR {formatPrice(property.price_start)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-white border-t border-slate-100 z-20">
        <div className="flex gap-3">
          <button
            onClick={handleContact}
            className="flex-1 h-13 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 py-3"
            style={{ background: '#1F86C7', boxShadow: '0 8px 24px rgba(31,134,199,0.35)' }}>
            <MessageCircle className="w-5 h-5" />
            Contact Us
          </button>
          <button
            onClick={handleContact}
            className="w-13 h-13 rounded-2xl flex items-center justify-center border border-slate-200 bg-slate-50 py-3 px-3">
            <Phone className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5 border-b border-slate-50">
      <span className="text-slate-400 text-sm flex-shrink-0">{label}</span>
      <span className="text-slate-700 text-sm font-medium text-right">{value}</span>
    </div>
  );
}
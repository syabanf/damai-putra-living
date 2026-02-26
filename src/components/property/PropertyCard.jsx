import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BedDouble, Bath, Car, Maximize2 } from 'lucide-react';

const CATEGORY_LABEL = {
  apartment: 'Apartment',
  kavling: 'Kavling',
  bizpark: 'Bizpark',
  residential: 'Residential',
  commercial: 'Commercial',
};

const formatPrice = (n) => {
  if (!n) return null;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} Jt`;
  return n.toLocaleString('id-ID');
};

export default function PropertyCard({ property }) {
  const navigate = useNavigate();

  const specRange = (min, max, unit = '') => {
    if (!min && !max) return null;
    if (min === max || !max) return `${min}${unit}`;
    return `${min}–${max}${unit}`;
  };

  return (
    <div
      onClick={() => navigate(createPageUrl('PropertyDetail') + `?id=${property.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* Image */}
      <div className="relative w-full aspect-video overflow-hidden bg-slate-100">
        {property.image_url ? (
          <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <Maximize2 className="w-8 h-8 text-slate-400" />
          </div>
        )}
        {property.promo_badge && (
          <span className="absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded-full"
            style={{ background: '#1F86C7' }}>
            {property.promo_badge}
          </span>
        )}
        {property.status === 'sold_out' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/60 px-4 py-1.5 rounded-full">Sold Out</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#1F86C7' }}>
          {CATEGORY_LABEL[property.category] || property.category}
        </span>
        <h3 className="font-bold text-slate-800 text-base mt-0.5 mb-2 leading-snug">{property.name}</h3>

        {/* Specs */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
          {specRange(property.land_size_min, property.land_size_max, 'm²') && (
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{specRange(property.land_size_min, property.land_size_max, 'm²')}</span>
            </div>
          )}
          {specRange(property.bedroom_min, property.bedroom_max) && (
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <BedDouble className="w-3.5 h-3.5" />
              <span>{specRange(property.bedroom_min, property.bedroom_max)}</span>
            </div>
          )}
          {specRange(property.bathroom_min, property.bathroom_max) && (
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Bath className="w-3.5 h-3.5" />
              <span>{specRange(property.bathroom_min, property.bathroom_max)}</span>
            </div>
          )}
          {specRange(property.parking_min, property.parking_max) && (
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Car className="w-3.5 h-3.5" />
              <span>{specRange(property.parking_min, property.parking_max)}</span>
            </div>
          )}
        </div>

        {/* Price */}
        {property.price_start && (
          <div className="border-t border-slate-100 pt-3">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Start From</p>
            <p className="font-bold text-lg text-slate-800 leading-tight">
              IDR {formatPrice(property.price_start)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
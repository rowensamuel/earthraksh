import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'auto' | 'success' | 'warning' | 'error' | 'neutral' | 'info';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'auto', size = 'sm' }) => {
  // Resolve variant automatically based on common agricultural/ERP statuses
  let resolvedVariant = variant;
  if (resolvedVariant === 'auto') {
    const s = status.toLowerCase();
    if (['active', 'completed', 'delivered', 'growing', 'harvested', 'available', 'excellent', 'high', 'in stock'].includes(s)) {
      resolvedVariant = 'success';
    } else if (['pending', 'under treatment', 'moderate', 'medium', 'low stock', 'good', 'rented', 'shipped'].includes(s)) {
      resolvedVariant = 'warning';
    } else if (['suspended', 'inactive', 'critical', 'damaged', 'cancelled', 'severe', 'failed', 'needs repair', 'under maintenance'].includes(s)) {
      resolvedVariant = 'error';
    } else if (['planted', 'confirmed'].includes(s)) {
      resolvedVariant = 'info';
    } else {
      resolvedVariant = 'neutral';
    }
  }

  // Zero-pill discipline: unboxed text with a subtle semantic micro-indicator dot
  const dotColor = {
    success: 'bg-[#1b5e20]',
    warning: 'bg-[#b45309]',
    error: 'bg-[#b91c1c]',
    info: 'bg-[#1e40af]',
    neutral: 'bg-[#525252]'
  }[resolvedVariant];

  const textColor = {
    success: 'text-[#1b5e20]',
    warning: 'text-[#92400e]',
    error: 'text-[#991b1b]',
    info: 'text-[#1e3a8a]',
    neutral: 'text-[#404040]'
  }[resolvedVariant];

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'} ${textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};

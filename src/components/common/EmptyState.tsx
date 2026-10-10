import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="bg-white border border-[#dbe3d8] p-10 text-center flex flex-col items-center justify-center my-4">
      {icon && (
        <div className="w-12 h-12 flex items-center justify-center text-[#556b59] bg-[#f2f6f0] border border-[#dbe3d8] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold font-display text-[#14291a] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#5e7362] max-w-md mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#1b5e20] hover:bg-[#144719] transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

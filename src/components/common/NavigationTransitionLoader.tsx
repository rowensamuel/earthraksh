import React from 'react';
import { farmerWalkingVideo } from '../../assets/assetRegistry';

interface NavigationTransitionLoaderProps {
  isLoading: boolean;
  destinationTitle?: string;
}

export const NavigationTransitionLoader: React.FC<NavigationTransitionLoaderProps> = ({
  isLoading,
  destinationTitle
}) => {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a1b10]/90 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto select-none"
      role="status"
      aria-live="polite"
      aria-label="Loading module navigation"
    >
      <div className="relative flex flex-col items-center p-6 bg-[#122e1c] border border-[#235835] shadow-2xl max-w-sm w-full mx-4 text-center">
        {/* Provided Farmer Walking / Planting Animation Video */}
        <div className="relative w-48 h-36 flex items-center justify-center overflow-hidden mb-4 border border-[#235835] bg-[#0c1f13]">
          <video
            src={farmerWalkingVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className="w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#122e1c]/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Status Indicator & Typography */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#64bd73] animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8ce09b]">
              EarthRakshak Navigation
            </span>
          </div>
          <p className="text-sm font-display font-bold text-white tracking-wide">
            {destinationTitle ? `Entering ${destinationTitle}` : 'Transitioning Module...'}
          </p>
          <p className="text-[11px] text-[#9fc7a5] font-medium">
            Syncing field operations &amp; database telemetry
          </p>
        </div>

        {/* Smooth 1-second progress bar */}
        <div className="w-full bg-[#0d2113] h-1.5 mt-5 overflow-hidden rounded-full border border-[#1b4327]">
          <div className="h-full bg-gradient-to-r from-[#2e7d32] via-[#64bd73] to-[#a3e9b0] transition-loader-bar" />
        </div>
      </div>

      <style>{`
        @keyframes progressFill {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .transition-loader-bar {
          animation: progressFill 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

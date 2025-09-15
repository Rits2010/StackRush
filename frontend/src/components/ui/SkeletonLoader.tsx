import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4' 
}) => {
  return (
    <div 
      className={`loading-shimmer rounded ${width} ${height} ${className}`}
    />
  );
};

export const ChallengeCardSkeleton: React.FC = () => {
  return (
    <div className="card-professional p-6 animate-pulse">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-700/30 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton width="w-16" height="h-6" />
              <Skeleton width="w-20" height="h-6" />
            </div>
            <Skeleton width="w-3/4" height="h-6" className="mb-2" />
          </div>
          <div className="text-right ml-4">
            <Skeleton width="w-12" height="h-4" className="mb-1" />
            <Skeleton width="w-16" height="h-3" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4">
        {/* Description */}
        <div className="space-y-2">
          <Skeleton width="w-full" height="h-4" />
          <Skeleton width="w-5/6" height="h-4" />
          <Skeleton width="w-4/6" height="h-4" />
        </div>

        {/* Distraction tags */}
        <div className="space-y-2">
          <Skeleton width="w-32" height="h-3" />
          <div className="flex flex-wrap gap-1">
            <Skeleton width="w-20" height="h-6" />
            <Skeleton width="w-24" height="h-6" />
            <Skeleton width="w-16" height="h-6" />
          </div>
        </div>

        {/* Challenge info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton width="w-20" height="h-4" />
            <Skeleton width="w-24" height="h-4" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton width="w-16" height="h-4" />
            <Skeleton width="w-12" height="h-4" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton width="w-24" height="h-4" />
            <Skeleton width="w-16" height="h-4" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Skeleton width="w-16" height="h-6" />
          <Skeleton width="w-20" height="h-6" />
          <Skeleton width="w-24" height="h-6" />
        </div>

        {/* Button */}
        <Skeleton width="w-full" height="h-10" />
      </div>
    </div>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="card-professional p-6 text-center animate-pulse">
      <Skeleton width="w-8" height="h-8" className="mx-auto mb-3 rounded-lg" />
      <Skeleton width="w-12" height="h-8" className="mx-auto mb-1" />
      <Skeleton width="w-20" height="h-4" className="mx-auto" />
    </div>
  );
};
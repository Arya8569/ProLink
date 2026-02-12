import React from 'react';

const JobListSkeleton = ({ count = 5, className = "" }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count })?.map((_, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6 animate-pulse">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 rounded-lg bg-muted"></div>
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="flex space-x-4">
                  <div className="h-3 bg-muted rounded w-20"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-muted rounded"></div>
              <div className="text-right">
                <div className="h-3 bg-muted rounded w-12 mb-1"></div>
                <div className="h-4 bg-muted rounded w-8"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <div className="h-5 bg-muted rounded w-1/3 mb-3"></div>
            <div className="space-y-2 mb-3">
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-4/5"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-6 bg-muted rounded w-16"></div>
              <div className="h-6 bg-muted rounded w-20"></div>
              <div className="h-6 bg-muted rounded w-14"></div>
              <div className="h-6 bg-muted rounded w-12"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex space-x-4">
              <div className="h-3 bg-muted rounded w-16"></div>
              <div className="h-3 bg-muted rounded w-20"></div>
              <div className="h-3 bg-muted rounded w-18"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobListSkeleton;
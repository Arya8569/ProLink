import React from 'react';
import Icon from '../../../components/AppIcon';

const LoadingSpinner = ({ message = 'Signing you in...', className = '' }) => {
  return (
    <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-card border border-border rounded-lg p-8 shadow-prominent max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
            <Icon name="Loader2" size={32} color="white" className="animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we authenticate your account
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              {[0, 1, 2]?.map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
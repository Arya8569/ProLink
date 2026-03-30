import React from 'react';
import Icon from '../../../components/AppIcon';

const StatusBadge = ({ status, className = "" }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'applied': {
        label: 'Applied',
        icon: 'Send',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-200'
      },
      'screening': {
        label: 'Screening',
        icon: 'Search',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      },
      'interview': {
        label: 'Interview',
        icon: 'Video',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-200'
      },
      'offer': {
        label: 'Offer',
        icon: 'Gift',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      },
      'hired': {
        label: 'Hired',
        icon: 'UserCheck',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-800',
        borderColor: 'border-emerald-200'
      },
      'rejected': {
        label: 'Rejected',
        icon: 'X',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      }
    };

    return configs?.[status] || configs?.['applied'];
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${config?.bgColor} ${config?.textColor} ${config?.borderColor} ${className}`}>
      <Icon name={config?.icon} size={12} />
      <span>{config?.label}</span>
    </span>
  );
};

export default StatusBadge;
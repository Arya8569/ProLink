import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

// Utility function for Indian Currency (Lakh/Crore)
const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === 0) return 'N/A';
  amount = Number(amount);
  
  if (amount >= 10000000) { 
    return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  } else if (amount >= 100000) { 
    return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const QuickApplyModal = ({ 
  job, 
  isOpen, 
  onClose, 
  onSubmit, 
  className = "" 
}) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: null,
    expectedSalary: '',
    availabilityDate: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e?.target?.files?.[0];
    setFormData(prev => ({
      ...prev,
      resume: file
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSubmissionError(''); // Clear previous errors
    setIsSubmitting(true);
    
    // Quick validation check
    if (!formData.resume) {
        setSubmissionError('Error: Resume file must be uploaded.');
        setIsSubmitting(false);
        return;
    }
    if (!formData.availabilityDate || formData.availabilityDate === '') {
        setSubmissionError('Error: Availability must be selected.');
        setIsSubmitting(false);
        return;
    }

    try {
      // The onSubmit function (in parent) handles the actual Supabase call
      await onSubmit({
        jobId: job?.id,
        ...formData
      });
      // Only close if submission was successful
      onClose(); 
    } catch (error) {
      console.error('Application submission failed:', error);
      // Display the detailed error from the parent component
      setSubmissionError(error.message || 'Application failed. Please verify RLS policies and DB schema.');
    } finally {
      // CRITICAL FIX: Ensure loading state is reset regardless of success/failure
      setIsSubmitting(false);
    }
  };

  const availabilityOptions = [
    { value: '', label: 'Select availability' },
    { value: 'immediately', label: 'Immediately' },
    { value: '2-weeks', label: '2 weeks notice' },
    { value: '1-month', label: '1 month notice' },
    { value: '2-months', label: '2 months notice' },
    { value: 'negotiable', label: 'Negotiable' }
  ];

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${className}`}>
        {/* Header (Fixed Top) */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Quick Apply</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {job?.title} at {job?.company?.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content (Scrollable Area) */}
        <div className="p-6 overflow-y-auto flex-1">
          {submissionError && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-sm text-error font-medium">Submission Failed</p>
                <p className="text-xs text-error/80 mt-1">{submissionError}</p>
              </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Resume *
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                  required
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Icon name="Upload" size={32} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Click to upload your resume
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, DOC, or DOCX (max 5MB)
                    </p>
                  </div>
                </label>
                {formData?.resume && (
                  <div className="mt-3 flex items-center justify-center space-x-2 text-sm text-success">
                    <Icon name="CheckCircle" size={16} />
                    <span>{formData?.resume?.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cover Letter
              </label>
              <textarea
                value={formData?.coverLetter}
                onChange={(e) => handleInputChange('coverLetter', e?.target?.value)}
                placeholder="Tell us why you are interested in this position..."
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
            </div>

            {/* Expected Salary */}
            <div>
              <Input
                label="Expected Salary (Optional)"
                type="text"
                placeholder="e.g., ₹8,00,000 - ₹12,00,000 LPA"
                value={formData?.expectedSalary}
                onChange={(e) => handleInputChange('expectedSalary', e?.target?.value)}
              />
            </div>

            {/* Availability */}
            <div>
              <Select
                label="Availability"
                options={availabilityOptions}
                value={formData?.availabilityDate}
                onChange={(value) => handleInputChange('availabilityDate', value)}
                placeholder="Select availability"
                required
              />
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Additional Information
              </label>
              <textarea
                value={formData?.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e?.target?.value)}
                placeholder="Any additional information you would like to share..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              />
            </div>

            {/* Job Details Summary */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">Job Summary</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Icon name="MapPin" size={14} />
                  <span>{job?.location}</span>
                  {job?.isRemote && (
                    <>
                      <span>•</span>
                      <span>Remote</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="DollarSign" size={14} />
                  <span>
                    {job?.salary?.min && job?.salary?.max 
                      ? `${formatIndianCurrency(job?.salary?.min)} - ${formatIndianCurrency(job?.salary?.max)}`
                      : job?.salary?.range || 'Salary not disclosed'
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={14} />
                  <span>{job?.jobType}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer (Fixed Bottom) */}
        <div className="flex items-center justify-between p-6 border-t border-border flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            Your application will be sent directly to the employer
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              // Disabled only if submitting or if critical fields are missing
              disabled={isSubmitting || !formData.resume || !formData.availabilityDate}
            >
              Submit Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickApplyModal;
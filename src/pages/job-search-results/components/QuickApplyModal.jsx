import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { generateCoverLetterWithGroq } from '../../../utils/groq';
import { extractTextFromPDF } from '../../../utils/pdf-util';

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
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegenerateCoverLetter = async () => {
    if (!formData?.coverLetter?.trim() || isGeneratingCoverLetter) return;

    setIsGeneratingCoverLetter(true);
    setCoverLetterError('');

    try {
      // 1. Extract text from uploaded resume if it exists and is PDF
      let resumeText = '';
      if (formData.resume && (formData.resume.type === 'application/pdf' || formData.resume.name?.toLowerCase().endsWith('.pdf'))) {
        try {
          resumeText = await extractTextFromPDF(formData.resume);
        } catch (pdfErr) {
          console.warn('Could not extract text from resume for cover letter context:', pdfErr);
        }
      }

      // 2. Fetch logged in candidate's name if available in localStorage
      let candidateName = '';
      try {
        const storedUser = localStorage.getItem('prolink-user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          candidateName = userObj.name || '';
        }
      } catch (userErr) {
        console.warn('Could not read user name from local storage:', userErr);
      }

      // 3. Generate with Groq AI
      const generatedLetter = await generateCoverLetterWithGroq(
        formData.coverLetter,
        job,
        resumeText,
        candidateName
      );

      if (generatedLetter) {
        handleInputChange('coverLetter', generatedLetter.trim());
      }
    } catch (err) {
      console.error('Error regenerating cover letter:', err);
      setCoverLetterError(err.message || 'Failed to generate cover letter with AI.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
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
                  id="quick-apply-resume"
                  required
                />
                <label
                  htmlFor="quick-apply-resume"
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Cover Letter
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateCoverLetter}
                  disabled={!formData?.coverLetter?.trim() || isGeneratingCoverLetter}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    !formData?.coverLetter?.trim() || isGeneratingCoverLetter
                      ? 'bg-muted text-muted-foreground/50 border border-transparent cursor-not-allowed opacity-60'
                      : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground active:scale-95 shadow-xs cursor-pointer'
                  }`}
                  title={
                    !formData?.coverLetter?.trim()
                      ? 'Type some initial thoughts below first to enable AI regeneration'
                      : 'Polish your draft into a professional cover letter tailored to this role'
                  }
                >
                  {isGeneratingCoverLetter ? (
                    <>
                      <Icon name="Loader2" size={13} className="animate-spin text-primary" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" size={13} className={formData?.coverLetter?.trim() ? "text-primary" : "text-muted-foreground/50"} />
                      <span>Regenerate with AI</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={formData?.coverLetter}
                onChange={(e) => {
                  handleInputChange('coverLetter', e?.target?.value);
                  if (coverLetterError) setCoverLetterError('');
                }}
                placeholder="Tell us why you are interested in this position... (Write a draft or rough notes and click 'Regenerate with AI' to polish it!)"
                rows={5}
                disabled={isGeneratingCoverLetter}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-y transition-colors ${
                  isGeneratingCoverLetter ? 'bg-muted/40 opacity-75' : 'bg-background'
                } border-border`}
              />

              {coverLetterError && (
                <p className="text-xs text-error mt-1">{coverLetterError}</p>
              )}

              <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                <span>
                  {!formData?.coverLetter?.trim()
                    ? '💡 Type some rough points above to enable AI regeneration.'
                    : '✨ Click "Regenerate with AI" to craft a full, professional letter.'}
                </span>
                <span>{formData?.coverLetter?.length || 0} characters</span>
              </div>
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
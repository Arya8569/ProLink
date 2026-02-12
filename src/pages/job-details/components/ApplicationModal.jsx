import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ApplicationModal = ({ isOpen, onClose, job, onSubmit }) => {
  const [applicationData, setApplicationData] = useState({
    resume: '',
    coverLetter: '',
    customQuestions: {},
    expectedSalary: '',
    availableStartDate: '',
    additionalDocuments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const resumeOptions = [
    { value: 'resume1', label: 'Software Engineer Resume - Updated Dec 2024' },
    { value: 'resume2', label: 'Full Stack Developer Resume - Nov 2024' },
    { value: 'upload', label: 'Upload new resume...' }
  ];

  const coverLetterTemplates = [
    { value: 'custom', label: 'Write custom cover letter' },
    { value: 'template1', label: 'Use template: Software Engineer' },
    { value: 'template2', label: 'Use template: Career Change' },
    { value: 'none', label: 'No cover letter' }
  ];

  const handleInputChange = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomQuestionChange = (questionId, value) => {
    setApplicationData(prev => ({
      ...prev,
      customQuestions: {
        ...prev?.customQuestions,
        [questionId]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(applicationData);
      onClose();
    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Apply for Position</h2>
            <p className="text-sm text-muted-foreground">{job?.title} at {job?.company?.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {[1, 2, 3]?.map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step < currentStep ? <Icon name="Check" size={16} /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Documents</span>
            <span>Details</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Documents */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Select Your Documents</h3>
                  
                  <Select
                    label="Resume"
                    description="Choose your most relevant resume"
                    options={resumeOptions}
                    value={applicationData?.resume}
                    onChange={(value) => handleInputChange('resume', value)}
                    required
                    className="mb-4"
                  />

                  <Select
                    label="Cover Letter"
                    description="Add a cover letter to strengthen your application"
                    options={coverLetterTemplates}
                    value={applicationData?.coverLetter}
                    onChange={(value) => handleInputChange('coverLetter', value)}
                    className="mb-4"
                  />

                  {applicationData?.coverLetter === 'custom' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Custom Cover Letter
                      </label>
                      <textarea
                        className="w-full h-32 px-3 py-2 border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Write your cover letter here..."
                        value={applicationData?.customCoverLetter || ''}
                        onChange={(e) => handleInputChange('customCoverLetter', e?.target?.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Additional Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Additional Information</h3>
                
                <Input
                  label="Expected Salary"
                  type="text"
                  placeholder="e.g., $80,000 - $100,000"
                  value={applicationData?.expectedSalary}
                  onChange={(e) => handleInputChange('expectedSalary', e?.target?.value)}
                  description="Optional - helps employers understand your expectations"
                />

                <Input
                  label="Available Start Date"
                  type="date"
                  value={applicationData?.availableStartDate}
                  onChange={(e) => handleInputChange('availableStartDate', e?.target?.value)}
                  description="When can you start if selected?"
                />

                {/* Custom Questions */}
                {job?.applicationQuestions && job?.applicationQuestions?.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-foreground mb-3">Employer Questions</h4>
                    <div className="space-y-4">
                      {job?.applicationQuestions?.map((question, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            {question?.question}
                            {question?.required && <span className="text-error ml-1">*</span>}
                          </label>
                          {question?.type === 'text' && (
                            <Input
                              type="text"
                              placeholder={question?.placeholder}
                              value={applicationData?.customQuestions?.[question?.id] || ''}
                              onChange={(e) => handleCustomQuestionChange(question?.id, e?.target?.value)}
                              required={question?.required}
                            />
                          )}
                          {question?.type === 'textarea' && (
                            <textarea
                              className="w-full h-24 px-3 py-2 border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder={question?.placeholder}
                              value={applicationData?.customQuestions?.[question?.id] || ''}
                              onChange={(e) => handleCustomQuestionChange(question?.id, e?.target?.value)}
                              required={question?.required}
                            />
                          )}
                          {question?.type === 'select' && (
                            <Select
                              options={question?.options?.map(opt => ({ value: opt, label: opt }))}
                              value={applicationData?.customQuestions?.[question?.id] || ''}
                              onChange={(value) => handleCustomQuestionChange(question?.id, value)}
                              required={question?.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Review Your Application</h3>
                
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-foreground">Position:</span>
                    <span className="text-sm text-muted-foreground">{job?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-foreground">Company:</span>
                    <span className="text-sm text-muted-foreground">{job?.company?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-foreground">Resume:</span>
                    <span className="text-sm text-muted-foreground">
                      {resumeOptions?.find(r => r?.value === applicationData?.resume)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-foreground">Cover Letter:</span>
                    <span className="text-sm text-muted-foreground">
                      {coverLetterTemplates?.find(c => c?.value === applicationData?.coverLetter)?.label}
                    </span>
                  </div>
                  {applicationData?.expectedSalary && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-foreground">Expected Salary:</span>
                      <span className="text-sm text-muted-foreground">{applicationData?.expectedSalary}</span>
                    </div>
                  )}
                  {applicationData?.availableStartDate && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-foreground">Start Date:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(applicationData.availableStartDate)?.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Icon name="Info" size={16} className="text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="text-foreground font-medium mb-1">Application Tips</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Your application will be reviewed within 3-5 business days</li>
                        <li>• You'll receive email updates on your application status</li>
                        <li>• Make sure your contact information is up to date</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button 
                type="submit" 
                onClick={handleSubmit}
                loading={isSubmitting}
                iconName="Send"
                iconPosition="left"
              >
                Submit Application
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
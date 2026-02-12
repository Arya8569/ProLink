import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const DocumentManager = ({ 
  applications,
  documents,
  onUploadDocument,
  onDeleteDocument,
  onUpdateDocument,
  className = ""
}) => {
  const [selectedApplication, setSelectedApplication] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const applicationOptions = applications?.map(app => ({
    value: app?.id,
    label: `${app?.position} at ${app?.company}`
  }));

  const documentTypeOptions = [
    { value: 'resume', label: 'Resume/CV' },
    { value: 'cover-letter', label: 'Cover Letter' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'transcript', label: 'Transcript' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file || !documentType || !documentName) return;

    setIsUploading(true);
    
    try {
      const documentData = {
        file,
        name: documentName,
        type: documentType,
        applicationId: selectedApplication || null,
        uploadDate: new Date()?.toISOString()
      };

      await onUploadDocument(documentData);
      
      // Reset form
      setDocumentName('');
      setDocumentType('');
      setSelectedApplication('');
      e.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDocumentIcon = (type) => {
    const icons = {
      'resume': 'FileText',
      'cover-letter': 'FileText',
      'portfolio': 'Briefcase',
      'certificate': 'Award',
      'transcript': 'GraduationCap',
      'other': 'File'
    };
    return icons?.[type] || 'File';
  };

  const getDocumentColor = (type) => {
    const colors = {
      'resume': 'text-primary',
      'cover-letter': 'text-secondary',
      'portfolio': 'text-accent',
      'certificate': 'text-success',
      'transcript': 'text-warning',
      'other': 'text-muted-foreground'
    };
    return colors?.[type] || 'text-muted-foreground';
  };

  // Group documents by type
  const groupedDocuments = documents?.reduce((acc, doc) => {
    if (!acc?.[doc?.type]) {
      acc[doc.type] = [];
    }
    acc?.[doc?.type]?.push(doc);
    return acc;
  }, {});

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload New Document */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Upload" size={20} className="mr-2" />
          Upload Document
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Document Name"
              type="text"
              placeholder="e.g., Software Engineer Resume"
              value={documentName}
              onChange={(e) => setDocumentName(e?.target?.value)}
              required
            />
            
            <Select
              label="Document Type"
              placeholder="Select type"
              options={documentTypeOptions}
              value={documentType}
              onChange={setDocumentType}
              required
            />
          </div>
          
          <Select
            label="Link to Application (Optional)"
            placeholder="Select application"
            options={[{ value: '', label: 'General document' }, ...applicationOptions]}
            value={selectedApplication}
            onChange={setSelectedApplication}
          />
          
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={isUploading || !documentType || !documentName}
              className="flex-1"
            />
            
            {isUploading && (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Icon name="Loader2" size={16} className="animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, DOC, DOCX, TXT. Maximum file size: 10MB.
          </p>
        </div>
      </div>
      {/* Document Library */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="FolderOpen" size={20} className="mr-2" />
            Document Library ({documents?.length})
          </h3>
          
          <Button variant="outline" size="sm">
            <Icon name="Download" size={14} />
            <span className="ml-1">Export All</span>
          </Button>
        </div>

        {documents?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Documents Yet</h4>
            <p className="text-muted-foreground">
              Upload your resume, cover letters, and other documents to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDocuments)?.map(([type, docs]) => (
              <div key={type}>
                <h4 className="text-sm font-semibold text-foreground mb-3 capitalize flex items-center">
                  <Icon name={getDocumentIcon(type)} size={16} className={`mr-2 ${getDocumentColor(type)}`} />
                  {type?.replace('-', ' ')} ({docs?.length})
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs?.map((doc) => (
                    <div key={doc?.id} className="border border-border rounded-lg p-4 hover:shadow-moderate transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${getDocumentColor(type)}`}>
                          <Icon name={getDocumentIcon(type)} size={20} />
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc?.url, '_blank')}
                          >
                            <Icon name="Eye" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc?.downloadUrl, '_blank')}
                          >
                            <Icon name="Download" size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteDocument(doc?.id)}
                            className="text-error hover:text-error"
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-foreground mb-1 truncate">{doc?.name}</h5>
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatFileSize(doc?.size)} • {formatDate(doc?.uploadDate)}
                        </p>
                        
                        {doc?.applicationId && (
                          <p className="text-xs text-muted-foreground">
                            Linked to: {applications?.find(app => app?.id === doc?.applicationId)?.position}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Resume Versions */}
      {groupedDocuments?.resume && groupedDocuments?.resume?.length > 1 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="GitBranch" size={20} className="mr-2" />
            Resume Versions
          </h3>
          
          <div className="space-y-3">
            {groupedDocuments?.resume?.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))?.map((resume, index) => (
                <div key={resume?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                      v{groupedDocuments?.resume?.length - index}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{resume?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(resume?.uploadDate)} • {formatFileSize(resume?.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {index === 0 && (
                      <span className="bg-success text-success-foreground px-2 py-1 rounded-full text-xs font-medium">
                        Current
                      </span>
                    )}
                    <Button variant="outline" size="sm">
                      <Icon name="Eye" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
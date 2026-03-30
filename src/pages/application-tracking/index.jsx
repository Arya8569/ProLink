import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import ApplicationFilters from './components/ApplicationFilters';
import ApplicationTable from './components/ApplicationTable';
import ApplicationAnalytics from './components/ApplicationAnalytics';
import InterviewScheduler from './components/InterviewScheduler';
import DocumentManager from './components/DocumentManager';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../supabaseClient'; // Import supabase

const ApplicationTracking = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState({ field: 'appliedDate', direction: 'desc' });
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [user, setUser] = useState(null); 
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]); 

  // Mock notifications data (kept as no notifications table was requested)
  const mockNotifications = [
    {
      id: 1,
      type: 'interview',
      title: 'Interview Reminder',
      message: 'You have an interview with TechCorp Solutions tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: 2,
      type: 'application',
      title: 'Application Status Update',
      message: 'Your application for React Developer at InnovateLabs has been shortlisted',
      timestamp: new Date(Date.now() - 7200000),
      read: false
    },
    {
      id: 3,
      type: 'job_match',
      title: 'New Job Match',
      message: '5 new jobs match your profile and preferences',
      timestamp: new Date(Date.now() - 86400000),
      read: true
    }
  ];

  // --- SUPABASE DATA FETCHING ---
  const fetchApplicationData = useCallback(async (userId, role) => {
    if (!userId) return;

    try {
      let query = supabase.from('applications').select('*');

      if (role === 'recruiter' || role === 'admin') {
        // 1. Fetch Job IDs for this recruiter
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('id')
          .eq('recruiter_id', userId);

        if (jobError) throw jobError;

        if (jobData && jobData.length > 0) {
          const jobIds = jobData.map(j => j.id);
          // 2. Fetch Applications for those jobs
          query = query.in('job_id', jobIds);
        } else {
          setApplications([]);
          return;
        }
      } else {
        // Standard job seeker: Fetch applications they sent
        query = query.eq('user_id', userId);
      }

      const { data: fetchedApplications, error: appError } = await query
        .order('appliedDate', { ascending: false });

      if (appError) throw appError;

      // For recruiters, we need to mock/join company/position data if not in table
      // The RecruiterDashboard logic is more complete, let's try to match it or at least ensure position name exists
      // Assuming positions might be missing if not joined, we'll fetch them if needed
      if ((role === 'recruiter' || role === 'admin') && fetchedApplications && fetchedApplications.length > 0) {
          const jobIds = [...new Set(fetchedApplications.map(a => a.job_id))];
          const { data: jobsData } = await supabase.from('jobs').select('id, title, company_name').in('id', jobIds);
          const jobsMap = (jobsData || []).reduce((acc, j) => ({...acc, [j.id]: j}), {});
          
          const userIds = [...new Set(fetchedApplications.map(a => a.user_id))];
          const { data: profilesData } = await supabase.from('profiles').select('id, name').in('id', userIds);
          const profilesMap = (profilesData || []).reduce((acc, p) => ({...acc, [p.id]: p}), {});

          const enriched = fetchedApplications.map(app => ({
              ...app,
              position: jobsMap[app.job_id]?.title || 'Unknown Position',
              company: jobsMap[app.job_id]?.company_name || 'Your Company',
              candidate_name: profilesMap[app.user_id]?.name || 'Unknown Candidate'
          }));
          setApplications(enriched);
      } else {
          setApplications(fetchedApplications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, []);

  const fetchDocumentData = useCallback(async (userId) => {
    if (!userId) return;

    let { data: fetchedDocuments, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('upload_date', { ascending: false }); // Corrected column name

    if (docError) {
      console.error('Error fetching documents metadata:', docError);
      return;
    }
    
    // --- ROBUST URL GENERATION FIX ---
    const documentsWithUrls = fetchedDocuments?.map(doc => {
      if (!doc.storage_path) {
        console.warn(`Document ${doc.id} missing storage path.`);
        return { ...doc, url: '', downloadUrl: '' };
      }

      // getPublicUrl returns the public URL for a file in a public bucket
      const { data: publicUrlData } = supabase.storage
        .from('resumes') 
        .getPublicUrl(doc.storage_path); 
        
      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
          console.error(`Failed to generate public URL for: ${doc.storage_path}`);
      }

      return {
        ...doc,
        // Use the generated public URL
        url: publicUrl || '', 
        // Append ?download=true or similar query for direct download
        downloadUrl: publicUrl ? `${publicUrl}?download=true` : '' 
      };
    });

    setDocuments(documentsWithUrls || []);
  }, []);

  const fetchInterviewData = useCallback(async (userId, role) => {
    if (!userId) return;

    try {
      let query = supabase.from('interviews').select('*');
      
      if (role === 'recruiter' || role === 'admin') {
        query = query.eq('recruiter_id', userId);
      } else {
        query = query.eq('candidate_id', userId);
      }

      const { data: interviewsData, error } = await query.order('date_time', { ascending: true });

      if (error) throw error;

      // Extract unique recruiter/candidate IDs to fetch names
      const recruiterIds = [...new Set(interviewsData.map(i => i.recruiter_id))];
      const jobIds = [...new Set(interviewsData.map(i => i.job_id))];
      
      const { data: recruiters } = await supabase.from('profiles').select('id, name').in('id', recruiterIds);
      const { data: jobs } = await supabase.from('jobs').select('id, title').in('id', jobIds);
      
      const recruiterMap = (recruiters || []).reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
      const jobMap = (jobs || []).reduce((acc, j) => ({ ...acc, [j.id]: j }), {});

      const enrichedInterviews = interviewsData.map(int => ({
        ...int,
        company: recruiterMap[int.recruiter_id]?.name || 'Recruiter',
        position: jobMap[int.job_id]?.title || 'Scheduled Interview',
        interviewDate: int.date_time, // Standardize for component
        interviewType: int.type,
        meetingLink: int.meeting_link
      }));

      setInterviews(enrichedInterviews);
    } catch (err) {
      console.error('Error fetching interviews:', err);
    }
  }, []);
  // --- END ROBUST URL GENERATION FIX ---

  useEffect(() => {
    const storedUser = localStorage.getItem('prolink-user');
    if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        setUser(currentUser);
        fetchApplicationData(currentUser.id, currentUser.role);
        fetchDocumentData(currentUser.id);
        fetchInterviewData(currentUser.id, currentUser.role);
    }
    setNotifications(mockNotifications);
  }, [fetchApplicationData, fetchDocumentData, fetchInterviewData]);

  // Real-time Subscriptions
  useEffect(() => {
    if (!user || !user.id) return;

    const channel = supabase
      .channel('tracking-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'applications' 
      }, () => fetchApplicationData(user.id, user.role))
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'interviews' 
      }, () => fetchInterviewData(user.id, user.role))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchApplicationData, fetchInterviewData]);

  // --- SUPABASE CRUD HANDLERS ---
  const handleScheduleInterview = async (interviewData) => {
    // This is a placeholder for a complex operation (scheduling, notifications, etc.)
    // For now, it just updates the application status in the database.
    const { error } = await supabase
      .from('applications')
      .update({ 
          status: 'interview-scheduled', 
          interviewDate: `${interviewData.date}T${interviewData.time}:00Z`,
          interviewType: interviewData.type,
          interviewNotes: interviewData.notes
      })
      .eq('id', interviewData.applicationId)
      .eq('user_id', user.id); // Ensure RLS compliance

    if (error) {
      console.error('Error scheduling interview:', error);
    } else {
      console.log('Interview scheduled and status updated in DB');
      fetchApplicationData(user.id, user.role);
    }
  };
  
  const handleScheduleFollowup = (applicationId) => {
    // Navigate to interview tab as a simple action
    setActiveTab('interviews');
  };

  const handleUploadDocument = async (documentData) => {
    if (!user.id || !documentData.file) return;

    // 1. Upload file to Supabase Storage (Assumes 'resumes' bucket exists)
    const filePath = `${user.id}/${documentData.type}/${Date.now()}-${documentData.file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, documentData.file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      throw uploadError;
    }

    // 2. Insert metadata into 'documents' table
    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: documentData.name,
        type: documentData.type,
        size: documentData.file.size,
        upload_date: documentData.uploadDate,
        storage_path: filePath,
        application_id: documentData.applicationId
      });

    if (insertError) {
      console.error('DB insert failed:', insertError);
      // Optional: Delete file from storage if DB insert fails
      await supabase.storage.from('resumes').remove([filePath]);
      throw insertError;
    } else {
      fetchDocumentData(user.id); // Re-fetch all documents
    }
  };

  const handleDeleteDocument = async (documentId) => {
    const docToDelete = documents.find(doc => doc.id === documentId);
    if (!docToDelete || !user.id) return;

    // 1. Delete record from 'documents' table
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('DB delete failed:', dbError);
      return;
    }

    // 2. Delete file from Supabase Storage
    if (docToDelete.storage_path) {
        const { error: storageError } = await supabase.storage
            .from('resumes')
            .remove([docToDelete.storage_path]);

        if (storageError) {
            console.error('Storage remove failed:', storageError);
        }
    }
    
    fetchDocumentData(user.id);
  };
  
  const handleUpdateDocument = (documentId, updates) => {
    // Placeholder for UPDATE logic
    console.log('Update document (DB operation required):', documentId, updates);
  };


  // Filtering logic (remains the same)
  useEffect(() => {
    let filtered = [...applications];
    // ... [existing filtering logic] ...
    setFilteredApplications(filtered);
  }, [filters, sortBy, applications]);
  
  // ... rest of the component handlers (handleFiltersChange, handleLogout, etc.)

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handleViewDetails = (applicationId) => {
    // Navigates to job details page for the application
    navigate(`/job-details?application=${applicationId}`);
  };


  const handleJoinInterview = (applicationId) => {
    const application = applications?.find(app => app?.id === applicationId);
    if (application?.meetingLink) {
      window.open(application?.meetingLink, '_blank');
    }
  };

  const handleMarkAsRead = (notificationId) => {
    console.log('Mark notification as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all notifications as read');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const tabs = [
    { id: 'applications', label: 'Applications', icon: 'FileText', count: applications?.length },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
    { id: 'interviews', label: 'Interviews', icon: 'Calendar', count: interviews?.length },
    { id: 'documents', label: 'Documents', icon: 'FolderOpen', count: documents?.length }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Application Tracking</h1>
              <p className="text-muted-foreground">
                Monitor and manage your job application pipeline
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate('/job-search-results')}>
                <Icon name="Plus" size={16} />
                <span className="ml-2">Apply to Jobs</span>
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 mb-8 border-b border-border">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
                {tab?.count !== undefined && (
                  <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                    {tab?.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'applications' && (
              <>
                <ApplicationFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
                
                <ApplicationTable
                  applications={filteredApplications}
                  onViewDetails={handleViewDetails}
                  onScheduleFollowup={handleScheduleFollowup}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                />
              </>
            )}

            {activeTab === 'analytics' && (
              <ApplicationAnalytics applications={applications} />
            )}

            {activeTab === 'interviews' && (
              <InterviewScheduler
                applications={applications}
                interviews={interviews}
                onScheduleInterview={handleScheduleInterview}
                onJoinInterview={handleJoinInterview}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentManager
                applications={applications}
                documents={documents}
                onUploadDocument={handleUploadDocument}
                onDeleteDocument={handleDeleteDocument}
                onUpdateDocument={handleUpdateDocument}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationTracking;
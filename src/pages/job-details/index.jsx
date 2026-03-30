import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';

import QuickActionMenu from '../../components/ui/QuickActionMenu';
import JobHeader from './components/JobHeader';
import JobDescription from './components/JobDescription';
import CompanyProfile from './components/CompanyProfile';
import SkillsMatch from './components/SkillsMatch';
import SimilarJobs from './components/SimilarJobs';
import ApplicationModal from './components/ApplicationModal';
import SalaryInsights from './components/SalaryInsights';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../supabaseClient'; // Import supabase

const JobDetailsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Using a valid UUID for mock data link
  const jobId = searchParams?.get('id');

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock user data - fetch from local storage for ID/Role
  const storedUser = JSON.parse(localStorage.getItem('prolink-user') || '{}');
  const currentUser = {
    id: storedUser.id || 'mock-user-id',
    name: storedUser.name || "User",
    email: storedUser.email || "user@prolink.in",
    role: storedUser.role || "job_seeker",
    skills: storedUser.skills || []
  };

  // Check if the user has already applied/saved this job
  const checkJobStatus = async (jobId, userId) => {
    if (!userId || !jobId || userId === 'mock-user-id') return;

    // Check if applied
    const { data: appliedData, error: appliedError } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .limit(1);

    if (appliedError) console.error("Error checking applied status:", appliedError);
  };

  useEffect(() => {
    const loadJobData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let targetJobId = searchParams.get('id');

        // 1. If application ID is provided, find the associated Job ID
        const applicationId = searchParams.get('application');
        if (applicationId) {
          const { data: appData, error: appError } = await supabase
            .from('applications')
            .select('job_id')
            .eq('id', applicationId)
            .single();
          
          if (appError) throw new Error(`Application not found: ${appError.message}`);
          if (appData) targetJobId = appData.job_id;
        }

        if (!targetJobId) {
            setIsLoading(false);
            return;
        }

        // 2. Fetch Job Details Joined with Recruiter Profile
        let { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            recruiter:profiles!recruiter_id (
              id,
              name,
              avatar_url,
              company_name,
              company_size,
              company_description
            )
          `)
          .eq('id', targetJobId)
          .single();

        // If join failed, try fetching job then profile separately
        if (jobError || !jobData?.recruiter) {
            const { data: fallbackJob, error: fallbackError } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', targetJobId)
                .single();
            
            if (fallbackError) throw fallbackError;
            
            if (fallbackJob?.recruiter_id) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', fallbackJob.recruiter_id)
                    .single();
                
                jobData = { ...fallbackJob, recruiter: profileData };
            } else {
                jobData = fallbackJob;
            }
        }

        if (jobData) {
          // Map to component format
          const companyInfo = {
            id: jobData.recruiter?.id,
            name: jobData.recruiter?.company_name || jobData.recruiter?.name || jobData.company_name || "Company",
            logo: jobData.recruiter?.avatar_url || "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop&crop=center",
            size: jobData.recruiter?.company_size || "Not specified",
            description: jobData.recruiter?.company_description || "No description provided.",
            industry: jobData.category || "Technology",
            headquarters: jobData.location,
            rating: 4.5,
            reviewCount: 120,
            tagline: `Leading the way in ${jobData.category || 'Innovation'}.`,
            openJobs: 0
          };

          const formattedJob = {
            ...jobData,
            company: companyInfo
          };

          // 3. Fetch count of open jobs for this company
          const { count: openJobsCount } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('recruiter_id', jobData.recruiter_id);
          
          formattedJob.company.openJobs = openJobsCount || 0;
          setJob(formattedJob);

          // 4. Fetch "More from this Company"
          const { data: otherJobsData } = await supabase
            .from('jobs')
            .select('*')
            .eq('recruiter_id', jobData.recruiter_id)
            .neq('id', targetJobId)
            .limit(3);
          
          // Format similar jobs with company info
          const formattedOtherJobs = (otherJobsData || []).map(oj => ({
              ...oj,
              company: companyInfo
          }));
          
          setSimilarJobs(formattedOtherJobs);

          // 5. Check application status
          if (currentUser.id && currentUser.id !== 'mock-user-id') {
              checkJobStatus(targetJobId, currentUser.id);
          }
        }
 else {
            console.warn('No job found with ID:', targetJobId);
        }
      } catch (error) {
        console.error('Error loading job details:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobData();
  }, [searchParams, currentUser.id]);

  const handleApply = () => {
    if (isApplied) return;
    setIsApplicationModalOpen(true);
  };


  const handleApplicationSubmit = async (applicationData) => {
    if (!currentUser.id || !job) {
        console.error("Cannot submit application: User or Job data missing.");
        return;
    }

    // 1. Insert new application record into the 'applications' table
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: currentUser.id,
        job_id: job.id,
        company: job.company.name,
        position: job.title,
        appliedDate: new Date().toISOString(),
        status: 'applied', // Initial status
        expected_salary: applicationData.expectedSalary,
        cover_letter: applicationData.customCoverLetter || applicationData.coverLetter,
        // Assuming other fields like resume/questions are in separate tables/columns
      })
      .select()
      .single();

    if (error) {
      console.error('Application submission failed:', error);
      throw new Error('Failed to submit application to database.');
    }
    
    setIsApplied(true);
    console.log('Application submitted successfully:', data);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'search-jobs': navigate('/job-search-results');
        break;
      case 'view-applications': navigate('/application-tracking');
        break;
      case 'update-profile': navigate('/profile');
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  const handleNotificationAction = (notificationId) => {
    console.log('Mark notification as read:', notificationId);
  };

  const handleMarkAllNotificationsRead = () => {
    console.log('Mark all notifications as read');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
            <div className="animate-pulse space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-96 bg-card border border-border rounded-lg"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-64 bg-card border border-border rounded-lg"></div>
                  <div className="h-64 bg-card border border-border rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={currentUser} onLogout={handleLogout} />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
            <div className="text-center py-12">
              <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h1>
              <p className="text-muted-foreground mb-6">
                {error || "The job you're looking for doesn't exist or has been removed."}
              </p>
              <Button onClick={() => navigate('/job-search-results')}>
                Browse All Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={currentUser} onLogout={handleLogout} />
      {/* Main Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              iconName="ArrowLeft"
              iconPosition="left"
              className="text-muted-foreground hover:text-foreground"
            >
              Back to Search Results
            </Button>
          </div>

          {/* Job Header */}
          <div className="mb-8">
            <JobHeader
              job={job}
              onApply={handleApply}
              isApplied={isApplied}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Job Details */}
            <div className="lg:col-span-2 space-y-8">
              <JobDescription job={job} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <CompanyProfile company={job?.company} />
              
              <SkillsMatch
                jobSkills={job?.skills}
                userSkills={currentUser?.skills}
                matchPercentage={Math.round((currentUser?.skills?.filter(userSkill => 
                  job?.skills?.some(jobSkill => jobSkill?.toLowerCase() === userSkill?.name?.toLowerCase())
                )?.length / job?.skills?.length) * 100)}
              />

              <SalaryInsights 
                job={job} 
                marketData={{ 
                  average: job?.salary?.avg || 1500000, 
                  percentile25: job?.salary?.min || 1200000, 
                  percentile75: job?.salary?.max || 2200000 
                }} 
              />

              <SimilarJobs jobs={similarJobs} currentJobId={job?.id} />
            </div>
          </div>
        </div>
      </div>
      {/* Application Modal */}
      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        job={job}
        onSubmit={handleApplicationSubmit}
      />
      {/* Quick Action Menu */}
      <QuickActionMenu
        user={currentUser}
        onAction={handleQuickAction}
        variant="floating"
      />
      {/* Sticky Apply Button (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border z-40">
        <div className="flex space-x-3">
          <Button
            variant={isApplied ? "outline" : "default"}
            fullWidth
            onClick={handleApply}
            disabled={isApplied}
            iconName={isApplied ? "Check" : "Send"}
            iconPosition="left"
          >
            {isApplied ? "Applied" : "Apply Now"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
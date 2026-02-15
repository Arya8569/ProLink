import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import QuickActionMenu from '../../components/ui/QuickActionMenu';
import ApplicationStatusCard from './components/ApplicationStatusCard';
import JobRecommendationCard from './components/JobRecommendationCard';
import ProfileCompletionCard from './components/ProfileCompletionCard';
import InterviewScheduleCard from './components/InterviewScheduleCard';
import SkillAnalysisCard from './components/SkillAnalysisCard';
import JobAlertsCard from './components/JobAlertsCard';
import ApplicationMetricsChart from './components/ApplicationMetricsChart';
import QuickActionsPanel from './components/QuickActionsPanel';
import Icon from '../../components/AppIcon';
import QuickApplyModal from '../job-search-results/components/QuickApplyModal';
import { supabase } from '../../supabaseClient';

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real Data State
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    successRate: 0
  });

  // Modal State
  const [selectedJob, setSelectedJob] = useState(null);
  const [showQuickApply, setShowQuickApply] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const storedUser = localStorage.getItem('prolink-user');
      if (!storedUser) {
        navigate('/login', { replace: true });
        return;
      }

      const currentUser = JSON.parse(storedUser);
      if (currentUser.role !== 'jobSeeker') {
        navigate('/recruiter-dashboard', { replace: true });
        return;
      }

      setUser(currentUser);

      try {
        // 1. Fetch Job Recommendations (Recent 3 jobs)
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active')
          .order('posted_date', { ascending: false })
          .limit(3);

        if (!jobsError && jobsData) {
          // Fetch recruiters for company names
          const recruiterIds = [...new Set(jobsData.map(j => j.recruiter_id))];
          const { data: recruiters } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', recruiterIds);

          const recruiterMap = (recruiters || []).reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

          const mappedRecs = jobsData.map(job => ({
            id: job.id,
            title: job.title,
            company: recruiterMap[job.recruiter_id]?.name || 'Confidential',
            location: job.location,
            salaryMin: null,
            salaryMax: null,
            matchScore: Math.floor(Math.random() * 20) + 80,
            tags: job.requirements ? job.requirements.slice(0, 3) : [],
            postedDate: job.posted_date
          }));
          setRecommendations(mappedRecs);
        }

        // 2. Fetch Applications
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('appliedDate', { ascending: false });

        if (!appsError && appsData) {
          const mappedApps = appsData.map(app => ({
            id: app.id,
            position: app.position,
            company: app.company,
            status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
            appliedDate: app.appliedDate,
            hasUpdate: false
          }));

          setApplications(mappedApps);
          setStats({
            totalApplications: appsData.length,
            successRate: appsData.filter(a => ['hired', 'offer', 'interview'].includes(a.status)).length > 0
              ? Math.round((appsData.filter(a => ['hired', 'offer', 'interview'].includes(a.status)).length / appsData.length) * 100)
              : 0
          });
        }

        // 3. Fetch Interviews
        const { data: interviewsData, error: interviewsError } = await supabase
          .from('interviews')
          .select('*')
          .eq('candidate_id', currentUser.id)
          .gte('date_time', new Date().toISOString())
          .order('date_time', { ascending: true });

        if (!interviewsError && interviewsData) {
          const recruiterIds = [...new Set(interviewsData.map(i => i.recruiter_id))];
          const { data: recruiters } = await supabase.from('profiles').select('id, name').in('id', recruiterIds);
          const recruiterMap = (recruiters || []).reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

          const mappedInterviews = interviewsData.map(int => ({
            id: int.id,
            position: 'Scheduled Interview',
            company: recruiterMap[int.recruiter_id]?.name || 'Recruiter',
            interviewer: recruiterMap[int.recruiter_id]?.name,
            scheduledAt: int.date_time,
            type: int.type,
            meetingLink: int.meeting_link,
            notes: int.notes
          }));
          setInterviews(mappedInterviews);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem('prolink-user');
    setUser(null);
    navigate('/login');
    if (error) console.error('Supabase sign out error:', error);
  };

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'search-jobs': navigate('/job-search-results'); break;
      case 'view-applications': navigate('/application-tracking'); break;
      default: console.log(`Action: ${actionId}`);
    }
  };

  const handleSearch = (query, filters) => {
    navigate('/job-search-results', { state: { searchQuery: query, filters } });
  };

  const handleViewAllApplications = () => {
    navigate('/application-tracking');
  };

  // --- Quick Apply Handlers ---
  const handleQuickApply = (jobId) => {
    const job = recommendations.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowQuickApply(true);
    }
  };

  const handleApplicationSubmit = async (applicationData) => {
    if (!user || !user.id) throw new Error('User not authenticated');

    const { jobId, resume, coverLetter, expectedSalary, availabilityDate, additionalInfo } = applicationData;

    // 1. Upload Resume
    // Clean filename to avoid issues
    const cleanFileName = resume.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `${user.id}/${jobId}-${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, resume);

    if (uploadError) throw new Error(`Resume upload failed: ${uploadError.message}`);

    // 2. Insert Application
    const { error: insertError } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_id: jobId,
        company: selectedJob?.company || 'Unknown',
        position: selectedJob?.title || 'Unknown',
        appliedDate: new Date().toISOString(),
        status: 'applied',
        expected_salary: expectedSalary,
        availability_date: availabilityDate,
        cover_letter: coverLetter,
        additional_info: additionalInfo,
        resume_storage_path: filePath
      });

    if (insertError) {
      // Cleanup file
      await supabase.storage.from('resumes').remove([filePath]);
      throw new Error(insertError.message);
    }

    // 3. Update UI
    setApplications(prev => [{
      id: Date.now(),
      position: selectedJob?.title,
      company: selectedJob?.company,
      status: 'Applied',
      appliedDate: new Date().toISOString(),
      hasUpdate: false
    }, ...prev]);

    setStats(prev => ({
      ...prev,
      totalApplications: prev.totalApplications + 1
    }));

    setShowQuickApply(false);
    setSelectedJob(null);
  };

  // --- Placeholder Handlers ---
  const handleViewCalendar = () => { };
  const handleJoinInterview = () => { };
  const handleUpdateProfile = () => { };
  const handleViewCourses = () => { };
  const handleStartLearning = () => { };
  const handleCreateAlert = () => { };
  const handleViewAlert = () => { };
  const handleViewAnalytics = () => { };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={handleLogout} />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Welcome back, {user?.name?.split(' ')?.[0]}! 👋
                </h1>
                <p className="text-muted-foreground">
                  Here's what's happening with your job search today.
                </p>
              </div>

              <div className="hidden lg:flex items-center space-x-4">
                <NotificationIndicator
                  user={user}
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
                <QuickActionMenu
                  user={user}
                  onAction={handleQuickAction}
                  variant="dropdown"
                />
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Primary Content */}
            <div className="lg:col-span-8 space-y-6">
              <JobRecommendationCard
                recommendations={recommendations}
                onSearch={handleSearch}
                onApplyQuick={handleQuickApply}
              />
              <ApplicationStatusCard
                applications={applications}
                onViewAll={handleViewAllApplications}
              />
              <ApplicationMetricsChart
                applicationData={applications}
                successRate={stats.successRate}
                totalApplications={stats.totalApplications}
                onViewAnalytics={handleViewAnalytics}
              />
              <JobAlertsCard
                alerts={[]}
                savedSearches={[]}
                onCreateAlert={handleCreateAlert}
                onViewAlert={handleViewAlert}
                onQuickApply={handleQuickApply}
              />
            </div>

            {/* Right Column - Secondary Content */}
            <div className="lg:col-span-4 space-y-6">
              <ProfileCompletionCard
                completionScore={75}
                missingItems={[]}
                achievements={[]}
                onUpdateProfile={handleUpdateProfile}
              />
              <InterviewScheduleCard
                interviews={interviews}
                onViewCalendar={handleViewCalendar}
                onJoinInterview={handleJoinInterview}
              />
              <SkillAnalysisCard
                skillGaps={[]}
                recommendations={[]}
                onViewCourses={handleViewCourses}
                onStartLearning={handleStartLearning}
              />
              <QuickActionsPanel
                user={user}
                onAction={handleQuickAction}
              />
            </div>
          </div>
        </div>
      </main>

      <QuickActionMenu
        user={user}
        onAction={handleQuickAction}
        variant="floating"
        className="lg:hidden"
      />

      <QuickApplyModal
        job={selectedJob}
        isOpen={showQuickApply}
        onClose={() => {
          setShowQuickApply(false);
          setSelectedJob(null);
        }}
        onSubmit={handleApplicationSubmit}
      />
    </div>
  );
};

export default JobSeekerDashboard;
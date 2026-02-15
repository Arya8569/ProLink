import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import Header from '../../components/ui/Header';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import QuickActionMenu from '../../components/ui/QuickActionMenu';
import JobPostingCard from './components/JobPostingCard';
import PipelineOverview from './components/PipelineOverview';
import ActivityFeed from './components/ActivityFeed';
import QuickActionsPanel from './components/QuickActionsPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import InterviewScheduler from './components/InterviewScheduler';
import PostJobModal from './components/PostJobModal';
import ScheduleInterviewModal from './components/ScheduleInterviewModal';
import CandidateDetailsModal from './components/CandidateDetailsModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Real Data State
  const [jobs, setJobs] = useState([]);
  const [pipelineData, setPipelineData] = useState({
    applied: [], screening: [], interview: [], offer: [], hired: [], rejected: []
  });
  const [interviews, setInterviews] = useState([]);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const storedUser = localStorage.getItem('prolink-user');
      if (!storedUser) {
        navigate('/login', { replace: true });
        return;
      }

      const currentUser = JSON.parse(storedUser);
      if (currentUser.role !== 'recruiter' && currentUser.role !== 'admin') {
        navigate('/job-seeker-dashboard', { replace: true });
        return;
      }

      setUser(currentUser);

      try {
        // 1. Fetch Jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('recruiter_id', currentUser.id)
          .order('posted_date', { ascending: false });

        if (jobsError) throw jobsError;
        setJobs(jobsData || []);

        // 2. Fetch Applications & Pipeline Data
        let appsData = [];
        if (jobsData && jobsData.length > 0) {
          const jobIds = jobsData.map(j => j.id);
          const { data, error } = await supabase
            .from('applications')
            .select('*')
            .in('job_id', jobIds);

          if (error) throw error;
          appsData = data || [];
        }

        // 3. Fetch Interviews
        const { data: interviewsData, error: interviewsError } = await supabase
          .from('interviews')
          .select('*')
          .eq('recruiter_id', currentUser.id)
          .order('date_time', { ascending: true });

        if (interviewsError) throw interviewsError;

        // 4. Fetch Profiles for Applications & Interviews
        const appUserIds = appsData.map(a => a.user_id);
        const interviewCandidateIds = (interviewsData || []).map(i => i.candidate_id);
        const uniqueUserIds = [...new Set([...appUserIds, ...interviewCandidateIds])];

        let profilesMap = {};
        if (uniqueUserIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, email')
            .in('id', uniqueUserIds);

          if (profilesError) throw profilesError;
          profilesMap = (profilesData || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        }

        // 5. Process Pipeline Data
        const jobsMap = (jobsData || []).reduce((acc, j) => ({ ...acc, [j.id]: j }), {});
        const processedPipeline = {
          applied: [], screening: [], interview: [], offer: [], hired: [], rejected: []
        };

        appsData.forEach(app => {
          const profile = profilesMap[app.user_id] || {};
          const job = jobsMap[app.job_id] || {};
          // Default to 'applied' if status is invalid or missing
          const stage = (app.status && processedPipeline[app.status]) ? app.status : 'applied';

          processedPipeline[stage].push({
            id: app.id,
            name: profile.name || 'Unknown Candidate',
            position: job.title || 'Unknown Role',
            stage: stage,
            matchScore: 85, // Mock score
            experience: app.additional_info || 'See Resume',
            lastActivity: new Date(app.created_at).toLocaleDateString(),
            priority: 'normal',
            user_id: app.user_id,
            job_id: app.job_id,
            email: profile.email,
            resumeUrl: app.resume_url
          });
        });
        setPipelineData(processedPipeline);

        // 6. Process Interviews
        const processedInterviews = (interviewsData || []).map(interview => ({
          ...interview,
          candidate: { name: profilesMap[interview.candidate_id]?.name || 'Unknown' },
          dateTime: interview.date_time, // Standardize prop name
          duration: '1h',
          position: jobsMap[interview.job_id]?.title || 'Interview',
          status: interview.status || 'confirmed'
        }));
        setInterviews(processedInterviews);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndFetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('prolink-user');
    setUser(null);
    navigate('/login');
  };

  const handleJobPosted = (newJob) => {
    // Add to list optimistically
    setJobs(prev => [newJob, ...prev]);
  };

  const handleInterviewScheduled = (newInterview) => {
    // Re-fetch is safer, but let's append for now if we have candidate info
    // Since we don't have the candidate name immediately without fetching profile, 
    // let's just trigger a re-fetch logic or simple reload. 
    // For now, simple reload of page or re-running data fetch would be ideal.
    // We'll append with a placeholder name to update UI immediately
    setInterviews(prev => [...prev, {
      ...newInterview,
      dateTime: newInterview.date_time,
      candidate: { name: 'New Candidate' }, // Placeholder
      position: 'Scheduled Interview'
    }]);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'post-job':
        setIsPostJobModalOpen(true);
        break;
      case 'schedule-interview':
        setIsScheduleModalOpen(true);
        break;
      case 'search-candidates':
        setActiveTab('pipeline');
        break;
      case 'resume-screening':
        setActiveTab('pipeline');
        break;
      case 'recent-applications':
        setActiveTab('pipeline');
        break;
      case 'pending-interviews':
        setActiveTab('interviews');
        break;
      default: console.log(`Action: ${action}`);
    }
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsModalOpen(true);
  };

  const handlePipelineStageChange = async (applicationId, newStage) => {
    // Optimistic UI Update
    setPipelineData(prev => {
      const newData = { ...prev };
      let movedCandidate = null;
      Object.keys(newData).forEach(stage => {
        const idx = newData[stage].findIndex(c => c.id === applicationId);
        if (idx !== -1) {
          movedCandidate = newData[stage][idx];
          newData[stage].splice(idx, 1);
        }
      });

      // Ensure target array exists
      if (!newData[newStage]) newData[newStage] = [];

      if (movedCandidate) {
        newData[newStage].push({ ...movedCandidate, stage: newStage });
      }
      return newData;
    });

    // Supabase Update
    const { error } = await supabase
      .from('applications')
      .update({ status: newStage })
      .eq('id', applicationId);

    if (error) {
      console.error('Error updating stage:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'jobs', label: 'Job Postings', icon: 'Briefcase' },
    { id: 'pipeline', label: 'Pipeline', icon: 'Users' },
    { id: 'interviews', label: 'Interviews', icon: 'Calendar' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' }
  ];

  // Calculate Stats & Metrics
  const calculateStats = () => {
    // Recent Apps (last 7 days) - utilizing 'applied' stage as proxy for now
    const recentAppsCount = pipelineData.applied?.length || 0;

    return {
      recentApplications: recentAppsCount,
      pendingInterviews: interviews.filter(i => i.status !== 'completed' && i.status !== 'cancelled').length,
      offersSent: pipelineData.offer?.length || 0,
      unreadMessages: 0
    };
  };

  const calculateMetrics = () => {
    const totalApps = Object.values(pipelineData).flat().length;
    const totalInterviews = interviews.length;
    const totalHires = pipelineData.hired?.length || 0;
    const totalOffers = (pipelineData.offer?.length || 0) + totalHires;
    const totalScreening = (pipelineData.screening?.length || 0) + (pipelineData.interview?.length || 0) + totalOffers;

    // Simple Funnel based on "passed through" assumption
    const funnelData = [
      { stage: 'Applications', count: totalApps, percentage: 100 },
      { stage: 'Screening', count: totalScreening, percentage: totalApps ? Math.round((totalScreening / totalApps) * 100) : 0 },
      { stage: 'Interview', count: (pipelineData.interview?.length || 0) + totalOffers, percentage: totalApps ? Math.round(((pipelineData.interview?.length || 0) + totalOffers) / totalApps * 100) : 0 },
      { stage: 'Offer', count: totalOffers, percentage: totalApps ? Math.round(totalOffers / totalApps * 100) : 0 },
      { stage: 'Hired', count: totalHires, percentage: totalApps ? Math.round(totalHires / totalApps * 100) : 0 }
    ];

    return {
      totalApplications: totalApps,
      totalInterviews,
      totalHires,
      offersSent: pipelineData.offer?.length || 0,
      funnelData,
      conversionRates: {
        interview: totalApps ? Math.round((totalInterviews / totalApps) * 100) + '%' : '0%',
        offer: totalInterviews ? Math.round((totalOffers / totalInterviews) * 100) + '%' : '0%',
        acceptance: totalOffers ? Math.round((totalHires / totalOffers) * 100) + '%' : '0%'
      }
    };
  };

  const dashboardStats = calculateStats();
  const dashboardMetrics = calculateMetrics();

  const getJobStats = (jobId) => {
    let stats = {
      totalApplications: 0,
      shortlisted: 0,
      interviewed: 0,
      qualityScore: 85 // Mock score for now
    };

    Object.entries(pipelineData).forEach(([stage, candidates]) => {
      const jobCandidates = candidates.filter(c => c.job_id === jobId);
      stats.totalApplications += jobCandidates.length;

      if (stage === 'screening') stats.shortlisted += jobCandidates.length;
      if (stage === 'interview') stats.interviewed += jobCandidates.length;
    });

    return stats;
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        <p className="text-muted-foreground ml-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onLogout={handleLogout} />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Recruiter Dashboard</h1>
              <p className="text-muted-foreground">Manage your hiring pipeline and job postings.</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Button onClick={() => setIsScheduleModalOpen(true)} variant="outline">
                <Icon name="Calendar" size={16} className="mr-2" />
                Schedule Interview
              </Button>
              <Button onClick={() => setIsPostJobModalOpen(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                Post New Job
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 border-b border-border mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Content Area */}
            <div className="lg:col-span-8 space-y-6">

              {activeTab === 'overview' && (
                <>
                  {/* Recent Job Postings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">Recent Job Postings</h2>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('jobs')}>View All</Button>
                    </div>

                    {jobs.length === 0 ? (
                      <div className="p-8 text-center bg-muted/30 rounded-lg border border-border">
                        <p className="text-muted-foreground">No jobs posted yet.</p>
                      </div>
                    ) : (
                      jobs.slice(0, 3).map(job => (
                        <JobPostingCard
                          key={job.id}
                          job={{
                            ...job,
                            postedDate: new Date(job.posted_date).toLocaleDateString(),
                            expiryDate: 'Open',
                            ...getJobStats(job.id)
                          }}
                          onViewDetails={() => { }}
                        />
                      ))
                    )}
                  </div>

                  {/* Pipeline Overview */}
                  <div className="mt-8">
                    <PipelineOverview
                      pipelineData={pipelineData}
                      onStageChange={handlePipelineStageChange}
                      onViewCandidate={handleViewCandidate}
                    />
                  </div>
                </>
              )}

              {activeTab === 'jobs' && (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <JobPostingCard
                      key={job.id}
                      job={{
                        ...job,
                        ...job,
                        postedDate: new Date(job.posted_date).toLocaleDateString(),
                        ...getJobStats(job.id)
                      }}
                      onViewDetails={() => { }}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'pipeline' && (
                <PipelineOverview
                  pipelineData={pipelineData}
                  onStageChange={handlePipelineStageChange}
                  onViewCandidate={handleViewCandidate}
                />
              )}

              {activeTab === 'interviews' && (
                <InterviewScheduler
                  upcomingInterviews={interviews}
                  onScheduleInterview={() => setIsScheduleModalOpen(true)}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsPanel
                  metrics={dashboardMetrics}
                />
              )}

            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <QuickActionsPanel onAction={handleQuickAction} stats={dashboardStats} />
              <InterviewScheduler
                upcomingInterviews={interviews}
                onScheduleInterview={() => setIsScheduleModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </main>

      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onJobPosted={handleJobPosted}
        user={user}
      />

      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onInterviewScheduled={handleInterviewScheduled}
        user={user}
        jobs={jobs}
        candidates={Object.values(pipelineData).flat()}
      />

      <CandidateDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        candidate={selectedCandidate}
        onScheduleInterview={(candidate) => {
          // Optional: Pre-fill schedule modal
          setIsScheduleModalOpen(true);
        }}
        onReject={async (candidate) => {
          await handlePipelineStageChange(candidate.id, 'rejected');
        }}
      />
    </div>
  );
};

export default RecruiterDashboard;
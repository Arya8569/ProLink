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
import ApplicationMetricsChart from './components/ApplicationMetricsChart';
import QuickActionsPanel from './components/QuickActionsPanel';
import Icon from '../../components/AppIcon';
import QuickApplyModal from '../job-search-results/components/QuickApplyModal';
import { supabase } from '../../supabaseClient';
import { extractTextFromPDF } from '../../utils/pdf-util';
import { matchJobsWithGroq, generateSkillGapAnalysis } from '../../utils/groq';

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [resumeName, setResumeName] = useState(null);

  // Real Data State
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    successRate: 0,
    profileCompletion: 0,
    missingItems: []
  });
  const [skillAnalysis, setSkillAnalysis] = useState({
    skillGaps: [],
    recommendations: [],
    isLoading: false
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
      console.log('Dashboard: Current User from localStorage:', currentUser);
      
      if (currentUser.role !== 'jobSeeker') {
        console.warn('Dashboard: User role mismatch, redirecting...', currentUser.role);
        navigate('/recruiter-dashboard', { replace: true });
        return;
      }

      setUser(currentUser);

      try {
        console.log('Dashboard: Fetching data for user ID:', currentUser.id);
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
            matchScore: null,
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
            status: app.status, // Keep raw status for mapping components
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

        // 4. Calculate Profile Completion
        const missing = [];
        let score = 0;
        
        if (currentUser.name) score += 20; else missing.push({ id: 'name', title: 'Full Name', description: 'Add your name to your profile', points: 20, type: 'skills' });
        if (currentUser.email) score += 20;
        if (currentUser.role) score += 10;
        
        // Check for applications as proxy for resume
        if (appsData?.length > 0) {
          score += 30;
        } else {
          missing.push({ id: 'resume', title: 'Upload Resume', description: 'Apply for a job to upload your resume', points: 30, type: 'resume' });
        }
        
        // Mocking some missing items for UX if profile is very empty
        if (score < 100 && missing.length === 0) {
          missing.push({ id: 'skills', title: 'Add Skills', description: 'List your top professional skills', points: 15, type: 'skills' });
          missing.push({ id: 'photo', title: 'Profile Photo', description: 'Add a professional headshot', points: 5, type: 'photo' });
        }

        setStats(prev => ({
          ...prev,
          profileCompletion: score,
          missingItems: missing
        }));

        // 5. Generate Skill Gap Analysis
        if (currentUser.id) {
            setSkillAnalysis(prev => ({ ...prev, isLoading: true }));
            try {
                // Get full profile for skills
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('skills')
                    .eq('id', currentUser.id)
                    .single();
                
                const userSkills = profile?.skills || [];
                
                if (userSkills.length > 0 && jobsData?.length > 0) {
                    const analysis = await generateSkillGapAnalysis(userSkills, jobsData);
                    setSkillAnalysis({
                        skillGaps: analysis.skillGaps || [],
                        isLoading: false
                    });
                } else {
                    setSkillAnalysis(prev => ({ ...prev, isLoading: false }));
                }
            } catch (err) {
                console.error('Skill Analysis Error:', err);
                setSkillAnalysis(prev => ({ ...prev, isLoading: false }));
            }
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Real-time Subscriptions
  useEffect(() => {
    if (!user || !user.id) return;

    // 1. Listen for Application Status Updates
    const appsChannel = supabase
      .channel(`user-apps-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'applications',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        const updatedApp = payload.new;
        
        // Update applications list
        setApplications(prev => prev.map(app => 
          app.id === updatedApp.id 
            ? { 
                ...app, 
                status: updatedApp.status,
                hasUpdate: true 
              } 
            : app
        ));

        // Add local notification
        const newNotif = {
          id: Date.now(),
          type: 'application',
          title: 'Application Status Updated',
          message: `Your application for ${updatedApp.position} at ${updatedApp.company} is now ${updatedApp.status}.`,
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
      })
      .subscribe();

    // 2. Listen for New Interviews
    const interviewsChannel = supabase
      .channel(`user-interviews-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'interviews',
        filter: `candidate_id=eq.${user.id}`
      }, async (payload) => {
        const newInt = payload.new;

        // Fetch recruiter info for the notification
        const { data: recProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', newInt.recruiter_id)
          .single();

        const companyName = recProfile?.name || 'Recruiter';

        // Add to interviews list
        setInterviews(prev => [{
          id: newInt.id,
          position: 'Technical Interview',
          company: companyName,
          interviewer: companyName,
          scheduledAt: newInt.date_time,
          type: newInt.type,
          meetingLink: newInt.meeting_link,
          notes: newInt.notes
        }, ...prev]);

        // Add local notification
        const newNotif = {
          id: `int-${newInt.id}`,
          type: 'interview',
          title: 'New Interview Scheduled',
          message: `You have a new ${newInt.type} interview with ${companyName} on ${new Date(newInt.date_time).toLocaleDateString()}.`,
          timestamp: new Date().toISOString(),
          read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(appsChannel);
      supabase.removeChannel(interviewsChannel);
    };
  }, [user]);

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

  const handleResumeUpload = async (file) => {
    if (!file) return;
    
    setIsMatching(true);
    setResumeName(file.name);
    
    try {
      // 1. Extract text from PDF
      const text = await extractTextFromPDF(file);
      console.log('Extracted Resume Text (first 100 chars):', text.substring(0, 100));

      // 2. Fetch all active jobs for matching
      const { data: allJobs, error: allJobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active');

      if (allJobsError) throw allJobsError;

      // 3. Call Groq for matching
      const aiMatches = await matchJobsWithGroq(text, allJobs);
      console.log('AI Matches from Groq:', aiMatches);

      // 4. Map and Display Recommendations
      if (aiMatches && aiMatches.length > 0) {
        const matchedJobIds = aiMatches.map(m => m.id);
        const matchedJobs = allJobs.filter(j => matchedJobIds.includes(j.id));

        // Fetch recruiters for company names
        const recruiterIds = [...new Set(matchedJobs.map(j => j.recruiter_id))];
        const { data: recruiters } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', recruiterIds);

        const recruiterMap = (recruiters || []).reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

        const mappedRecs = aiMatches.map(match => {
          const job = matchedJobs.find(j => j.id === match.id);
          if (!job) return null;
          return {
            id: job.id,
            title: job.title,
            company: recruiterMap[job.recruiter_id]?.name || 'Confidential',
            location: job.location,
            salaryMin: null,
            salaryMax: null,
            matchScore: match.matchScore,
            matchReason: match.reason,
            tags: job.requirements ? job.requirements.slice(0, 3) : [],
            postedDate: job.posted_date,
            isAiMatch: true
          };
        }).filter(Boolean);

        setRecommendations(mappedRecs);
      }
    } catch (error) {
      console.error('Error during AI matching:', error);
      alert(error.message || 'Failed to match jobs with resume.');
    } finally {
      setIsMatching(false);
    }
  };

  // --- Placeholder Handlers ---
  const handleViewCalendar = () => { };
  const handleJoinInterview = (interviewId) => {
    const interview = interviews.find(i => i.id === interviewId);
    if (interview && interview.meetingLink) {
      window.open(interview.meetingLink, '_blank', 'noopener,noreferrer');
    } else {
      alert('Meeting link not found for this interview.');
    }
  };
  const handleUpdateProfile = () => { navigate('/profile'); };
  const handleViewCourses = () => { };
  const handleStartLearning = () => { };
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
                onResumeUpload={handleResumeUpload}
                isMatching={isMatching}
                resumeName={resumeName}
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
            </div>

            {/* Right Column - Secondary Content */}
            <div className="lg:col-span-4 space-y-6">
              <ProfileCompletionCard
                completionScore={stats.profileCompletion}
                missingItems={stats.missingItems}
                achievements={[]}
                onUpdateProfile={handleUpdateProfile}
              />
              <InterviewScheduleCard
                interviews={interviews}
                onViewCalendar={handleViewCalendar}
                onJoinInterview={handleJoinInterview}
              />
              <SkillAnalysisCard
                skillGaps={skillAnalysis.skillGaps}
                isLoading={skillAnalysis.isLoading}
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
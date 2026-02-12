import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import NotificationIndicator from '../../components/ui/NotificationIndicator';
import QuickActionMenu from '../../components/ui/QuickActionMenu';
import JobPostingCard from './components/JobPostingCard';
import PipelineOverview from './components/PipelineOverview';
import ActivityFeed from './components/ActivityFeed';
import QuickActionsPanel from './components/QuickActionsPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import InterviewScheduler from './components/InterviewScheduler';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Mock data definitions (removed for brevity, assume they still exist) ---
  const jobPostings = [ /* ... */ ];
  const pipelineData = { /* ... */ };
  const activities = [ /* ... */ ];
  const upcomingInterviews = [ /* ... */ ];
  const analyticsData = { /* ... */ };


  // --- UPDATED USER AND DATA FETCHING ---
  useEffect(() => {
    const storedUser = localStorage.getItem('prolink-user');
    if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        
        // --- ROLE CHECK: Redirect if not a recruiter ---
        if (currentUser.role !== 'recruiter' && currentUser.role !== 'admin') {
            navigate('/job-seeker-dashboard', { replace: true });
            return;
        }
        
        setUser(currentUser);
        // In a real application, fetch job postings/pipeline data using currentUser.id here.
        // For now, we rely on the existing mock data below and just fix the user display.
        setIsLoading(false); 
    } else {
        // If no user is found, redirect to login
        navigate('/login', { replace: true });
        return;
    }

    // Mock notifications 
    const mockNotifications = [
      { id: 1, type: 'application', title: 'New Application Received', message: 'Michael Chen applied for Senior Frontend Developer position', timestamp: new Date(Date.now() - 300000), read: false },
      { id: 2, type: 'interview', title: 'Interview Completed', message: 'Technical interview with Emma Wilson has been completed', timestamp: new Date(Date.now() - 1800000), read: false },
      { id: 3, type: 'message', title: 'New Message', message: 'Candidate Alex Rodriguez sent a follow-up message', timestamp: new Date(Date.now() - 3600000), read: true }
    ];
    setNotifications(mockNotifications);
  }, [navigate]);
  // -------------------------------------


  const handleLogout = () => {
    // Clear persistent storage and redirect to login
    localStorage.removeItem('prolink-user');
    setUser(null);
    navigate('/login');
  };

  const handleNotificationMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev?.map(notification =>
        notification?.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleNotificationMarkAllAsRead = () => {
    setNotifications(prev =>
      prev?.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'post-job': console.log('Navigate to job posting form');
        break;
      case 'search-candidates': console.log('Navigate to candidate search');
        break;
      case 'schedule-interview': console.log('Open interview scheduler');
        break;
      case 'team-collaboration': console.log('Navigate to team management');
        break;
      case 'recent-applications': setActiveTab('pipeline');
        break;
      case 'pending-interviews': setActiveTab('interviews');
        break;
      case 'analytics': setActiveTab('analytics');
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  const handleJobAction = (action, jobId) => {
    switch (action) {
      case 'view-details':
        navigate(`/job-details/${jobId}`);
        break;
      case 'edit-job':
        console.log(`Edit job ${jobId}`);
        break;
      case 'view-candidates':
        console.log(`View candidates for job ${jobId}`);
        break;
      default:
        console.log(`Job action: ${action} for job ${jobId}`);
    }
  };

  const handlePipelineStageChange = (candidateId, newStage) => {
    console.log(`Move candidate ${candidateId} to ${newStage}`);
  };

  const handlePipelineBulkAction = (action, candidateIds) => {
    console.log(`Bulk action: ${action} for candidates:`, candidateIds);
  };

  const handleActivityAction = (activityId, actionType) => {
    console.log(`Activity action: ${actionType} for activity ${activityId}`);
  };

  const handleInterviewAction = (action, interviewId = null) => {
    switch (action) {
      case 'schedule': console.log('Open interview scheduling form');
        break;
      case 'reschedule':
        console.log(`Reschedule interview ${interviewId}`);
        break;
      case 'cancel':
        console.log(`Cancel interview ${interviewId}`);
        break;
      default:
        console.log(`Interview action: ${action}`);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'jobs', label: 'Job Postings', icon: 'Briefcase' },
    { id: 'pipeline', label: 'Pipeline', icon: 'Users' },
    { id: 'interviews', label: 'Interviews', icon: 'Calendar' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' }
  ];

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
      {/* ... rest of the component (return statement) remains the same ... */}
    </div>
  );
};

export default RecruiterDashboard;
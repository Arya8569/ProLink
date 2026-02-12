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
  const jobId = searchParams?.get('id') || 'a1b2c3d4-0001-4001-8001-000000000001';

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data - fetch from local storage for ID/Role
  const storedUser = JSON.parse(localStorage.getItem('prolink-user') || '{}');
  const currentUser = {
    id: storedUser.id || 'mock-user-id',
    name: storedUser.name || "Hareshaadi",
    email: storedUser.email || "haresh.user@prolink.in",
    role: storedUser.role || "job_seeker",
    skills: [
      { name: "React", level: "advanced" },
      { name: "JavaScript", level: "expert" },
      { name: "Node.js", level: "intermediate" },
      { name: "TypeScript", level: "intermediate" },
      { name: "Python", level: "beginner" }
    ]
  };

  // Mock notifications (using simple data, kept English)
  const notifications = [
    {
      id: 1,
      type: 'application',
      title: 'Application Status Update',
      message: 'Your application for Senior Frontend Developer at Wipro has been reviewed',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: 2,
      type: 'job_match',
      title: 'New Job Match',
      message: '5 new jobs match your profile',
      timestamp: new Date(Date.now() - 7200000),
      read: false
    },
    {
      id: 3,
      type: 'interview',
      title: 'Interview Scheduled',
      message: 'Interview scheduled for tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 86400000),
      read: true
    }
  ];

  // Mock job data (Localized)
  const mockJobs = { 
    'a1b2c3d4-0001-4001-8001-000000000001': { // Use UUID as key
      id: 'a1b2c3d4-0001-4001-8001-000000000001',
      title: "Senior Fullstack Developer (MERN)",
      company: {
        name: "Wipro Technologies",
        logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop&crop=center",
        rating: 4.1,
        reviewCount: 320,
        tagline: "Engineering the future, globally.",
        industry: "Technology",
        headquarters: "Bangalore, KA",
        employeeCount: 250000,
        founded: 1945,
        description: `Wipro Technologies is a leading global information technology, consulting and business process services company. We harness the power of cognitive computing, hyper-automation, robotics, cloud, analytics and emerging technologies to help our clients adapt to the digital world.`,
        culture: `Wipro fosters a culture of integrity, transparency, and continuous learning. We offer hybrid work models, internal mobility programs, and value ethical practices above all else.`,
        openJobs: 85,
        recentReviews: [
          {
            rating: 4,
            role: "Software Engineer",
            comment: "Good MNC exposure and great benefits like PF and insurance. The learning curve is steep and project work is challenging."
          },
          {
            rating: 3,
            role: "Project Manager",
            comment: "Stable company but sometimes slow on adopting new technology. Compensation is competitive for the sector."
          }
        ]
      },
      location: "Bangalore, KA (Hybrid)",
      workType: "Hybrid",
      type: "full-time",
      urgency: "hot",
      salary: {
        min: 1800000,
        max: 2500000 // 18 - 25 LPA
      },
      salaryBreakdown: {
        base: 1800000,
        bonus: 150000,
        equity: "₹3,00,000 ESOPs"
      },
      postedDate: "2 days ago",
      applicantCount: 47,
      skills: ["React", "JavaScript", "TypeScript", "Node.js", "Express", "MongoDB", "AWS", "Git"],
      description: `We are seeking a talented Senior Fullstack Developer to join our growing engineering team in Bangalore. You'll be responsible for building and maintaining our web applications using MERN stack technologies and modern development practices.`,
      responsibilities: [
        "Develop and maintain high-quality web applications using React, Node.js, and MongoDB.",
        "Collaborate with designers and product managers to implement user-friendly interfaces.",
        "Write clean, maintainable, and well-tested code (unit and integration tests).",
        "Mentor junior developers and participate in code reviews.",
        "Participate in architectural decisions and technical planning.",
        "Optimize applications for maximum speed and scalability.",
        "Stay up-to-date with the latest frontend and backend technologies."
      ],
      requirements: [
        "5+ years of experience in full-stack development.",
        "Expert knowledge of React, Node.js, and Express.",
        "Strong experience with MongoDB or other NoSQL databases.",
        "Experience with modern build tools and workflows (Webpack, Vite).",
        "Familiarity with testing frameworks (Jest, Mocha).",
        "Experience with version control systems (Git).",
        "Strong problem-solving skills and attention to detail."
      ],
      preferredQualifications: [
        "Experience with AWS or Azure cloud platforms.",
        "Knowledge of GraphQL and Apollo Client.",
        "Familiarity with containerization (Docker).",
        "Experience with CI/CD pipelines.",
        "B.Tech/M.Tech in Computer Science or related field."
      ],
      benefits: [
        "Competitive salary and performance bonus.",
        "Comprehensive health and life insurance.",
        "Provident Fund (PF) and Gratuity benefits.",
        "Flexible working hours and WFH options.",
        "Professional development budget (₹50,000/year).",
        "Gym membership reimbursement.",
        "Child care assistance."
      ],
      applicationQuestions: [
        {
          id: 'portfolio',question: 'Please provide a link to your portfolio or GitHub profile',type: 'text',placeholder: 'https://github.com/yourprofile',
          required: true
        },
        {
          id: 'experience',question: 'Describe your experience with the MERN stack and cloud deployment',type: 'textarea',placeholder: 'Tell us about your experience...',
          required: true
        },
        {
          id: 'notice_period',question: 'What is your current notice period (in days)?',type: 'select',
          options: ['Immediate', '15 days', '30 days', '60 days', '90 days'],
          required: true
        }
      ]
    }
  };

  // Mock similar jobs (Localized)
  const mockSimilarJobs = [
    {
      id: 'a1b2c3d4-0002-4002-8002-000000000002',
      title: "Frontend Engineer (React)",
      company: {
        name: "L&T Infotech",
        logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=64&h=64&fit=crop&crop=center"
      },
      location: "Pune, MH",
      type: "full-time",
      salary: { min: 1200000, max: 1800000 }, // 12 - 18 LPA
      postedDate: "1 day ago",
      skills: ["React", "JavaScript", "CSS", "HTML"],
      matchScore: 92
    },
    {
      id: 'a1b2c3d4-0003-4003-8003-000000000003',
      title: "Full Stack Developer",
      company: {
        name: "TCS iON",
        logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=64&h=64&fit=crop&crop=center"
      },
      location: "Hyderabad, TS",
      type: "contract",
      salary: { min: 900000, max: 1500000 }, // 9 - 15 LPA
      postedDate: "3 days ago",
      skills: ["React", "Redux", "Node.js"],
      matchScore: 88
    },
    {
      id: 'a1b2c3d4-0004-4004-8004-000000000004',
      title: "Node.js Backend Engineer",
      company: {
        name: "Flipkart",
        logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=center"
      },
      location: "Bangalore, KA",
      type: "full-time",
      salary: { min: 2000000, max: 3000000 }, // 20 - 30 LPA
      postedDate: "5 days ago",
      skills: ["Node.js", "Express", "SQL"],
      matchScore: 85
    }
  ];

  // Mock market salary data (Localized)
  const mockMarketData = {
    average: 1500000, // 15 LPA
    percentile25: 1200000, // 12 LPA
    percentile75: 2200000 // 22 LPA
  };
  
  // Check if the user has already applied/saved this job
  const checkJobStatus = async (jobId, userId) => {
    if (!userId || !jobId) return;

    // Check if applied
    const { data: appliedData, error: appliedError } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .limit(1);

    if (appliedError) console.error("Error checking applied status:", appliedError);
    setIsApplied(appliedData?.length > 0);

    // Check if saved (MOCKING for now as we don't have a 'saved_jobs' table)
    // setIsSaved(Math.random() > 0.7); 
  };


  useEffect(() => {
    const loadJobData = async () => {
      setIsLoading(true);
      
      // Simulate API call to fetch job details, using the job ID from URL
      setTimeout(() => {
        const jobData = mockJobs?.[jobId];
        if (jobData) {
          setJob(jobData);
          setSimilarJobs(mockSimilarJobs);
        }
        setIsLoading(false);
      }, 1000);
      
      // Check application status if user is logged in
      checkJobStatus(jobId, currentUser.id);
    };

    loadJobData();
  }, [jobId, currentUser.id]);

  const handleApply = () => {
    if (isApplied) return;
    setIsApplicationModalOpen(true);
  };

  const handleSave = () => {
    // Placeholder for actual save/unsave logic against a 'saved_jobs' table
    setIsSaved(!isSaved);
    console.log(`Job ${jobId} ${!isSaved ? 'saved' : 'unsaved'} (DB operation mock)`);
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
      case 'saved-jobs': navigate('/saved-jobs');
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
                The job you're looking for doesn't exist or has been removed.
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
              onSave={handleSave}
              isSaved={isSaved}
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

              <SalaryInsights job={job} marketData={mockMarketData} />

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
            variant="outline"
            onClick={handleSave}
            iconName={isSaved ? "BookmarkCheck" : "Bookmark"}
            className="flex-shrink-0"
          >
            <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
          </Button>
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
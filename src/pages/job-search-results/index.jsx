import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SearchHeader from './components/SearchHeader';
import FilterPanel from './components/FilterPanel';
import JobCard from './components/JobCard';
import JobListSkeleton from './components/JobListSkeleton';
import QuickApplyModal from './components/QuickApplyModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { supabase } from '../../supabaseClient'; // Import Supabase Client

const JobSearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showQuickApply, setShowQuickApply] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const [user, setUser] = useState(null); // The authenticated user

  useEffect(() => {
    // Read the active user from localStorage for header display and context
    const storedUser = localStorage.getItem('prolink-user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []); 
  
  // Mock job data (ID changed to UUIDs and data localized to India)
  const mockJobs = [
    {
      // ID changed to valid UUID format
      id: "a1b2c3d4-0001-4001-8001-000000000001",
      title: "Senior Frontend Developer (React/TS)",
      company: {
        name: "Wipro Technologies",
        logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center",
        rating: 4.1,
        reviewCount: 320
      },
      location: "Bangalore, KA",
      isRemote: true,
      salary: { min: 1800000, max: 2500000 }, // 18-25 LPA
      jobType: "Full-time",
      experienceLevel: "Senior",
      description: `Wipro is looking for a Senior Frontend Developer to join our growing team. You'll be responsible for building modern, responsive web applications using React, TypeScript, and cutting-edge technologies.\n\nThis role offers the opportunity to work on challenging projects that impact clients across the globe.`,
      skills: ["React", "TypeScript", "JavaScript", "CSS", "Node.js", "AWS", "SQL"],
      benefits: ["Health Insurance", "PF", "Remote Work", "Flexible Hours"],
      postedDate: "2025-01-10T10:00:00Z",
      priority: "featured",
      aiMatchPercentage: 92,
      hasApplied: false,
      isSaved: false
    },
    {
      // ID changed to valid UUID format
      id: "a1b2c3d4-0002-4002-8002-000000000002",
      title: "Product Manager (FinTech)",
      company: {
        name: "Razorpay",
        logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&fit=crop&crop=center",
        rating: 4.6,
        reviewCount: 189
      },
      location: "Mumbai, MH",
      isRemote: false,
      salary: { min: 2000000, max: 3000000 }, // 20-30 LPA
      jobType: "Full-time",
      experienceLevel: "Mid",
      description: `Join our FinTech product team as a Product Manager and help shape the future of our payment platform. You'll work closely with engineering, design, and business teams to deliver exceptional user experiences.\n\nWe're looking for someone with strong analytical skills and a passion for user-centered design.`,
      skills: ["Product Management", "Analytics", "User Research", "Agile", "SQL"],
      benefits: ["Health Insurance", "ESOPs", "Learning Budget"],
      postedDate: "2025-01-09T14:30:00Z",
      priority: "urgent",
      aiMatchPercentage: 78,
      hasApplied: false,
      isSaved: true
    },
    {
      // ID changed to valid UUID format
      id: "a1b2c3d4-0003-4003-8003-000000000003",
      title: "UX/UI Designer",
      company: {
        name: "Lollypop Design Studio",
        logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop&crop=center",
        rating: 4.7,
        reviewCount: 203
      },
      location: "Remote (India)",
      isRemote: true,
      salary: { min: 900000, max: 1500000 }, // 9-15 LPA
      jobType: "Full-time",
      experienceLevel: "Mid",
      description: `We're seeking a talented UX/UI Designer to create beautiful and intuitive user experiences. You'll work on diverse projects ranging from mobile apps to web platforms.\n\nThe ideal candidate has a strong portfolio showcasing user-centered design solutions.`,
      skills: ["Figma", "Sketch", "User Research", "Prototyping", "Design Systems"],
      benefits: ["Health Insurance", "Creative Freedom", "Remote Work"],
      postedDate: "2025-01-08T09:15:00Z",
      priority: null,
      aiMatchPercentage: 85,
      hasApplied: true,
      isSaved: false
    },
    {
      // ID changed to valid UUID format
      id: "a1b2c3d4-0004-4004-8004-000000000004",
      title: "Data Scientist (Gen AI)",
      company: {
        name: "TCS iON",
        logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop&crop=center",
        rating: 4.3,
        reviewCount: 156
      },
      location: "Pune, MH",
      isRemote: false,
      salary: { min: 1400000, max: 2100000 }, // 14-21 LPA
      jobType: "Full-time",
      experienceLevel: "Senior",
      description: `Join our Data Science team to build machine learning models and extract insights from large datasets. You'll work on cutting-edge AI projects that drive business decisions.\n\nWe're looking for someone with strong statistical background and programming skills.`,
      skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Generative AI"],
      benefits: ["Health Insurance", "PF", "Conference Budget", "Remote Work"],
      postedDate: "2025-01-07T16:45:00Z",
      priority: "featured",
      aiMatchPercentage: 88,
      hasApplied: false,
      isSaved: false
    },
    {
      // ID changed to valid UUID format
      id: "a1b2c3d4-0005-4005-8005-000000000005",
      title: "DevOps Engineer (Cloud Infra)",
      company: {
        name: "HCLTech",
        logo: "https://images.unsplash.com/photo-1486312338219-ce68e2c6b7d3?w=100&h=100&fit=crop&crop=center",
        rating: 4.0,
        reviewCount: 494
      },
      location: "Noida, UP",
      isRemote: false,
      salary: { min: 1600000, max: 2400000 }, // 16-24 LPA
      jobType: "Full-time",
      experienceLevel: "Mid",
      description: `We're looking for a DevOps Engineer to help us scale our infrastructure and improve our deployment processes. You'll work with modern cloud technologies and automation tools.\n\nThis role offers great opportunities for professional growth and learning.`,
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
      benefits: ["Health Insurance", "PF", "Professional Development"],
      postedDate: "2025-01-06T11:20:00Z",
      priority: null,
      aiMatchPercentage: 73,
      hasApplied: false,
      isSaved: false
    }
  ];

  useEffect(() => {
    // Read the active user from localStorage for header display and context
    const storedUser = localStorage.getItem('prolink-user');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }
  }, []); 
  
  // Initialize jobs and apply filters
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setJobs(mockJobs);
      setIsLoading(false);
    };

    loadJobs();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...jobs];

    // Apply search query
    if (searchQuery) {
      filtered = filtered?.filter(job =>
        job?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        job?.company?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        job?.skills?.some(skill => skill?.toLowerCase()?.includes(searchQuery?.toLowerCase())) ||
        job?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Apply filters
    if (filters?.location) {
      filtered = filtered?.filter(job =>
        job?.location?.toLowerCase()?.includes(filters?.location?.toLowerCase()) ||
        (filters?.location?.toLowerCase() === 'remote' && job?.isRemote)
      );
    }

    if (filters?.jobType) {
      filtered = filtered?.filter(job => job?.jobType?.toLowerCase() === filters?.jobType?.toLowerCase());
    }

    if (filters?.experienceLevel) {
      filtered = filtered?.filter(job => job?.experienceLevel?.toLowerCase() === filters?.experienceLevel?.toLowerCase());
    }

    if (filters?.salaryMin || filters?.salaryMax) {
      filtered = filtered?.filter(job => {
        const jobMin = job?.salary?.min || 0;
        const jobMax = job?.salary?.max || 99999999;
        const filterMin = filters?.salaryMin || 0;
        const filterMax = filters?.salaryMax || 99999999;
        
        return jobMax >= filterMin && jobMin <= filterMax;
      });
    }

    if (filters?.isRemote) {
      filtered = filtered?.filter(job => job?.isRemote);
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered?.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        break;
      case 'salary-high':
        filtered?.sort((a, b) => (b?.salary?.max || 0) - (a?.salary?.max || 0));
        break;
      case 'salary-low':
        filtered?.sort((a, b) => (a?.salary?.min || 0) - (b?.salary?.min || 0));
        break;
      case 'company':
        filtered?.sort((a, b) => a?.company?.name?.localeCompare(b?.company?.name));
        break;
      case 'match':
        filtered?.sort((a, b) => (b?.aiMatchPercentage || 0) - (a?.aiMatchPercentage || 0));
        break;
      default:
        // Keep original order for relevance
        break;
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, filters, sortBy]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setSearchParams(query ? { q: query } : {});
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSearchParams({});
  };

  const handleSaveJob = useCallback((jobId, isSaved) => {
    setJobs(prevJobs =>
      prevJobs?.map(job =>
        job?.id === jobId ? { ...job, isSaved } : job
      )
    );
  }, []);

  const handleQuickApply = useCallback((jobId) => {
    const job = jobs?.find(j => j?.id === jobId);
    if (job) {
      setSelectedJob(job);
      setShowQuickApply(true);
    }
  }, [jobs]);

  // --- CRITICAL FIX: Supabase INSERT for Application ---
  const handleApplicationSubmit = async (applicationData) => {
    if (!user || !user.id) {
        throw new Error('User not authenticated. Please log in before applying.');
    }
    
    // Resume file check (required by the modal)
    if (!applicationData.resume) {
        throw new Error('Resume file is required for quick apply.');
    }

    const { jobId, expectedSalary, availabilityDate, coverLetter, additionalInfo } = applicationData;
    const applicationCompany = selectedJob?.company?.name || 'Unknown Company';
    const applicationPosition = selectedJob?.title || 'Unknown Position';

    // 1. Upload Resume to Supabase Storage (Assumes 'resumes' bucket exists)
    const resumeFile = applicationData.resume;
    // Create a unique file path using user ID, job ID, and timestamp
    const filePath = `${user.id}/${jobId}-${Date.now()}-${resumeFile.name}`;
    
    const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error('Storage upload failed:', uploadError);
        throw new Error(`Resume upload failed: ${uploadError.message}`);
    }

    // 2. Insert application record into the 'applications' table
    const { data, error: insertError } = await supabase
        .from('applications')
        .insert({
            user_id: user.id,
            job_id: jobId, // This is now a UUID string
            company: applicationCompany, // Must exist in DB schema
            position: applicationPosition, // Must exist in DB schema
            appliedDate: new Date().toISOString(),
            status: 'applied', // Initial status
            expected_salary: expectedSalary,
            availability_date: availabilityDate, // Must exist in DB schema
            cover_letter: coverLetter,
            additional_info: additionalInfo, // Must exist in DB schema
            resume_storage_path: filePath, // Must exist in DB schema
        })
        .select()
        .single();
    
    if (insertError) {
        console.error('Supabase Application INSERT failed:', insertError);
        // Clean up the stored file since the DB insert failed
        await supabase.storage.from('resumes').remove([filePath]);
        throw new Error(`Application data storage failed: ${insertError.message}.`);
    }

    // 3. Update job card status locally for visual feedback
    setJobs(prevJobs =>
      prevJobs?.map(job =>
        job?.id === jobId ? { ...job, hasApplied: true } : job
      )
    );
    
    console.log('Application submitted to Supabase successfully:', data);
  };
  // ----------------------------------------------------

  const loadMoreJobs = () => {
    // Simulate loading more jobs
    setPage(prev => prev + 1);
    // In real app, this would fetch more data
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="pt-16">
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={filteredJobs?.length}
          isLoading={isLoading}
          onToggleFilters={() => setShowMobileFilters(!showMobileFilters)}
          showMobileFilters={showMobileFilters}
        />

        <div className="flex">
          {/* Desktop Filter Panel */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="p-6">
              <FilterPanel
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                onClose={() => setShowMobileFilters(false)}
              />
            </div>
          </div>

          {/* Mobile Filter Panel */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-background overflow-y-auto">
                <div className="p-6">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                    onClose={() => setShowMobileFilters(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 p-6">
            {isLoading ? (
              <JobListSkeleton count={5} />
            ) : filteredJobs?.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {filteredJobs?.map((job) => (
                    <JobCard
                      key={job?.id}
                      job={job}
                      onSave={handleSaveJob}
                      onApply={handleQuickApply}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && filteredJobs?.length >= 5 && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={loadMoreJobs}
                      className="w-full sm:w-auto"
                    >
                      <Icon name="ChevronDown" size={16} />
                      <span className="ml-2">Load more jobs</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {/* Quick Apply Modal */}
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

export default JobSearchResults;
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

  // Fetch Real Jobs from Supabase
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);

      try {
        // 1. Fetch Jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'active') // Only show active jobs
          .order('posted_date', { ascending: false });

        if (jobsError) throw jobsError;

        if (!jobsData || jobsData.length === 0) {
          setJobs([]);
          setIsLoading(false);
          return;
        }

        // 2. Fetch Recruiters (to get Company Name/Logo)
        const recruiterIds = [...new Set(jobsData.map(j => j.recruiter_id))];
        const { data: recruitersData, error: recruitersError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, user_role')
          .in('id', recruiterIds);

        if (recruitersError) throw recruitersError;

        const recruitersMap = (recruitersData || []).reduce((acc, r) => ({ ...acc, [r.id]: r }), {});

        // 3. Map to UI Model
        const mappedJobs = jobsData.map(job => {
          const recruiter = recruitersMap[job.recruiter_id] || {};

          return {
            id: job.id,
            title: job.title,
            company: {
              name: recruiter.name || 'Confidential Company',
              // Use avatar as logo or a default
              logo: recruiter.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(recruiter.name || 'C') + "&background=random",
              rating: 4.5, // Mock
              reviewCount: 12 // Mock
            },
            location: job.location || 'Remote',
            isRemote: job.location?.toLowerCase().includes('remote') || false,
            salary: {
              range: job.salary_range || 'Not Disclosed',
              min: null, max: null // Parsing logic could be added here if needed for filtering
            },
            jobType: job.job_type || 'Full-time',
            experienceLevel: 'Mid-Senior', // This field might need to be added to jobs table or inferred
            description: job.description,
            skills: job.requirements || [],
            benefits: [], // Placeholder
            postedDate: job.posted_date,
            priority: null,
            aiMatchPercentage: Math.floor(Math.random() * 30) + 70, // Mock AI Match
            hasApplied: false, // We'll check this next
            isSaved: false
          };
        });

        // 4. Check if current user has applied (if logged in)
        if (user) {
          const jobIds = jobsData.map(j => j.id);
          const { data: applications } = await supabase
            .from('applications')
            .select('job_id')
            .eq('user_id', user.id)
            .in('job_id', jobIds);

          const appliedJobIds = new Set((applications || []).map(a => a.job_id));

          setJobs(mappedJobs.map(j => ({
            ...j,
            hasApplied: appliedJobIds.has(j.id)
          })));
        } else {
          setJobs(mappedJobs);
        }

      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();
  }, [user]); // Re-run if user logs in to check application status

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
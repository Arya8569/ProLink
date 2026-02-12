import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import LoginPage from './pages/login';
import RecruiterDashboard from './pages/recruiter-dashboard';
import JobSeekerDashboard from './pages/job-seeker-dashboard';
import JobDetailsPage from './pages/job-details';
import JobSearchResults from './pages/job-search-results';
import ApplicationTracking from './pages/application-tracking';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/*
          CRITICAL: This line ensures that when you access the root URL ("/"), 
          the LoginPage is rendered first, enforcing the authentication barrier.
        */}
        <Route path="/" element={<LoginPage />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/job-seeker-dashboard" element={<JobSeekerDashboard />} />
        <Route path="/job-details" element={<JobDetailsPage />} />
        <Route path="/job-search-results" element={<JobSearchResults />} />
        <Route path="/application-tracking" element={<ApplicationTracking />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;

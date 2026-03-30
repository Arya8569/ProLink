import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { extractTextFromPDF } from '../../../utils/pdf-util';
import { screenCandidateForJob } from '../../../utils/groq';

const CVScreening = ({ jobs, pipelineData }) => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [screeningResults, setScreeningResults] = useState({});
  const [isScreening, setIsScreening] = useState(false);
  const [currentScreeningIndex, setCurrentScreeningIndex] = useState(-1);

  useEffect(() => {
    if (selectedJobId) {
      const allCandidates = Object.values(pipelineData).flat();
      const filtered = allCandidates.filter(c => c.job_id === selectedJobId);
      setCandidates(filtered);
    } else {
      setCandidates([]);
    }
  }, [selectedJobId, pipelineData]);

  const handleStartScreening = async () => {
    if (!selectedJobId || candidates.length === 0) return;

    const job = jobs.find(j => j.id === selectedJobId);
    if (!job) return;

    setIsScreening(true);
    const newResults = { ...screeningResults };

    for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        if (newResults[candidate.id]) continue; // Skip already screened

        setCurrentScreeningIndex(i);
        try {
            if (!candidate.resumeUrl || candidate.resumeUrl === 'NO' || candidate.resumeUrl.includes('undefined')) {
                throw new Error('No valid resume found for this candidate.');
            }
            console.log(`Screening ${candidate.name} with URL: ${candidate.resumeUrl}`);
            const resumeText = await extractTextFromPDF(candidate.resumeUrl);
            const result = await screenCandidateForJob(resumeText, job);
            newResults[candidate.id] = result;
            setScreeningResults({ ...newResults });
        } catch (error) {
            console.error(`Failed to screen ${candidate.name}:`, error);
            newResults[candidate.id] = { error: error.message || 'Screening failed' };
            setScreeningResults({ ...newResults });
        }
    }

    setIsScreening(false);
    setCurrentScreeningIndex(-1);
  };

  const getRankedCandidates = () => {
    return [...candidates].sort((a, b) => {
        const scoreA = screeningResults[a.id]?.matchScore || 0;
        const scoreB = screeningResults[b.id]?.matchScore || 0;
        return scoreB - scoreA;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="ScanLine" size={24} className="text-primary" />
          AI CV Screening
        </h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-1">Select Job to Screen</label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isScreening}
            >
              <option value="">Choose a job...</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={handleStartScreening}
              disabled={!selectedJobId || candidates.length === 0 || isScreening}
              className="w-full md:w-auto"
            >
              {isScreening ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Screening {currentScreeningIndex + 1}/{candidates.length}...
                </>
              ) : (
                <>
                  <Icon name="Zap" size={16} className="mr-2" />
                  Start AI Screening
                </>
              )}
            </Button>
          </div>
        </div>

        {selectedJobId && candidates.length === 0 && (
          <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed border-border">
            <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No candidates have applied for this job yet.</p>
          </div>
        )}

        {!selectedJobId && (
            <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border">
                <Icon name="Target" size={40} className="text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">Select a job to see applicant fit analysis</p>
            </div>
        )}
      </div>

      {candidates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Ranked Candidates ({candidates.length})
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {getRankedCandidates().map((candidate, index) => {
              const result = screeningResults[candidate.id];
              return (
                <div key={candidate.id} className={`bg-card border border-border rounded-lg p-5 transition-smooth hover:shadow-moderate ${
                    index === 0 && result?.matchScore >= 80 ? 'ring-2 ring-emerald-500/20 shadow-emerald-500/5' : ''
                }`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Candidate Identity */}
                    <div className="flex items-start gap-4 md:w-1/4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground leading-tight mb-1">{candidate.name}</h4>
                        <p className="text-xs text-muted-foreground">{candidate.experience}</p>
                        {result?.matchScore && (
                            <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                result.matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-600' :
                                result.matchScore >= 60 ? 'bg-amber-500/10 text-amber-600' :
                                'bg-red-500/10 text-red-600'
                            }`}>
                                {result.matchScore}% AI Match
                            </div>
                        )}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="flex-1 space-y-3">
                      {!result ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground italic text-sm">
                            {isScreening && index === currentScreeningIndex ? 'Analyzing resume...' : 'Waiting for screening...'}
                        </div>
                      ) : result.error ? (
                        <p className="text-sm text-error">{result.error}</p>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm text-foreground leading-relaxed">
                                <span className="font-medium text-primary">Fit Analysis: </span>
                                {result.fitAnalysis}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h5 className="text-[10px] font-bold text-emerald-600 uppercase mb-2 tracking-wider">Pros</h5>
                                <ul className="space-y-1">
                                    {result.pros?.map((pro, i) => (
                                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Icon name="Check" size={12} className="text-emerald-500" />
                                            {pro}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-[10px] font-bold text-amber-600 uppercase mb-2 tracking-wider">Concerns</h5>
                                <ul className="space-y-1">
                                    {result.cons?.map((con, i) => (
                                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Icon name="AlertCircle" size={12} className="text-amber-500" />
                                            {con}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">AI Recommendation:</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    result.recommendation === 'Shortlist' ? 'bg-emerald-100 text-emerald-700' :
                                    result.recommendation === 'Interview' ? 'bg-blue-100 text-blue-700' :
                                    'bg-muted text-muted-foreground'
                                }`}>
                                    {result.recommendation}
                                </span>
                             </div>
                             <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                <Icon name="FileText" size={12} />
                                View Resume
                             </a>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CVScreening;

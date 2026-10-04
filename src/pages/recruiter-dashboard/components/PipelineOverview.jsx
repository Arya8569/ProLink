import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PipelineOverview = ({ pipelineData, onStageChange, onBulkAction, onViewCandidate }) => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const stages = [
    { id: 'applied', name: 'Applied', color: 'bg-blue-100 text-blue-800', icon: 'FileText' },
    { id: 'screening', name: 'Screening', color: 'bg-yellow-100 text-yellow-800', icon: 'Search' },
    { id: 'interview', name: 'Interview', color: 'bg-purple-100 text-purple-800', icon: 'Video' },
    { id: 'offer', name: 'Offer', color: 'bg-green-100 text-green-800', icon: 'CheckCircle' },
    { id: 'hired', name: 'Hired', color: 'bg-emerald-100 text-emerald-800', icon: 'UserCheck' },
    { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-800', icon: 'XCircle' }
  ];

  const handleDragStart = (e, candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
    // Add a bit of transparent ghosting effect
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e, stageId) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e) => {
    // Basic check to see if we're actually leaving the column
    // (sometimes dragLeave fires when entering a child)
  };

  const handleDrop = (e, targetStage) => {
    e?.preventDefault();
    setDragOverStage(null);
    if (draggedCandidate && draggedCandidate?.stage !== targetStage) {
      onStageChange(draggedCandidate?.id, targetStage);
    }
    setDraggedCandidate(null);
  };

  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates(prev =>
      prev?.includes(candidateId)
        ? prev?.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleBulkAction = (action) => {
    if (selectedCandidates?.length > 0) {
      if (typeof onBulkAction === 'function') {
        onBulkAction(action, selectedCandidates);
      }
      setSelectedCandidates([]);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Candidate Pipeline</h2>
        {selectedCandidates?.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedCandidates?.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('move')}
            >
              <Icon name="Move" size={16} />
              <span className="ml-1">Move</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction('reject')}
            >
              <Icon name="X" size={16} />
              <span className="ml-1">Reject</span>
            </Button>
          </div>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[500px]">
        {stages?.map((stage) => (
          <div
            key={stage?.id}
            className={`flex flex-col rounded-lg p-4 min-w-[280px] w-[320px] shrink-0 transition-colors duration-200 ${dragOverStage === stage.id ? 'bg-primary/10 ring-2 ring-primary ring-inset' : 'bg-muted/50'
              }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage?.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Icon name={stage?.icon} size={16} className="text-muted-foreground" />
                <h3 className="font-medium text-foreground">{stage?.name}</h3>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${stage?.color}`}>
                {pipelineData?.[stage?.id]?.length || 0}
              </div>
            </div>

            <div className="space-y-3 flex-1 min-h-[400px]">
              <AnimatePresence mode="popLayout">
                {pipelineData?.[stage?.id]?.map((candidate) => (
                  <motion.div
                    key={candidate?.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate)}
                    onDragEnd={handleDragEnd}
                    className={`bg-card border border-border rounded-lg p-3 cursor-move hover:shadow-moderate transition-smooth ${selectedCandidates?.includes(candidate?.id) ? 'ring-2 ring-primary' : ''
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-2 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={selectedCandidates?.includes(candidate?.id)}
                          onChange={() => toggleCandidateSelection(candidate?.id)}
                          className="rounded border-border mt-1 shrink-0"
                        />
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shrink-0">
                          {candidate?.name?.charAt(0)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        {candidate?.priority === 'high' && (
                          <Icon name="Star" size={12} className="text-accent" />
                        )}
                        <div className={`w-2 h-2 rounded-full ${candidate?.matchScore >= 90 ? 'bg-success' :
                          candidate?.matchScore >= 70 ? 'bg-warning' : 'bg-error'
                          }`} />
                      </div>
                    </div>

                    <h4 className="font-medium text-sm text-foreground mb-1 break-words">{candidate?.name}</h4>
                    <p className="text-xs text-muted-foreground mb-2 break-words">{candidate?.position}</p>

                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <span className="text-muted-foreground truncate max-w-[120px]" title={candidate?.experience}>{candidate?.experience}</span>
                      <span className={`font-medium shrink-0 ${candidate?.matchScore >= 90 ? 'text-success' :
                        candidate?.matchScore >= 70 ? 'text-warning' : 'text-error'
                        }`}>
                        {candidate?.matchScore}% match
                      </span>
                    </div>

                    {candidate?.lastActivity && (
                      <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground justify-between w-full">
                        <div className="flex items-center space-x-1">
                          <Icon name="Clock" size={10} />
                          <span>{candidate?.lastActivity}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCandidate(candidate);
                          }}
                          className="text-primary hover:text-primary/80 flex items-center space-x-1 px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                        >
                          <Icon name="Eye" size={12} />
                          <span>View</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineOverview;
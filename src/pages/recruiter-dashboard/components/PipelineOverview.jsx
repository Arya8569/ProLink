import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PipelineOverview = ({ pipelineData, onStageChange, onBulkAction }) => {
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [draggedCandidate, setDraggedCandidate] = useState(null);

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
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStage) => {
    e?.preventDefault();
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
      onBulkAction(action, selectedCandidates);
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
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('reject')}
            >
              <Icon name="X" size={16} />
              <span className="ml-1">Reject</span>
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {stages?.map((stage) => (
          <div
            key={stage?.id}
            className="bg-muted/50 rounded-lg p-4 min-h-[400px]"
            onDragOver={handleDragOver}
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

            <div className="space-y-3">
              {pipelineData?.[stage?.id]?.map((candidate) => (
                <div
                  key={candidate?.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, candidate)}
                  className={`bg-card border border-border rounded-lg p-3 cursor-move hover:shadow-moderate transition-smooth ${
                    selectedCandidates?.includes(candidate?.id) ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCandidates?.includes(candidate?.id)}
                        onChange={() => toggleCandidateSelection(candidate?.id)}
                        className="rounded border-border"
                      />
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                        {candidate?.name?.charAt(0)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {candidate?.priority === 'high' && (
                        <Icon name="Star" size={12} className="text-accent" />
                      )}
                      <div className={`w-2 h-2 rounded-full ${
                        candidate?.matchScore >= 90 ? 'bg-success' :
                        candidate?.matchScore >= 70 ? 'bg-warning' : 'bg-error'
                      }`} />
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-sm text-foreground mb-1">{candidate?.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{candidate?.position}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{candidate?.experience}</span>
                    <span className={`font-medium ${
                      candidate?.matchScore >= 90 ? 'text-success' :
                      candidate?.matchScore >= 70 ? 'text-warning' : 'text-error'
                    }`}>
                      {candidate?.matchScore}% match
                    </span>
                  </div>
                  
                  {candidate?.lastActivity && (
                    <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                      <Icon name="Clock" size={10} />
                      <span>{candidate?.lastActivity}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineOverview;
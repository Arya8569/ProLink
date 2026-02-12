import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const JobDescription = ({ job }) => {
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    responsibilities: false,
    requirements: false,
    preferred: false,
    benefits: false,
    culture: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const SectionHeader = ({ title, icon, section, count }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-4 bg-muted/50 hover:bg-muted transition-smooth rounded-lg"
    >
      <div className="flex items-center space-x-3">
        <Icon name={icon} size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {count && (
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            {count}
          </span>
        )}
      </div>
      <Icon 
        name={expandedSections?.[section] ? "ChevronUp" : "ChevronDown"} 
        size={20} 
        className="text-muted-foreground" 
      />
    </button>
  );

  const ListItem = ({ children, type = "bullet" }) => (
    <li className="flex items-start space-x-3 text-muted-foreground">
      <Icon 
        name={type === "check" ? "Check" : "Dot"} 
        size={16} 
        className={`mt-1 flex-shrink-0 ${type === "check" ? "text-success" : "text-primary"}`} 
      />
      <span>{children}</span>
    </li>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden card-moderate">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
          <Icon name="FileText" size={24} className="text-primary" />
          <span>Job Details</span>
        </h2>
      </div>
      <div className="divide-y divide-border">
        {/* Job Description */}
        <div className="p-6">
          <SectionHeader 
            title="Job Description" 
            icon="AlignLeft" 
            section="description"
            count={undefined}
          />
          {expandedSections?.description && (
            <div className="mt-4 prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {job?.description}
              </p>
            </div>
          )}
        </div>

        {/* Key Responsibilities */}
        <div className="p-6">
          <SectionHeader 
            title="Key Responsibilities" 
            icon="Target" 
            section="responsibilities"
            count={job?.responsibilities?.length}
          />
          {expandedSections?.responsibilities && (
            <div className="mt-4">
              <ul className="space-y-3">
                {job?.responsibilities?.map((responsibility, index) => (
                  <ListItem key={index}>{responsibility}</ListItem>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Requirements */}
        <div className="p-6">
          <SectionHeader 
            title="Requirements" 
            icon="CheckSquare" 
            section="requirements"
            count={job?.requirements?.length}
          />
          {expandedSections?.requirements && (
            <div className="mt-4">
              <ul className="space-y-3">
                {job?.requirements?.map((requirement, index) => (
                  <ListItem key={index} type="check">{requirement}</ListItem>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Preferred Qualifications */}
        {job?.preferredQualifications && job?.preferredQualifications?.length > 0 && (
          <div className="p-6">
            <SectionHeader 
              title="Preferred Qualifications" 
              icon="Star" 
              section="preferred"
              count={job?.preferredQualifications?.length}
            />
            {expandedSections?.preferred && (
              <div className="mt-4">
                <ul className="space-y-3">
                  {job?.preferredQualifications?.map((qualification, index) => (
                    <ListItem key={index}>{qualification}</ListItem>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Benefits & Perks */}
        {job?.benefits && job?.benefits?.length > 0 && (
          <div className="p-6">
            <SectionHeader 
              title="Benefits & Perks" 
              icon="Gift" 
              section="benefits"
              count={job?.benefits?.length}
            />
            {expandedSections?.benefits && (
              <div className="mt-4">
                <ul className="space-y-3">
                  {job?.benefits?.map((benefit, index) => (
                    <ListItem key={index} type="check">{benefit}</ListItem>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Company Culture */}
        {job?.company?.culture && (
          <div className="p-6">
            <SectionHeader 
              title="Company Culture" 
              icon="Heart" 
              section="culture"
              count={undefined}
            />
            {expandedSections?.culture && (
              <div className="mt-4">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {job?.company?.culture}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDescription;
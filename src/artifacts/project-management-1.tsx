import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle, CheckCircle2, Timer } from "lucide-react";

const projectsData = [
  {
    id: 1,
    name: "Website Redesign",
    startDate: "2024-01-01",
    endDate: "2024-03-15",
    completion: 85,
    status: "in-progress"
  },
  {
    id: 2,
    name: "Mobile App Development",
    startDate: "2024-02-15",
    endDate: "2024-06-30",
    completion: 45,
    status: "in-progress"
  },
  {
    id: 3,
    name: "Data Migration",
    startDate: "2024-03-01",
    endDate: "2024-04-15",
    completion: 20,
    status: "delayed"
  },
  {
    id: 4,
    name: "Security Audit",
    startDate: "2024-04-01",
    endDate: "2024-05-15",
    completion: 0,
    status: "not-started"
  },
  {
    id: 5,
    name: "User Training",
    startDate: "2024-05-15",
    endDate: "2024-06-15",
    completion: 0,
    status: "not-started"
  }
];

const ProjectTimeline = () => {
  const [hoveredProject, setHoveredProject] = useState(null);
  
  // Calculate timeline boundaries
  const startDates = projectsData.map(p => new Date(p.startDate));
  const endDates = projectsData.map(p => new Date(p.endDate));
  const minDate = new Date(Math.min(...startDates));
  const maxDate = new Date(Math.max(...endDates));
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

  // Calculate position and width for timeline bars
  const getTimelinePosition = (date) => {
    const days = Math.ceil((new Date(date) - minDate) / (1000 * 60 * 60 * 24));
    return (days / totalDays) * 100;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      case 'not-started':
        return 'bg-gray-400';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'delayed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'not-started':
        return <Timer className="w-4 h-4 text-gray-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  // Generate month labels
  const generateMonthLabels = () => {
    const months = [];
    let currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      months.push({
        label: currentDate.toLocaleString('default', { month: 'short' }),
        position: getTimelinePosition(currentDate)
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Project Timeline Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Month indicators */}
          <div className="relative h-6 border-b border-gray-200">
            {generateMonthLabels().map((month, index) => (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 text-sm text-gray-500"
                style={{ left: `${month.position}%` }}
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Projects timeline */}
          <div className="space-y-4">
            {projectsData.map((project) => {
              const startPosition = getTimelinePosition(project.startDate);
              const endPosition = getTimelinePosition(project.endDate);
              const width = endPosition - startPosition;

              return (
                <div key={project.id} className="relative">
                  {/* Project name and status */}
                  <div className="flex items-center mb-2">
                    {getStatusIcon(project.status)}
                    <span className="ml-2 font-medium">{project.name}</span>
                  </div>

                  {/* Timeline bar */}
                  <div className="relative h-8 bg-gray-100 rounded">
                    <div
                      className={`absolute h-full rounded ${getStatusColor(project.status)} opacity-25`}
                      style={{
                        left: `${startPosition}%`,
                        width: `${width}%`
                      }}
                    />
                    <div
                      className={`absolute h-full rounded ${getStatusColor(project.status)}`}
                      style={{
                        left: `${startPosition}%`,
                        width: `${width * (project.completion / 100)}%`
                      }}
                    />
                    
                    {/* Progress label */}
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 text-xs font-medium"
                      style={{ left: `${startPosition + width/2}%` }}
                    >
                      {project.completion}%
                    </div>
                  </div>

                  {/* Hover tooltip */}
                  {hoveredProject === project.id && (
                    <div className="absolute top-full mt-2 p-2 bg-white rounded shadow-lg z-10 text-sm">
                      <div>Start: {project.startDate}</div>
                      <div>End: {project.endDate}</div>
                      <div>Status: {project.status}</div>
                      <div>Progress: {project.completion}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded bg-blue-500 mr-2" />
              <span className="text-sm">In Progress</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded bg-red-500 mr-2" />
              <span className="text-sm">Delayed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded bg-gray-400 mr-2" />
              <span className="text-sm">Not Started</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;
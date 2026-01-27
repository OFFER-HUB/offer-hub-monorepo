"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  Award,
  Briefcase,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { Project } from "@/types/project.types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { formatCurrency, formatHourlyRate } from "@/utils/format-number";
import { formatDateShort } from "@/utils/format-date";

interface ProjectMarketplaceCardProps {
  project: Project;
}

export function ProjectMarketplaceCard({ project }: ProjectMarketplaceCardProps) {
  const {
    id,
    title,
    description,
    category,
    budget,
    budgetType,
    deadline,
    skills,
    experienceLevel,
    projectType,
    created_at,
    client,
    location
  } = project;

  // Format budget display (using consistent formatting to avoid hydration issues)
  const budgetDisplay = budgetType === 'hourly' 
    ? formatHourlyRate(budget)
    : formatCurrency(budget);

  // Get first 4 skills
  const displaySkills = skills?.slice(0, 4) || [];
  const remainingSkills = skills?.length > 4 ? skills.length - 4 : 0;

  // Format posted time (use useState to avoid hydration mismatch)
  const [postedTime, setPostedTime] = useState<string>('Recently');
  
  useEffect(() => {
    if (created_at) {
      setPostedTime(formatDistanceToNow(new Date(created_at), { addSuffix: true }));
    }
  }, [created_at]);

  // Experience level badge color
  const experienceLevelColor = {
    entry: 'bg-green-100 text-green-700 border-green-200',
    intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
    expert: 'bg-purple-100 text-purple-700 border-purple-200'
  }[experienceLevel] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <Card className="group border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md hover:border-indigo-200 transition-all duration-200">
      <CardContent className="p-5">
        {/* Header with Category and Posted Time */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            {category}
          </Badge>
          <span className="text-xs text-gray-500">{postedTime}</span>
        </div>

        {/* Title */}
        <Link href={`/projects/${id}`}>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 cursor-pointer">
            {title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {description}
        </p>

        {/* Project Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="font-semibold text-gray-900">{budgetDisplay}</p>
            </div>
          </div>

          {deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Deadline</p>
                <p className="font-medium text-gray-900">
                  {formatDateShort(deadline)}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Level</p>
              <p className="font-medium text-gray-900 capitalize">{experienceLevel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {projectType === 'on-time' ? 'One-time' : 'Ongoing'}
              </p>
            </div>
          </div>
        </div>

        {/* Skills */}
        {displaySkills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                >
                  {skill}
                </Badge>
              ))}
              {remainingSkills > 0 && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                >
                  +{remainingSkills} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Client Info */}
        {client && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={client.avatar} alt={client.name} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                  {client.name?.charAt(0)?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  {client.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  )}
                </div>
                {client.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">{client.location}</p>
                  </div>
                )}
              </div>
            </div>

            <Link href={`/projects/${id}`}>
              <Button 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-8 px-4"
              >
                View Details
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProjectMarketplaceCard;

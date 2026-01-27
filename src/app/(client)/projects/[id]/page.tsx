"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// For testing: Use mock data. Change to useProjects for production
import { useProjectsMock as useProjects } from "@/hooks/use-projects-mock";
// import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientProfileSummary } from "@/components/projects/ClientProfileSummary";
import { OnChainVerificationLink } from "@/components/projects/OnChainVerificationLink";
import { ExpressInterestButton } from "@/components/projects/ExpressInterestButton";
import { ProjectErrorState } from "@/components/projects/ProjectErrorState";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
  Award,
  Briefcase,
  MapPin,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Target
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { formatCurrency, formatHourlyRate, formatNumber } from "@/utils/format-number";
import { formatDateMedium, formatDateShort } from "@/utils/format-date";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { currentProject: project, getProject, loading, error, clearError } = useProjects({
    autoFetch: false
  });

  // Use useState to avoid hydration mismatch with date formatting
  // IMPORTANT: All Hooks must be called before any conditional returns
  const [postedTime, setPostedTime] = useState<string>('Recently');

  useEffect(() => {
    if (projectId) {
      getProject(projectId);
    }
  }, [projectId, getProject]);

  useEffect(() => {
    if (project?.created_at) {
      setPostedTime(formatDistanceToNow(new Date(project.created_at), { addSuffix: true }));
    }
  }, [project?.created_at]);

  const handleRetry = () => {
    clearError();
    getProject(projectId);
  };

  // Loading state
  if (loading.fetching && !project) {
    return (
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        <Skeleton className="h-8 w-32 mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        <ProjectErrorState error={error} onRetry={handleRetry} />
      </div>
    );
  }

  const {
    title,
    description,
    category,
    subcategory,
    budget,
    budgetType,
    deadline,
    duration,
    skills,
    experienceLevel,
    projectType,
    created_at,
    client,
    requirements,
    milestones,
    attachments,
    location
  } = project;

  const budgetDisplay = budgetType === 'hourly' 
    ? formatHourlyRate(budget)
    : formatCurrency(budget);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8">
      {/* Back Button */}
      <Link href="/projects">
        <Button variant="ghost" className="mb-6 gap-2 hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>
      </Link>

      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-600">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/projects" className="hover:text-indigo-600">
              Projects
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 truncate max-w-xs">{title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {category}
                  </Badge>
                  {subcategory && (
                    <Badge variant="outline" className="text-gray-600">
                      {subcategory}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                <p className="text-sm text-gray-500">Posted {postedTime}</p>
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-indigo-100 p-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-semibold text-gray-900">{budgetDisplay}</p>
                </div>
              </div>

              {deadline && (
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-orange-100 p-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-semibold text-gray-900">
                      {formatDateMedium(deadline)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-100 p-2">
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="font-semibold text-gray-900 capitalize">{experienceLevel}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-full bg-green-100 p-2">
                  <Briefcase className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {projectType === 'on-time' ? 'One-time' : 'Ongoing'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Project Description
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="whitespace-pre-wrap">{description}</p>
            </div>
          </div>

          {/* Skills Required */}
          {skills && skills.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Skills Required
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="bg-indigo-50 text-indigo-700 border-indigo-200 text-sm"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {requirements && requirements.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Requirements
              </h2>
              <div className="space-y-3">
                {requirements.map((req) => (
                  <div 
                    key={req.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {req.type === 'mandatory' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{req.title}</p>
                        <Badge 
                          variant="outline" 
                          className={
                            req.type === 'mandatory' 
                              ? 'text-green-700 border-green-300' 
                              : req.type === 'preferred'
                              ? 'text-blue-700 border-blue-300'
                              : 'text-gray-600 border-gray-300'
                          }
                        >
                          {req.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{req.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
          {milestones && milestones.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Project Milestones
              </h2>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-indigo-600 text-white w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      {index < milestones.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {milestone.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                          Amount: <span className="font-semibold text-gray-900">${formatNumber(milestone.amount)}</span>
                        </span>
                        <span className="text-gray-500">
                          Due: <span className="font-semibold text-gray-900">
                            {formatDateMedium(milestone.dueDate)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Attachments
              </h2>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(attachment.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Button */}
          <ExpressInterestButton projectId={project.id} />

          {/* Project Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Budget Type</span>
                <span className="font-medium text-gray-900 capitalize">
                  {budgetType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
                </span>
              </div>

              {duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{duration}</span>
                </div>
              )}

              {location && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Location</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        {location.city && <p className="text-gray-900">{location.city}</p>}
                        {location.country && <p className="text-gray-600">{location.country}</p>}
                        {location.remote && (
                          <Badge variant="secondary" className="mt-1 bg-green-50 text-green-700 border-green-200">
                            Remote OK
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Client Profile */}
          {client && <ClientProfileSummary client={client} />}

          {/* On-chain Verification */}
          <OnChainVerificationLink />
        </div>
      </div>
    </div>
  );
}

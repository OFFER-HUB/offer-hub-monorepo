"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Briefcase, 
  Star, 
  CheckCircle2,
  ExternalLink 
} from "lucide-react";
import { ProjectClient } from "@/types/project.types";
import Link from "next/link";

interface ClientProfileSummaryProps {
  client: ProjectClient;
  showViewProfile?: boolean;
}

export function ClientProfileSummary({ client, showViewProfile = true }: ClientProfileSummaryProps) {
  const {
    id,
    name,
    email,
    avatar,
    rating,
    totalProjects,
    verified,
    location
  } = client;

  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm bg-white">
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          About the Client
        </h3>

        {/* Client Avatar and Name */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg font-semibold">
              {name?.charAt(0)?.toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">{name}</h4>
              {verified && (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            
            {verified && (
              <Badge 
                variant="secondary" 
                className="bg-green-50 text-green-700 border-green-200 text-xs"
              >
                Verified Client
              </Badge>
            )}
          </div>
        </div>

        {/* Client Stats */}
        <div className="space-y-3 mb-4">
          {rating !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rating</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">/5.0</span>
              </div>
            </div>
          )}

          {totalProjects !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Projects Posted</span>
              <span className="font-semibold text-gray-900">{totalProjects}</span>
            </div>
          )}

          {location && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Location</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-900">{location}</span>
              </div>
            </div>
          )}
        </div>

        {/* View Profile Button */}
        {showViewProfile && (
          <Link href={`/client/${id}`}>
            <Button 
              variant="outline" 
              className="w-full gap-2 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
            >
              View Full Profile
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default ClientProfileSummary;

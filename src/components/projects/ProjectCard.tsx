"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";

export interface ProjectCardProps {
  title: string;
  freelancerName: string;
  freelancerAvatar?: string;
  dateRange: string;
  onMessage?: () => void;
}

export default function ProjectCard({
  title,
  freelancerName,
  freelancerAvatar,
  dateRange,
  onMessage,
}: ProjectCardProps) {
  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[15px] sm:text-base font-semibold text-gray-900 leading-6">
              {title}
            </h3>
            <div className="flex items-center gap-3 mt-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={freelancerAvatar} alt={freelancerName} />
                <AvatarFallback>{freelancerName?.[0] ?? 'F'}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="text-gray-900 font-medium">{freelancerName}</div>
                <div className="text-gray-500 text-xs">{dateRange}</div>
              </div>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700 p-1">
            <Ellipsis className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <Button
            onClick={onMessage}
            className="w-full bg-[#002333] hover:bg-[#012b3f] text-white rounded-full"
          >
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}



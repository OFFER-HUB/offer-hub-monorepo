"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Shield } from "lucide-react";

interface ProfileCardProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onEditProfile: () => void;
  onSecurity: () => void;
}

export default function ProfileCard({
  user,
  onEditProfile,
  onSecurity,
}: ProfileCardProps) {
  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] px-4 sm:px-0">
      {/* Avatar */}
      <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
        <AvatarImage
          src={user.avatar || "/verificationImage.svg"}
          alt={user.name}
        />
        <AvatarFallback className="text-lg sm:text-xl font-semibold bg-gray-100">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="space-y-2 mb-4 sm:mb-6 text-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{user.name}</h2>
        <p className="text-sm sm:text-base text-gray-600 break-all">{user.email}</p>
      </div>
      <Card className="w-full max-w-sm sm:max-w-md bg-white shadow-sm border border-gray-200">
        <CardContent className="p-3 sm:p-4 text-center">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            {/* Action Buttons */}
            <div className="w-full space-y-2 sm:space-y-3">
              <Button
                onClick={onEditProfile}
                className="w-full justify-start h-11 sm:h-12 text-left hover:bg-gray-50 bg-transparent shadow-none border-none text-sm sm:text-base touch-manipulation"
              >
                <Edit className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="truncate">Edit profile information</span>
              </Button>

              <Button
                onClick={onSecurity}
                className="w-full justify-start h-11 sm:h-12 text-left hover:bg-gray-50 bg-transparent shadow-none border-none text-sm sm:text-base touch-manipulation"
              >
                <Shield className="w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
                <span className="truncate">Security</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

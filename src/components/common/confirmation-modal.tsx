"use client";

import * as React from "react";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to call when modal should be closed */
  onClose: () => void;
  /** Function to call when user confirms the action */
  onConfirm: () => void;
  /** Modal title */
  title?: string;
  /** Modal description/message */
  message?: string;
  /** Confirmation button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Type of confirmation modal */
  type?: "warning" | "danger" | "info" | "success";
  /** Whether the confirm action is loading */
  isLoading?: boolean;
  /** Whether the confirm button is disabled */
  isDisabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size of the modal */
  size?: "sm" | "md" | "lg";
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    iconColor: "text-yellow-600 dark:text-yellow-400",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/20",
    confirmVariant: "default" as const,
  },
  danger: {
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-900/20",
    confirmVariant: "destructive" as const,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/20",
    confirmVariant: "default" as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/20",
    confirmVariant: "default" as const,
  },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  isLoading = false,
  isDisabled = false,
  className,
  size = "sm",
}) => {
  const config = typeConfig[type];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="rounded-full"
      >
        {cancelText}
      </Button>
      <Button
        variant={config.confirmVariant}
        onClick={handleConfirm}
        disabled={isDisabled || isLoading}
        isLoading={isLoading}
        className="rounded-full"
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={footer}
      className={className}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            config.iconBg
          )}
        >
          <IconComponent className={cn("w-5 h-5", config.iconColor)} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;

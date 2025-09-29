"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ModalFormProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to call when modal should be closed */
  onClose: () => void;
  /** Function to call when form is submitted */
  onSubmit: (data: FormData) => void | Promise<void>;
  /** Modal title */
  title?: string;
  /** Modal description */
  description?: string;
  /** Form content */
  children: React.ReactNode;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Whether the form is loading */
  isLoading?: boolean;
  /** Whether the submit button is disabled */
  isDisabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Size of the modal */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether to show the cancel button */
  showCancelButton?: boolean;
  /** Custom footer content */
  footer?: React.ReactNode;
  /** Form validation errors */
  errors?: Record<string, string>;
  /** Whether to reset form on close */
  resetOnClose?: boolean;
  /** Form ref for external control */
  formRef?: React.RefObject<HTMLFormElement>;
}

export const ModalForm: React.FC<ModalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitText = "Submit",
  cancelText = "Cancel",
  isLoading = false,
  isDisabled = false,
  className,
  size = "md",
  showCancelButton = true,
  footer,
  errors = {},
  resetOnClose = true,
  formRef,
}) => {
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const internalFormRef = React.useRef<HTMLFormElement>(null);
  const currentFormRef = formRef || internalFormRef;

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen && resetOnClose && currentFormRef.current) {
      currentFormRef.current.reset();
      setFormData({});
    }
  }, [isOpen, resetOnClose, currentFormRef]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentFormRef.current) return;

    const formData = new FormData(currentFormRef.current);
    const formDataObject: Record<string, string> = {};

    // Convert FormData to object for state management
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        formDataObject[key] = value;
      }
    }

    setFormData(formDataObject);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const defaultFooter = (
    <div className="flex justify-end gap-3">
      {showCancelButton && (
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-full"
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isDisabled || isLoading}
        isLoading={isLoading}
        className="rounded-full"
        form="modal-form"
      >
        {submitText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={footer || defaultFooter}
      className={className}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form
        ref={currentFormRef}
        id="modal-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        {/* Clone children and pass form props */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const childProps = child.props as Record<string, any>;
            return React.cloneElement(child as React.ReactElement<any>, {
              onChange: handleInputChange,
              error: errors[childProps.name] || childProps.error,
              disabled: childProps.disabled || isLoading,
              value: formData[childProps.name] || childProps.value || "",
            });
          }
          return child;
        })}

        {/* Global form errors */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="text-sm text-red-800 dark:text-red-200">
              Please fix the following errors:
              <ul className="mt-1 list-disc list-inside">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

// Helper component for form fields with consistent styling
export interface ModalFormFieldProps {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Field type */
  type?: string;
  /** Field placeholder */
  placeholder?: string;
  /** Field value */
  value?: string;
  /** Field error message */
  error?: string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is disabled */
  disabled?: boolean;
  /** Field change handler */
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  /** Additional CSS classes */
  className?: string;
  /** Field options (for select) */
  options?: Array<{ value: string; label: string }>;
  /** Textarea rows */
  rows?: number;
  /** Field description */
  description?: string;
}

export const ModalFormField: React.FC<ModalFormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  value,
  error,
  required = false,
  disabled = false,
  onChange,
  className,
  options,
  rows = 3,
  description,
}) => {
  const fieldId = `modal-form-${name}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {description && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}

      {type === "textarea" ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:text-white dark:bg-gray-700",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
        />
      ) : type === "select" ? (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:text-white dark:bg-gray-700",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
        >
          <option value="">Select an option</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:text-white dark:bg-gray-700",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
        />
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ModalForm;

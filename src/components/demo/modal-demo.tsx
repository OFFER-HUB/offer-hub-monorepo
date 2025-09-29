"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { ModalForm, ModalFormField } from "@/components/forms/modal-form";

/**
 * Demo component to showcase all modal components and their consistent behavior
 * This component demonstrates the usage patterns and can be used for testing
 */
export const ModalDemo: React.FC = () => {
  // Base Modal States
  const [baseModalOpen, setBaseModalOpen] = useState(false);
  const [baseModalSize, setBaseModalSize] = useState<
    "sm" | "md" | "lg" | "xl" | "full"
  >("md");

  // Confirmation Modal States
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<
    "warning" | "danger" | "info" | "success"
  >("warning");
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Form Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle confirmation modal actions
  const handleConfirm = async () => {
    setConfirmLoading(true);
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setConfirmLoading(false);
    setConfirmModalOpen(false);
    alert("Action confirmed!");
  };

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    setFormLoading(true);
    setFormErrors({});

    try {
      // Simulate form validation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const name = formData.get("name") as string;
      const email = formData.get("email") as string;

      // Simple validation
      if (!name || name.length < 2) {
        setFormErrors({ name: "Name must be at least 2 characters long" });
        setFormLoading(false);
        return;
      }

      if (!email || !email.includes("@")) {
        setFormErrors({ email: "Please enter a valid email address" });
        setFormLoading(false);
        return;
      }

      // Simulate successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFormLoading(false);
      setFormModalOpen(false);
      alert(`Form submitted successfully!\nName: ${name}\nEmail: ${email}`);
    } catch (error) {
      setFormLoading(false);
      setFormErrors({ general: "An error occurred while submitting the form" });
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Modal Components Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test all modal components and their consistent behavior
        </p>
      </div>

      {/* Base Modal Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Base Modal
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setBaseModalSize("sm");
              setBaseModalOpen(true);
            }}
          >
            Small Modal
          </Button>
          <Button
            onClick={() => {
              setBaseModalSize("md");
              setBaseModalOpen(true);
            }}
          >
            Medium Modal
          </Button>
          <Button
            onClick={() => {
              setBaseModalSize("lg");
              setBaseModalOpen(true);
            }}
          >
            Large Modal
          </Button>
          <Button
            onClick={() => {
              setBaseModalSize("xl");
              setBaseModalOpen(true);
            }}
          >
            Extra Large Modal
          </Button>
          <Button
            onClick={() => {
              setBaseModalSize("full");
              setBaseModalOpen(true);
            }}
          >
            Full Width Modal
          </Button>
        </div>

        <Modal
          isOpen={baseModalOpen}
          onClose={() => setBaseModalOpen(false)}
          title="Base Modal Example"
          description="This is a demonstration of the base modal component"
          size={baseModalSize}
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              This is the content area of the modal. It can contain any React
              components.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Features:</h3>
              <ul className="text-sm space-y-1">
                <li>• Responsive sizing</li>
                <li>• Keyboard navigation (ESC to close)</li>
                <li>• Click outside to close</li>
                <li>• Accessible close button</li>
                <li>• Dark mode support</li>
              </ul>
            </div>
          </div>
        </Modal>
      </section>

      {/* Confirmation Modal Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Confirmation Modal
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setConfirmModalType("warning");
              setConfirmModalOpen(true);
            }}
          >
            Warning Modal
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setConfirmModalType("danger");
              setConfirmModalOpen(true);
            }}
          >
            Danger Modal
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setConfirmModalType("info");
              setConfirmModalOpen(true);
            }}
          >
            Info Modal
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => {
              setConfirmModalType("success");
              setConfirmModalOpen(true);
            }}
          >
            Success Modal
          </Button>
        </div>

        <ConfirmationModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={handleConfirm}
          type={confirmModalType}
          isLoading={confirmLoading}
          title={
            confirmModalType === "danger" ? "Delete Item" : "Confirm Action"
          }
          message={
            confirmModalType === "danger"
              ? "This action cannot be undone. Are you sure you want to delete this item?"
              : confirmModalType === "warning"
              ? "This action may have unintended consequences. Are you sure you want to proceed?"
              : confirmModalType === "info"
              ? "Please confirm that you want to continue with this action."
              : "Great! Your action was completed successfully."
          }
          confirmText={confirmModalType === "danger" ? "Delete" : "Confirm"}
        />
      </section>

      {/* Form Modal Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Form Modal
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setFormModalOpen(true)}>
            Open Form Modal
          </Button>
        </div>

        <ModalForm
          isOpen={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setFormErrors({});
          }}
          onSubmit={handleFormSubmit}
          title="Contact Form"
          description="Please fill out the form below to get in touch"
          isLoading={formLoading}
          errors={formErrors}
          size="md"
        >
          <ModalFormField
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            required
            error={formErrors.name}
          />

          <ModalFormField
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            required
            error={formErrors.email}
          />

          <ModalFormField
            name="subject"
            label="Subject"
            placeholder="What is this about?"
            description="Brief description of your inquiry"
          />

          <ModalFormField
            name="message"
            type="textarea"
            label="Message"
            placeholder="Enter your message here..."
            rows={4}
            required
            description="Please provide as much detail as possible"
          />

          <ModalFormField
            name="priority"
            type="select"
            label="Priority Level"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
            description="How urgent is your request?"
          />
        </ModalForm>
      </section>

      {/* Usage Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Usage Examples
        </h2>
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
          <h3 className="font-medium mb-3">Code Examples:</h3>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">Base Modal:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                {`<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  size="md"
>
  <p>Modal content here</p>
</Modal>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">Confirmation Modal:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                {`<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  type="danger"
  title="Delete Item"
  message="Are you sure?"
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-1">Form Modal:</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                {`<ModalForm
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
  title="Form Title"
>
  <ModalFormField
    name="fieldName"
    label="Field Label"
    required
  />
</ModalForm>`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModalDemo;

/**
 * Main Review Creation and Management Interface
 * Comprehensive review system with all features integrated
 */

"use client";

import React, { useState } from 'react';
import {
  Star,
  FileText,
  Send,
  Save,
  Eye,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Globe,
  Lock,
  Unlock,
  ArrowLeft,
  ArrowRight,
  Loader2
} from 'lucide-react';
import {
  ReviewCreationData,
  ReviewTemplate,
  ReviewSystemProps,
  ReviewTemplateCategory
} from '@/types/review-creation.types';
import { useReviewCreation } from '@/hooks/use-review-creation';
import { RatingInterface } from './rating-interface';
import { ReviewTemplates } from './review-templates';
import { ReviewModeration } from './review-moderation';

// ===== COMPONENT INTERFACES =====

interface ReviewStepProps {
  step: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

interface ReviewPreviewProps {
  reviewData: Partial<ReviewCreationData>;
  onEdit: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

interface ReviewAttachmentsProps {
  attachments: Array<{
    id: string;
    filename: string;
    size: number;
  }>;
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

// ===== REVIEW STEP COMPONENT =====

const ReviewStep: React.FC<ReviewStepProps> = ({
  step,
  title,
  description,
  isActive,
  isCompleted,
  onClick
}) => {
  return (
    <div
      className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-blue-50 border-2 border-blue-500'
          : isCompleted
          ? 'bg-green-50 border-2 border-green-500'
          : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
          isActive
            ? 'bg-blue-600 text-white'
            : isCompleted
            ? 'bg-green-600 text-white'
            : 'bg-gray-300 text-gray-600'
        }`}
      >
        {isCompleted ? <CheckCircle className="h-5 w-5" /> : step}
      </div>
      <div className="flex-1">
        <h3 className={`font-medium ${
          isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-700'
        }`}>
          {title}
        </h3>
        <p className={`text-sm ${
          isActive ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
        }`}>
          {description}
        </p>
      </div>
    </div>
  );
};

// ===== REVIEW PREVIEW COMPONENT =====

const ReviewPreview: React.FC<ReviewPreviewProps> = ({
  reviewData,
  onEdit,
  onSubmit,
  isSubmitting
}) => {
  const [showFullContent, setShowFullContent] = useState(false);

  const getRatingLabel = (rating: number) => {
    const labels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
    return labels[rating as keyof typeof labels] || 'Not rated';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Review Preview</h3>
        <button
          onClick={onEdit}
          className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </button>
      </div>

      {/* Project Information */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Project Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Project:</span>
            <span className="ml-2 font-medium">{reviewData.projectTitle || 'Untitled Project'}</span>
          </div>
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium">{reviewData.projectType || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-gray-600">Value:</span>
            <span className="ml-2 font-medium">
              {reviewData.projectValue ? `$${reviewData.projectValue}` : 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Duration:</span>
            <span className="ml-2 font-medium">
              {reviewData.projectDuration ? `${reviewData.projectDuration} days` : 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Ratings */}
      {reviewData.ratings && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Ratings</h4>
          <div className="space-y-3">
            {Object.entries(reviewData.ratings).map(([dimension, rating]) => (
              <div key={dimension} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {dimension.replace('_', ' ')}:
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-medium ${getRatingColor(rating)}`}>
                    {getRatingLabel(rating)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Review Content</h4>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">{reviewData.title}</h5>
          <p className="text-gray-700 text-sm">
            {showFullContent ? reviewData.content : `${reviewData.content?.substring(0, 200)}...`}
          </p>
          {reviewData.content && reviewData.content.length > 200 && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-blue-600 hover:text-blue-800 text-sm mt-2"
            >
              {showFullContent ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      {reviewData.tags && reviewData.tags.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {reviewData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {reviewData.attachments && reviewData.attachments.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
          <div className="space-y-2">
            {reviewData.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{attachment.filename}</span>
                <span className="text-xs text-gray-500">
                  ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Privacy Settings</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            {reviewData.isAnonymous ? (
              <Lock className="h-4 w-4 text-gray-500" />
            ) : (
              <Unlock className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-gray-600">
              {reviewData.isAnonymous ? 'Anonymous review' : 'Public review'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {reviewData.isPublic ? (
              <Globe className="h-4 w-4 text-gray-500" />
            ) : (
              <Lock className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-gray-600">
              {reviewData.isPublic ? 'Visible to everyone' : 'Private review'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={onEdit}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Back to Edit
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
        </button>
      </div>
    </div>
  );
};

// ===== REVIEW ATTACHMENTS COMPONENT =====

const ReviewAttachments: React.FC<ReviewAttachmentsProps> = ({
  attachments,
  onAdd,
  onRemove,
  maxFiles = 5,
  maxSize = 10
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return;
      }
      onAdd(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
        <p className="text-sm text-gray-600">
          Add files to support your review (max {maxFiles} files, {maxSize}MB each)
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or click to select
        </p>
        <input
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Select Files</span>
        </label>
      </div>

      {/* File List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                  <p className="text-xs text-gray-500">
                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(attachment.id)}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== MAIN REVIEW SYSTEM COMPONENT =====

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  userId,
  contractId,
  projectId,
  onReviewCreated,
  onReviewUpdated,
  readOnly = false,
  showTemplates = true,
  showAnalytics = true
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showModeration, setShowModeration] = useState(false);

  // Use the review creation hook
  const {
    reviewData,
    isLoading,
    isSubmitting,
    isValid,
    errors,
    warnings,
    updateReviewData,
    updateContent,
    addAttachment,
    removeAttachment,
    submitReview,
    selectTemplate,
    createCustomTemplate,
    validation
  } = useReviewCreation({
    userId,
    contractId,
    projectId,
    onReviewCreated,
    onReviewUpdated,
    onError: (error) => console.error('Review creation error:', error)
  });

  // Steps configuration
  const steps = [
    {
      step: 1,
      title: 'Template Selection',
      description: 'Choose a professional review template',
      isActive: currentStep === 1,
      isCompleted: currentStep > 1
    },
    {
      step: 2,
      title: 'Rating & Content',
      description: 'Provide ratings and write your review',
      isActive: currentStep === 2,
      isCompleted: currentStep > 2
    },
    {
      step: 3,
      title: 'Attachments & Settings',
      description: 'Add files and configure privacy settings',
      isActive: currentStep === 3,
      isCompleted: currentStep > 3
    },
    {
      step: 4,
      title: 'Preview & Submit',
      description: 'Review and submit your feedback',
      isActive: currentStep === 4,
      isCompleted: false
    }
  ];

  const handleStepClick = (step: number) => {
    if (step <= currentStep || (step === currentStep + 1 && isValid)) {
      setCurrentStep(step);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTemplateSelect = (template: ReviewTemplate) => {
    selectTemplate(template.id);
    handleNextStep();
  };

  const handleSubmitReview = async () => {
    try {
      const submittedReview = await submitReview();
      onReviewCreated?.(submittedReview);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleSaveDraft = () => {
    // In a real implementation, this would save to local storage or backend
    console.log('Saving draft:', reviewData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Choose a Review Template
              </h3>
              <p className="text-gray-600">
                Select a professional template that best fits your project type
              </p>
            </div>

            {showTemplates ? (
            <ReviewTemplates
              category={reviewData.projectType as ReviewTemplateCategory}
              projectType={reviewData.projectType}
              onTemplateSelect={handleTemplateSelect}
              onTemplateCreate={createCustomTemplate}
              showCreateButton={true}
              showCategoryFilter={true}
            />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Templates are disabled</p>
                <button
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue Without Template
                </button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Rate Your Experience
              </h3>
              <p className="text-gray-600">
                Provide detailed ratings and write your review content
              </p>
            </div>

            {/* Rating Interface */}
            <RatingInterface
              ratings={reviewData.ratings || {
                quality: 0,
                communication: 0,
                timeliness: 0,
                value: 0,
                overall: 0
              }}
              onChange={(ratings) => updateReviewData({ ratings })}
              readOnly={readOnly}
              showLabels={true}
              showTooltips={true}
              validation={validation}
            />

            {/* Content Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={reviewData.title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  placeholder="Enter a descriptive title for your review"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={readOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Content
                </label>
                <textarea
                  value={reviewData.content || ''}
                  onChange={(e) => updateContent('content', e.target.value)}
                  placeholder="Share your detailed experience with this project..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={readOnly}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(reviewData.content || '').length} characters
                </p>
              </div>
            </div>

            {/* Project Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type
                </label>
                <select
                  value={reviewData.projectType || ''}
                  onChange={(e) => updateContent('projectType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={readOnly}
                >
                  <option value="">Select project type</option>
                  <option value="web_development">Web Development</option>
                  <option value="mobile_development">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="writing">Writing</option>
                  <option value="marketing">Marketing</option>
                  <option value="consulting">Consulting</option>
                  <option value="data_analysis">Data Analysis</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={reviewData.projectTitle || ''}
                  onChange={(e) => updateContent('projectTitle', e.target.value)}
                  placeholder="Enter project title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={readOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Value ($)
                </label>
                <input
                  type="number"
                  value={reviewData.projectValue || ''}
                  onChange={(e) => updateContent('projectValue', e.target.value)}
                  placeholder="Enter project value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={readOnly}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Duration (days)
                </label>
                <input
                  type="number"
                  value={reviewData.projectDuration || ''}
                  onChange={(e) => updateContent('projectDuration', e.target.value)}
                  placeholder="Enter project duration"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Attachments & Settings
              </h3>
              <p className="text-gray-600">
                Add supporting files and configure privacy settings
              </p>
            </div>

            {/* Attachments */}
            <ReviewAttachments
              attachments={reviewData.attachments || []}
              onAdd={(file) => {
                const attachment = {
                  id: `att_${Date.now()}`,
                  type: 'document' as const,
                  url: URL.createObjectURL(file),
                  filename: file.name,
                  size: file.size,
                  mimeType: file.type,
                  uploadedAt: new Date().toISOString()
                };
                addAttachment(attachment);
              }}
              onRemove={removeAttachment}
              maxFiles={5}
              maxSize={10}
            />

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={(reviewData.tags || []).join(', ')}
                onChange={(e) => updateContent('tags', e.target.value)}
                placeholder="Enter tags separated by commas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly={readOnly}
              />
              <p className="text-xs text-gray-500 mt-1">
                Add relevant tags to help categorize your review
              </p>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Privacy Settings</h4>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={reviewData.isAnonymous || false}
                    onChange={(e) => updateContent('isAnonymous', e.target.checked.toString())}
                    className="rounded"
                    readOnly={readOnly}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Anonymous Review</span>
                    <p className="text-xs text-gray-500">Hide your identity from the reviewee</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={reviewData.isPublic !== false}
                    onChange={(e) => updateContent('isPublic', e.target.checked.toString())}
                    className="rounded"
                    readOnly={readOnly}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Public Review</span>
                    <p className="text-xs text-gray-500">Make this review visible to other users</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Preview & Submit
              </h3>
              <p className="text-gray-600">
                Review your feedback before submitting
              </p>
            </div>

            <ReviewPreview
              reviewData={reviewData}
              onEdit={() => setCurrentStep(2)}
              onSubmit={handleSubmitReview}
              isSubmitting={isSubmitting}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (showModeration) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <button
            onClick={() => setShowModeration(false)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Review Creation</span>
          </button>
        </div>
        <ReviewModeration
          reviews={[reviewData as ReviewCreationData]}
          onModerate={(reviewId, action) => {
            console.log('Moderate review:', reviewId, action);
          }}
          showAutomated={true}
          showManual={true}
          showAnalytics={showAnalytics}
          enableBulkActions={true}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Review System</h1>
        <p className="text-gray-600">
          Create comprehensive reviews with multi-dimensional ratings and professional templates
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="space-y-3">
          {steps.map((step) => (
            <ReviewStep
              key={step.step}
              step={step.step}
              title={step.title}
              description={step.description}
              isActive={step.isActive}
              isCompleted={step.isCompleted}
              onClick={() => handleStepClick(step.step)}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {currentStep > 1 && (
            <button
              onClick={handlePrevStep}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
          )}
          
          <button
            onClick={handleSaveDraft}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {currentStep < 4 && (
            <button
              onClick={handleNextStep}
              disabled={!isValid}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          
          {currentStep === 4 && (
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <h4 className="font-medium text-red-900">Please fix the following errors:</h4>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {Object.values(errors).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warning Messages */}
      {Object.keys(warnings).length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-900">Warnings:</h4>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {Object.values(warnings).map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-900">Loading review system...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;

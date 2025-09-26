import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RatingInterface } from './rating-interface';
import { ReviewTemplates } from './review-templates';
import { useReviewCreation } from '@/hooks/use-review-creation';
import { ReviewTemplate, ReviewSubmission } from '@/types/review-creation.types';
import { cn } from '@/lib/utils';

// Define props interface
interface ReviewSystemProps {
  projectId: string;
  revieweeId: string;
  projectType?: string;
  onSubmit: (data: ReviewSubmission) => Promise<void>;
  defaultValues?: Partial<ReviewSubmission>;
  template?: ReviewTemplate;
  className?: string;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  projectId,
  revieweeId,
  projectType = 'all',
  onSubmit,
  defaultValues,
  template,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'templates'>('form');
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    // State
    ratings,
    selectedTemplate,
    isSubmitting,
    error,
    formErrors,
    formValues,
    
    // Methods
    register,
    control,
    handleSubmit,
    handleRatingChange,
    handleTemplateSelect,
    addCustomQuestion,
    removeCustomQuestion,
    updateCustomQuestion,
    resetForm,
    
    // Form state
    isValid,
    isDirty,
  } = useReviewCreation({
    projectId,
    revieweeId,
    onSubmit: async (data) => {
      await onSubmit(data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    },
    defaultValues,
    template,
  });

  // Handle template selection from the templates tab
  const handleTemplateSelectFromList = useCallback((template: ReviewTemplate) => {
    handleTemplateSelect(template);
    setActiveTab('form');
  }, [handleTemplateSelect]);

  // Reset the form and show template selection
  const handleStartOver = useCallback(() => {
    resetForm();
    setActiveTab('templates');
  }, [resetForm]);

  return (
    <div className={cn('w-full max-w-3xl mx-auto', className)}>
      <Tabs 
        value={activeTab} 
        onValueChange={(value: 'form' | 'templates') => setActiveTab(value)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Write Review</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Success Message */}
        {showSuccess && (
          <Alert variant="success" className="mt-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Review Submitted!</AlertTitle>
            <AlertDescription>
              Thank you for your feedback. Your review has been submitted successfully.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <ReviewTemplates
            projectType={projectType}
            onTemplateSelect={handleTemplateSelectFromList}
            onCustomTemplate={() => setActiveTab('form')}
          />
        </TabsContent>

        {/* Form Tab */}
        <TabsContent value="form" className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {selectedTemplate?.name || 'Custom Review'}
                  </CardTitle>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={handleStartOver}
                  >
                    Change Template
                  </Button>
                </div>
                {selectedTemplate?.description && (
                  <CardDescription>{selectedTemplate.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Rating Interface */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Your Ratings</h3>
                  <RatingInterface
                    dimensions={ratings.map(rating => ({
                      id: rating.dimension,
                      label: rating.label,
                      description: `Rate the ${rating.label.toLowerCase()} of this project`,
                    }))}
                    initialRatings={ratings}
                    onChange={handleRatingChange}
                    disabled={isSubmitting}
                  />
                  {formErrors.ratings && (
                    <p className="mt-2 text-sm text-red-600">
                      {formErrors.ratings.message}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <Label htmlFor="comment" className="mb-2 block">
                    Your Review
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Share your experience with this project..."
                    className="min-h-[120px]"
                    disabled={isSubmitting}
                    {...register('comment')}
                  />
                  {formErrors.comment && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.comment.message}
                    </p>
                  )}
                </div>

                {/* Custom Questions */}
                {formValues.customQuestions?.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`question-${index}`}>
                        Question {index + 1}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomQuestion(index)}
                        disabled={isSubmitting}
                      >
                        Remove
                      </Button>
                    </div>
                    <Textarea
                      id={`question-${index}`}
                      placeholder="Enter your question"
                      value={question.question}
                      onChange={(e) => 
                        updateCustomQuestion(index, 'question', e.target.value)
                      }
                      disabled={isSubmitting}
                    />
                    <Textarea
                      placeholder="Your answer"
                      value={question.answer}
                      onChange={(e) => 
                        updateCustomQuestion(index, 'answer', e.target.value)
                      }
                      disabled={isSubmitting}
                    />
                  </div>
                ))}

                {/* Add Custom Question Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomQuestion}
                  disabled={isSubmitting}
                >
                  Add Custom Question
                </Button>

                {/* Anonymous Toggle */}
                <div className="flex items-center space-x-2 pt-2">
                  <Controller
                    name="isAnonymous"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="anonymous"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  <Label htmlFor="anonymous">Submit anonymously</Label>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStartOver}
                  disabled={isSubmitting}
                >
                  Start Over
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isValid || isSubmitting || !isDirty}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : 'Submit Review'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewSystem;

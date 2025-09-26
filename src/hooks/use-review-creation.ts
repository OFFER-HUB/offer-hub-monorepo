import { useState, useCallback, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Review, ReviewSubmission, ReviewTemplate, Rating, RatingDimension } from '@/types/review-creation.types';

// Define validation schema using Zod
const reviewFormSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  revieweeId: z.string().min(1, 'Reviewee ID is required'),
  ratings: z.record(
    z.string(),
    z.number().min(1, 'Rating is required').max(5, 'Maximum rating is 5')
  ),
  comment: z.string()
    .min(10, 'Review must be at least 10 characters')
    .max(2000, 'Review cannot exceed 2000 characters'),
  isAnonymous: z.boolean().default(false),
  templateId: z.string().optional(),
  customQuestions: z.array(
    z.object({
      question: z.string().min(1, 'Question is required'),
      answer: z.string().min(1, 'Answer is required'),
    })
  ).optional(),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface UseReviewCreationProps {
  projectId: string;
  revieweeId: string;
  onSubmit: (data: ReviewSubmission) => Promise<void>;
  defaultValues?: Partial<Review>;
  template?: ReviewTemplate;
}

export const useReviewCreation = ({
  projectId,
  revieweeId,
  onSubmit,
  defaultValues,
  template,
}: UseReviewCreationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReviewTemplate | undefined>(template);
  const [ratings, setRatings] = useState<Rating[]>([]);

  // Initialize form with react-hook-form
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      projectId,
      revieweeId,
      ratings: {},
      comment: '',
      isAnonymous: false,
      templateId: template?.id,
      customQuestions: [],
      ...defaultValues,
    },
    mode: 'onChange',
  });

  // Initialize ratings when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialRatings = selectedTemplate.defaultRatings.map(rating => ({
        ...rating,
        value: 0, // Reset to unrated
      }));
      setRatings(initialRatings);
      
      // Set initial values in form
      const initialRatingValues = initialRatings.reduce((acc, rating) => ({
        ...acc,
        [rating.dimension]: rating.value,
      }), {});
      
      setValue('ratings', initialRatingValues, { shouldValidate: true });
      setValue('templateId', selectedTemplate.id);
    }
  }, [selectedTemplate, setValue]);

  // Handle rating changes
  const handleRatingChange = useCallback((dimension: RatingDimension, value: number) => {
    setRatings(prev => 
      prev.map(rating => 
        rating.dimension === dimension ? { ...rating, value } : rating
      )
    );
    
    // Update form values
    setValue(`ratings.${dimension}`, value, { shouldValidate: true });
  }, [setValue]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: ReviewTemplate) => {
    setSelectedTemplate(template);
    // Reset form with new template
    reset({
      projectId,
      revieweeId,
      ratings: {},
      comment: '',
      isAnonymous: false,
      templateId: template.id,
      customQuestions: [],
    });
  }, [projectId, revieweeId, reset]);

  // Prepare and submit form data
  const submitReview: SubmitHandler<ReviewFormData> = async (data) => {
    if (!selectedTemplate) {
      setError('Please select a review template');
      return;
    }

    // Check if all required ratings are provided
    const missingRatings = selectedTemplate.defaultRatings.some(
      rating => !data.ratings[rating.dimension] || data.ratings[rating.dimension] === 0
    );

    if (missingRatings) {
      setError('Please provide all required ratings');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const submissionData: ReviewSubmission = {
        projectId: data.projectId,
        revieweeId: data.revieweeId,
        ratings: Object.entries(data.ratings).map(([dimension, value]) => ({
          dimension: dimension as RatingDimension,
          value,
        })),
        comment: data.comment,
        isAnonymous: data.isAnonymous,
        templateId: data.templateId,
        customQuestions: data.customQuestions,
      };

      await onSubmit(submissionData);
      
      // Reset form on successful submission
      reset({
        projectId,
        revieweeId,
        ratings: {},
        comment: '',
        isAnonymous: false,
        templateId: selectedTemplate.id,
        customQuestions: [],
      });
      
      // Reset ratings UI
      setRatings(selectedTemplate.defaultRatings.map(r => ({ ...r, value: 0 })));
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a custom question
  const addCustomQuestion = useCallback(() => {
    const newQuestion = { question: '', answer: '' };
    const currentQuestions = watch('customQuestions') || [];
    setValue('customQuestions', [...currentQuestions, newQuestion], { shouldValidate: true });
  }, [setValue, watch]);

  // Remove a custom question
  const removeCustomQuestion = useCallback((index: number) => {
    const currentQuestions = [...(watch('customQuestions') || [])];
    currentQuestions.splice(index, 1);
    setValue('customQuestions', currentQuestions, { shouldValidate: true });
  }, [setValue, watch]);

  // Update a custom question
  const updateCustomQuestion = useCallback((index: number, field: 'question' | 'answer', value: string) => {
    const currentQuestions = [...(watch('customQuestions') || [])];
    if (currentQuestions[index]) {
      currentQuestions[index] = {
        ...currentQuestions[index],
        [field]: value,
      };
      setValue('customQuestions', currentQuestions, { shouldValidate: true });
    }
  }, [setValue, watch]);

  return {
    // State
    ratings,
    selectedTemplate,
    isSubmitting,
    error,
    formErrors: errors,
    formValues: watch(),
    
    // Methods
    register,
    control,
    handleSubmit: handleSubmit(submitReview),
    handleRatingChange,
    handleTemplateSelect,
    addCustomQuestion,
    removeCustomQuestion,
    updateCustomQuestion,
    resetForm: () => {
      reset({
        projectId,
        revieweeId,
        ratings: {},
        comment: '',
        isAnonymous: false,
        templateId: selectedTemplate?.id,
        customQuestions: [],
      });
      setRatings(selectedTemplate?.defaultRatings.map(r => ({ ...r, value: 0 })) || []);
    },
    
    // Form state
    isValid,
    isDirty: Object.keys(watch()).length > 0,
  };
};

export default useReviewCreation;

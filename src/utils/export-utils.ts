import { Review, ReviewAnalytics, ReviewStats } from '@/types/review-creation.types';

export const generateCSV = (reviews: Review[]): string => {
  if (reviews.length === 0) return '';
  
  const headers = [
    'ID',
    'Project ID',
    'Reviewer ID',
    'Status',
    'Is Anonymous',
    'Comment',
    'Created At',
    'Updated At',
    ...(reviews[0]?.ratings?.map(r => `Rating - ${r.label}`) || []),
    ...(reviews[0]?.customQuestions?.map((_, i) => `Q${i + 1} - Question,Q${i + 1} - Answer`) || []).flat()
  ];

  const rows = reviews.map(review => {
    const baseData = [
      `"${review.id}"`,
      `"${review.projectId}"`,
      `"${review.reviewerId}"`,
      `"${review.status}"`,
      `"${review.isAnonymous}"`,
      `"${review.comment.replace(/"/g, '""')}"`,
      `"${new Date(review.createdAt).toISOString()}"`,
      `"${new Date(review.updatedAt).toISOString()}"`,
      ...(review.ratings?.map(r => r.value.toString()) || [])
    ];

    const customQuestions = review.customQuestions?.flatMap(q => [
      `"${q.question.replace(/"/g, '""')}"`,
      `"${q.answer.replace(/"/g, '""')}"`
    ]) || [];

    return [...baseData, ...customQuestions].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export const generateJSON = (reviews: Review[]): string => {
  return JSON.stringify(reviews, null, 2);
};

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const calculateAnalytics = (reviews: Review[]): ReviewAnalytics => {
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      responseRate: 0,
      dimensionAverages: {},
      monthlyTrends: [],
      wordCloud: []
    };
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => {
    const reviewAvg = review.ratings.reduce((s, r) => s + r.value, 0) / review.ratings.length;
    return sum + reviewAvg;
  }, 0);
  const averageRating = totalRating / reviews.length;

  // Calculate dimension averages
  const dimensionSums: Record<string, { sum: number; count: number }> = {};
  
  reviews.forEach(review => {
    review.ratings?.forEach(rating => {
      if (!dimensionSums[rating.dimension]) {
        dimensionSums[rating.dimension] = { sum: 0, count: 0 };
      }
      dimensionSums[rating.dimension].sum += rating.value;
      dimensionSums[rating.dimension].count++;
    });
  });

  const dimensionAverages = Object.entries(dimensionSums).reduce((acc, [dimension, { sum, count }]) => ({
    ...acc,
    [dimension]: sum / count
  }), {});

  // Calculate monthly trends
  const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
    const monthReviews = reviews.filter(r => new Date(r.createdAt).getMonth() === i);
    const monthAvg = monthReviews.length > 0
      ? monthReviews.reduce((sum, r) => {
          const reviewAvg = r.ratings.reduce((s, rating) => s + rating.value, 0) / r.ratings.length;
          return sum + reviewAvg;
        }, 0) / monthReviews.length
      : 0;

    return {
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      count: monthReviews.length,
      averageRating: monthAvg
    };
  });

  // Simple word cloud (basic implementation)
  const words = reviews.flatMap(r => r.comment.split(/\s+/));
  const wordCount = words.reduce((acc, word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanWord.length > 3) { // Only count words longer than 3 characters
      acc[cleanWord] = (acc[cleanWord] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const wordCloud = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50) // Top 50 words
    .map(([text, value]) => ({ text, value }));

  return {
    totalReviews: reviews.length,
    averageRating,
    responseRate: 0, // This would need user data to calculate
    dimensionAverages,
    monthlyTrends,
    wordCloud
  };
};

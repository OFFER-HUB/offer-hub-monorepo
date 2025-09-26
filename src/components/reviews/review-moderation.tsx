import React, { useState, useCallback } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Flag, 
  XCircle, 
  Filter, 
  Search, 
  ChevronDown, 
  ChevronUp,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  MoreVertical,
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Review, ReviewModerationAction, ReviewStats } from '@/types/review-creation.types';
import { cn } from '@/lib/utils';

type ReviewStatus = 'pending' | 'published' | 'rejected' | 'flagged' | 'all';

interface ReviewModerationProps {
  reviews: Review[];
  onModerate: (reviewId: string, action: 'approve' | 'reject' | 'flag' | 'delete', reason?: string) => Promise<void>;
  stats?: ReviewStats;
  className?: string;
}

export const ReviewModeration: React.FC<ReviewModerationProps> = ({
  reviews,
  onModerate,
  stats,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>('pending');
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [isModerating, setIsModerating] = useState<Record<string, boolean>>({});

  // Filter and search reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle moderation actions
  const handleModerate = async (reviewId: string, action: 'approve' | 'reject' | 'flag' | 'delete', reason?: string) => {
    try {
      setIsModerating(prev => ({ ...prev, [reviewId]: true }));
      await onModerate(reviewId, action, reason);
    } catch (error) {
      console.error('Error moderating review:', error);
    } finally {
      setIsModerating(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Toggle review expansion
  const toggleExpandReview = (reviewId: string) => {
    setExpandedReviewId(prev => prev === reviewId ? null : reviewId);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'flagged':
        return 'warning';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <ShieldCheck className="h-4 w-4 mr-1" />;
      case 'rejected':
        return <ShieldX className="h-4 w-4 mr-1" />;
      case 'flagged':
        return <ShieldAlert className="h-4 w-4 mr-1" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
          <StatCard 
            title="Total" 
            value={stats?.totalReviews || 0} 
            icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />} 
          />
          <StatCard 
            title="Pending" 
            value={reviews.filter(r => r.status === 'pending').length} 
            icon={<AlertCircle className="h-4 w-4 text-amber-500" />} 
          />
          <StatCard 
            title="Flagged" 
            value={reviews.filter(r => r.status === 'flagged').length} 
            icon={<Flag className="h-4 w-4 text-rose-500" />} 
          />
          <StatCard 
            title="Rejected" 
            value={reviews.filter(r => r.status === 'rejected').length} 
            icon={<XCircle className="h-4 w-4 text-destructive" />} 
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reviews..."
              className="w-full pl-8 sm:w-[200px] md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(value: ReviewStatus) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="published">Approved</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No reviews found</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'There are no reviews to display.' 
                  : `There are no ${statusFilter} reviews.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <div 
                className={cn(
                  'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                  expandedReviewId === review.id && 'border-b bg-muted/30'
                )}
                onClick={() => toggleExpandReview(review.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={`/avatars/${review.reviewerId}.png`} />
                      <AvatarFallback>{review.reviewerId.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {review.isAnonymous ? 'Anonymous User' : `User ${review.reviewerId.substring(0, 8)}`}
                        </h4>
                        <Badge variant={getStatusBadgeVariant(review.status)} className="flex items-center gap-1">
                          {getStatusIcon(review.status)}
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reviewed on {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpandReview(review.id);
                      }}
                    >
                      {expandedReviewId === review.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModerate(review.id, 'approve');
                          }}
                          disabled={isModerating[review.id]}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModerate(review.id, 'flag');
                          }}
                          disabled={isModerating[review.id]}
                        >
                          <Flag className="mr-2 h-4 w-4 text-amber-500" />
                          Flag
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModerate(review.id, 'reject');
                          }}
                          disabled={isModerating[review.id]}
                        >
                          <XCircle className="mr-2 h-4 w-4 text-destructive" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
                              handleModerate(review.id, 'delete');
                            }
                          }}
                          disabled={isModerating[review.id]}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              {/* Expanded View */}
              {expandedReviewId === review.id && (
                <div className="p-4 pt-0 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Review Content */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                            <h5 className="text-sm font-medium mb-2">Review</h5>
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <p className="whitespace-pre-line">{review.comment}</p>
                            </div>
                          </div>
                          
                          {/* Ratings */}
                          {review.ratings && review.ratings.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium mb-2">Ratings</h5>
                              <div className="space-y-2">
                                {review.ratings.map((rating, i) => (
                                  <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{rating.label}</span>
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <span 
                                          key={i} 
                                          className={cn(
                                            'text-lg',
                                            i < rating.value ? 'text-yellow-400' : 'text-muted-foreground/30'
                                          )}
                                        >
                                          ★
                                        </span>
                                      ))}
                                      <span className="ml-2 text-sm font-medium">{rating.value}.0</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Custom Questions */}
                          {review.customQuestions && review.customQuestions.length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium mb-2">Additional Questions</h5>
                              <div className="space-y-4">
                                {review.customQuestions.map((q, i) => (
                                  <div key={i}>
                                    <p className="text-sm font-medium text-muted-foreground">{q.question}</p>
                                    <p className="mt-1 text-sm">{q.answer}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Metadata */}
                        <div className="space-y-4">
                          <Card>
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-sm font-medium">Review Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Project ID</p>
                                <p className="text-sm font-medium truncate">{review.projectId}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Reviewer</p>
                                <p className="text-sm font-medium">
                                  {review.isAnonymous ? 'Anonymous' : review.reviewerId}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Submitted</p>
                                <p className="text-sm font-medium">
                                  {format(new Date(review.createdAt), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                              {review.updatedAt !== review.createdAt && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Last Updated</p>
                                  <p className="text-sm font-medium">
                                    {format(new Date(review.updatedAt), 'MMM d, yyyy h:mm a')}
                                  </p>
                                </div>
                              )}
                              {review.metadata?.deviceType && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Device</p>
                                  <p className="text-sm font-medium capitalize">
                                    {review.metadata.deviceType}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                          
                          {/* Moderation Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleModerate(review.id, 'approve')}
                              disabled={isModerating[review.id]}
                              className="gap-1"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleModerate(review.id, 'reject')}
                              disabled={isModerating[review.id]}
                              className="gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleModerate(review.id, 'flag')}
                              disabled={isModerating[review.id]}
                              className="gap-1"
                            >
                              <Flag className="h-4 w-4" />
                              Flag
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
                                  handleModerate(review.id, 'delete');
                                }
                              }}
                              disabled={isModerating[review.id]}
                              className="gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
        </div>
      )}
    </div>
  );
};

// Helper component for stats cards
const StatCard = ({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {icon}
    </div>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </Card>
);

export default ReviewModeration;

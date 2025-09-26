import React, { useState, useMemo } from 'react';
import { Download, BarChart3, PieChart, LineChart, Table, FileText, FileSpreadsheet, FileCode, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Review, ReviewAnalytics } from '@/types/review-creation.types';
import { generateCSV, generateJSON, downloadFile, calculateAnalytics } from '@/utils/export-utils';
import { cn } from '@/lib/utils';

interface ReviewAnalyticsProps {
  reviews: Review[];
  className?: string;
}

export const ReviewAnalytics: React.FC<ReviewAnalyticsProps> = ({ reviews, className }) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [view, setView] = useState<'overview' | 'ratings' | 'trends' | 'export'>('overview');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // Filter reviews by date range
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const reviewDate = new Date(review.createdAt);
      return (
        (!dateRange.from || reviewDate >= dateRange.from) &&
        (!dateRange.to || reviewDate <= dateRange.to)
      );
    });
  }, [reviews, dateRange]);

  // Calculate analytics
  const analytics = useMemo<ReviewAnalytics>(
    () => calculateAnalytics(filteredReviews),
    [filteredReviews]
  );

  // Handle export
  const handleExport = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `reviews-${timestamp}`;
    
    if (exportFormat === 'csv') {
      const csvContent = generateCSV(filteredReviews);
      downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    } else {
      const jsonContent = generateJSON(filteredReviews);
      downloadFile(jsonContent, `${filename}.json`, 'application/json');
    }
  };

  // Format number to 1 decimal place
  const formatNumber = (num: number) => Math.round(num * 10) / 10;

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Analytics</h2>
          <p className="text-muted-foreground">
            Insights and metrics from your reviews
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full md:w-[300px] justify-start text-left font-normal',
                  !dateRange && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, 'MMM d, y')} - {format(dateRange.to, 'MMM d, y')}
                    </>
                  ) : (
                    format(dateRange.from, 'MMM d, y')
                  )
                ) : (
                  <span>Filter by date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={() => setDateRange({})} variant="outline">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Reviews" 
          value={analytics.totalReviews} 
          icon={<FileText className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Average Rating" 
          value={formatNumber(analytics.averageRating)} 
          max={5}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Response Rate" 
          value={analytics.responseRate} 
          suffix="%"
          icon={<PieChart className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Dimensions Rated" 
          value={Object.keys(analytics.dimensionAverages).length} 
          icon={<Table className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>

      <Tabs value={view} onValueChange={(v: 'overview' | 'ratings' | 'trends' | 'export') => setView(v)} className="space-y-4">
      <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>Ratings</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Trends</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>How ratings are distributed across all reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = filteredReviews.filter(r => 
                      r.ratings.some(rating => Math.round(rating.value) === stars)
                    ).length;
                    const percentage = (count / filteredReviews.length) * 100 || 0;
                    
                    return (
                      <div key={stars} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {Array(stars).fill(0).map((_, i) => (
                              <span key={i} className="text-yellow-400">★</span>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {count} ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Review activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end gap-1">
                  {analytics.monthlyTrends.map((month, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-primary rounded-t-sm" 
                        style={{ 
                          height: `${(month.count / Math.max(...analytics.monthlyTrends.map(m => m.count || 1))) * 100}%`,
                          minHeight: '2px'
                        }}
                      />
                      <span className="text-xs text-muted-foreground mt-1">
                        {month.month.charAt(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Word Cloud</CardTitle>
              <CardDescription>Most common words in reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                {analytics.wordCloud.map((word, i) => (
                  <span 
                    key={i}
                    className={cn(
                      'inline-block px-2 py-1 rounded-full',
                      'bg-muted text-muted-foreground',
                      i < 10 && 'text-lg',
                      i >= 10 && i < 20 && 'text-base',
                      i >= 20 && 'text-sm',
                    )}
                    style={{
                      fontSize: `${12 + (word.value * 0.5)}px`,
                      opacity: 0.3 + (word.value / Math.max(...analytics.wordCloud.map(w => w.value)) * 0.7)
                    }}
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Rating Dimensions</CardTitle>
              <CardDescription>Average ratings by dimension</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.dimensionAverages).map(([dimension, average]) => (
                  <div key={dimension}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {dimension.charAt(0).toUpperCase() + dimension.slice(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(average)}/5
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full',
                          average >= 4 ? 'bg-green-500' :
                          average >= 3 ? 'bg-yellow-500' :
                          'bg-red-500'
                        )}
                        style={{ width: `${(average / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Reviews</CardTitle>
              <CardDescription>Export your review data for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Export Format</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Select 
                      value={exportFormat} 
                      onValueChange={(v: 'csv' | 'json') => setExportFormat(v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            CSV (Excel compatible)
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4" />
                            JSON (Structured data)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleExport}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export {filteredReviews.length} Reviews
                  </Button>
                </div>
              </div>
              
              <div className="rounded-md border bg-muted/50 p-4">
                <h3 className="text-sm font-medium mb-2">Preview</h3>
                <div className="bg-background p-4 rounded border overflow-auto max-h-60">
                  <pre className="text-xs text-muted-foreground">
                    {exportFormat === 'csv' 
                      ? generateCSV(filteredReviews.slice(0, 3)) // Show first 3 for preview
                      : generateJSON(filteredReviews.slice(0, 3))}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Showing first 3 of {filteredReviews.length} reviews in preview
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for stat cards
const StatCard = ({
  title,
  value,
  icon,
  max,
  suffix = ''
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  max?: number;
  suffix?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-4 w-4 text-muted-foreground">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}
        {max ? `/${max}` : ''}
        {suffix}
      </div>
      {max && value > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {Math.round((value / max) * 100)}% of maximum
        </p>
      )}
    </CardContent>
  </Card>
);

export default ReviewAnalytics;

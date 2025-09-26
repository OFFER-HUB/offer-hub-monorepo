import React, { useState, useMemo } from 'react';
import { Template, Wand2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewTemplate, ReviewTemplateConfig, ReviewSubmission } from '@/types/review-creation.types';
import { cn } from '@/lib/utils';

const DEFAULT_TEMPLATES: ReviewTemplate[] = [
  {
    id: 'standard',
    name: 'Standard Review',
    description: 'A balanced review template covering all key aspects',
    questions: [
      'What was the most valuable aspect of this collaboration?',
      'What could be improved for future projects?',
    ],
    defaultRatings: [
      { dimension: 'quality', value: 0, label: 'Quality' },
      { dimension: 'communication', value: 0, label: 'Communication' },
      { dimension: 'timeliness', value: 0, label: 'Timeliness' },
      { dimension: 'value', value: 0, label: 'Value' },
    ],
    applicableProjectTypes: ['all'],
  },
  {
    id: 'quick',
    name: 'Quick Feedback',
    description: 'A simple and quick review option',
    questions: ['Would you work with this person again? Why or why not?'],
    defaultRatings: [
      { dimension: 'quality', value: 0, label: 'Overall' },
    ],
    applicableProjectTypes: ['all'],
  },
  {
    id: 'detailed',
    name: 'Detailed Evaluation',
    description: 'Comprehensive feedback with multiple dimensions',
    questions: [
      'What were the key strengths of this collaboration?',
      'What areas need improvement?',
      'Would you recommend this professional to others?',
    ],
    defaultRatings: [
      { dimension: 'quality', value: 0, label: 'Work Quality' },
      { dimension: 'communication', value: 0, label: 'Communication' },
      { dimension: 'timeliness', value: 0, label: 'Deadline Adherence' },
      { dimension: 'value', value: 0, label: 'Value for Money' },
    ],
    applicableProjectTypes: ['long-term', 'complex'],
  },
];

interface ReviewTemplatesProps {
  projectType?: string;
  onTemplateSelect: (template: ReviewTemplate) => void;
  onCustomTemplate?: () => void;
  className?: string;
}

export const ReviewTemplates: React.FC<ReviewTemplatesProps> = ({
  projectType = 'all',
  onTemplateSelect,
  onCustomTemplate,
  className,
}) => {
  const [selectedTab, setSelectedTab] = useState<'recommended' | 'all'>('recommended');

  const filteredTemplates = useMemo(() => {
    return DEFAULT_TEMPLATES.filter(template => 
      template.applicableProjectTypes.includes('all') || 
      template.applicableProjectTypes.includes(projectType)
    );
  }, [projectType]);

  const recommendedTemplates = useMemo(() => {
    // In a real app, this could be based on user history or other factors
    return filteredTemplates.filter(t => ['standard', 'quick'].includes(t.id));
  }, [filteredTemplates]);

  const handleTemplateSelect = (template: ReviewTemplate) => {
    onTemplateSelect(template);
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      <Tabs 
        defaultValue="recommended" 
        className="w-full"
        onValueChange={(value: 'recommended' | 'all') => setSelectedTab(value)}
      >
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              <span>Recommended</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Template className="h-4 w-4" />
              <span>All Templates</span>
            </TabsTrigger>
          </TabsList>
          
          {onCustomTemplate && (
            <Button 
              variant="outline" 
              onClick={onCustomTemplate}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Custom Review</span>
            </Button>
          )}
        </div>

        <TabsContent value="recommended" className="mt-0">
          <TemplateGrid 
            templates={recommendedTemplates} 
            onSelect={handleTemplateSelect} 
            emptyMessage="No recommended templates available for this project type."
          />
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <TemplateGrid 
            templates={filteredTemplates} 
            onSelect={handleTemplateSelect} 
            emptyMessage="No templates available for this project type."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface TemplateGridProps {
  templates: ReviewTemplate[];
  onSelect: (template: ReviewTemplate) => void;
  emptyMessage: string;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({ templates, onSelect, emptyMessage }) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card 
          key={template.id} 
          className="h-full flex flex-col cursor-pointer hover:border-primary transition-colors"
          onClick={() => onSelect(template)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <Template className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="text-sm text-muted-foreground mb-3">
              <p className="font-medium mb-1">Includes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{template.defaultRatings.length} rating dimensions</li>
                <li>{template.questions.length} questions</li>
              </ul>
            </div>
            <Button 
              variant="outline" 
              className="mt-auto w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(template);
              }}
            >
              Use this template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewTemplates;

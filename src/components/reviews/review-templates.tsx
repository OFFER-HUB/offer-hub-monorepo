/**
 * Professional Review Template System
 * Comprehensive template management with category filtering and custom template creation
 */

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Info,
  Copy,
  Download,
  Upload,
  Settings,
  X
} from 'lucide-react';
import {
  ReviewTemplate,
  ReviewTemplateCategory,
  ReviewTemplateSection,
  ReviewTemplatesProps,
  REVIEW_TEMPLATE_CATEGORIES
} from '@/types/review-creation.types';

// ===== TEMPLATE CATEGORY CONFIGURATIONS =====

const CATEGORY_CONFIG = {
  [REVIEW_TEMPLATE_CATEGORIES.WEB_DEVELOPMENT]: {
    label: 'Web Development',
    icon: '🌐',
    description: 'Templates for web development projects',
    color: 'bg-blue-100 text-blue-800'
  },
  [REVIEW_TEMPLATE_CATEGORIES.MOBILE_DEVELOPMENT]: {
    label: 'Mobile Development',
    icon: '📱',
    description: 'Templates for mobile app development',
    color: 'bg-green-100 text-green-800'
  },
  [REVIEW_TEMPLATE_CATEGORIES.DESIGN]: {
    label: 'Design',
    icon: '🎨',
    description: 'Templates for design projects',
    color: 'bg-purple-100 text-purple-800'
  },
  [REVIEW_TEMPLATE_CATEGORIES.WRITING]: {
    label: 'Writing',
    icon: '✍️',
    description: 'Templates for writing and content projects',
    color: 'bg-orange-100 text-orange-800'
  },
  [REVIEW_TEMPLATE_CATEGORIES.MARKETING]: {
    label: 'Marketing',
    icon: '📢',
    description: 'Templates for marketing campaigns',
    color: 'bg-pink-100 text-pink-800'
  },
  [REVIEW_TEMPLATE_CATEGORIES.CONSULTING]: {
    label: 'Consulting',
    icon: '💼',
    description: 'Templates for consulting services',
    color: 'bg-indigo-100 text-indigo-800'
  },
  [REVIEW_TEMPLATE_CATEGORIES.DATA_ANALYSIS]: {
    label: 'Data Analysis',
    icon: '📊',
    description: 'Templates for data analysis projects',
    color: 'bg-cyan-100 text-cyan-800'
  },
  [REVIEW_TEMPLATE_CATEGORIES.GENERAL]: {
    label: 'General',
    icon: '📋',
    description: 'General purpose templates',
    color: 'bg-gray-100 text-gray-800'
  },
  [REVIEW_TEMPLATE_CATEGORIES.CUSTOM]: {
    label: 'Custom',
    icon: '⚙️',
    description: 'Custom user-created templates',
    color: 'bg-yellow-100 text-yellow-800'
  }
};

// ===== DEFAULT TEMPLATES =====

const DEFAULT_TEMPLATES: ReviewTemplate[] = [
  {
    id: 'web_dev_comprehensive',
    name: 'Comprehensive Web Development Review',
    description: 'Detailed template covering all aspects of web development projects',
    category: REVIEW_TEMPLATE_CATEGORIES.WEB_DEVELOPMENT,
    projectTypes: ['web_development', 'frontend', 'backend', 'fullstack'],
    sections: [
      {
        id: 'project_overview',
        title: 'Project Overview',
        type: 'text',
        required: true,
        placeholder: 'Briefly describe the project and its objectives',
        minLength: 50,
        maxLength: 500
      },
      {
        id: 'technical_quality',
        title: 'Technical Quality',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'code_quality',
        title: 'Code Quality',
        type: 'text',
        required: true,
        placeholder: 'How was the code quality? Consider structure, documentation, best practices',
        minLength: 30,
        maxLength: 300
      },
      {
        id: 'communication',
        title: 'Communication',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'timeliness',
        title: 'Timeliness',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'value_for_money',
        title: 'Value for Money',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'overall_experience',
        title: 'Overall Experience',
        type: 'text',
        required: true,
        placeholder: 'Share your overall experience and any recommendations',
        minLength: 50,
        maxLength: 500
      }
    ],
    isDefault: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'design_project',
    name: 'Design Project Review',
    description: 'Template specifically for design and creative projects',
    category: REVIEW_TEMPLATE_CATEGORIES.DESIGN,
    projectTypes: ['ui_design', 'ux_design', 'graphic_design', 'branding'],
    sections: [
      {
        id: 'design_quality',
        title: 'Design Quality',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'creativity',
        title: 'Creativity & Innovation',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'communication',
        title: 'Communication',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'timeliness',
        title: 'Timeliness',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'value_for_money',
        title: 'Value for Money',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'design_feedback',
        title: 'Design Feedback',
        type: 'text',
        required: true,
        placeholder: 'Share specific feedback about the design work',
        minLength: 50,
        maxLength: 400
      }
    ],
    isDefault: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'writing_project',
    name: 'Writing Project Review',
    description: 'Template for content writing and copywriting projects',
    category: REVIEW_TEMPLATE_CATEGORIES.WRITING,
    projectTypes: ['content_writing', 'copywriting', 'technical_writing', 'editing'],
    sections: [
      {
        id: 'writing_quality',
        title: 'Writing Quality',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'grammar_accuracy',
        title: 'Grammar & Accuracy',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'communication',
        title: 'Communication',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'timeliness',
        title: 'Timeliness',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'value_for_money',
        title: 'Value for Money',
        type: 'rating',
        required: true,
        validation: { min: 1, max: 5 }
      },
      {
        id: 'content_feedback',
        title: 'Content Feedback',
        type: 'text',
        required: true,
        placeholder: 'Share feedback about the writing quality and content',
        minLength: 50,
        maxLength: 400
      }
    ],
    isDefault: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ===== COMPONENT INTERFACES =====

interface TemplateCardProps {
  template: ReviewTemplate;
  onSelect: (template: ReviewTemplate) => void;
  onEdit?: (template: ReviewTemplate) => void;
  onDelete?: (template: ReviewTemplate) => void;
  onDuplicate?: (template: ReviewTemplate) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

interface TemplateSectionProps {
  section: ReviewTemplateSection;
  index: number;
}

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: Omit<ReviewTemplate, 'id'>) => void;
  editingTemplate?: ReviewTemplate;
}

// ===== TEMPLATE CARD COMPONENT =====

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  isSelected = false,
  showActions = true
}) => {
  const categoryConfig = CATEGORY_CONFIG[template.category];
  const sectionCount = template.sections.length;
  const requiredSections = template.sections.filter(s => s.required).length;

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{categoryConfig.icon}</span>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            {template.isDefault && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <Info className="h-3 w-3" />
              <span>{sectionCount} sections</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>{requiredSections} required</span>
            </span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-1 ml-2">
            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(template);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Duplicate template"
              >
                <Copy className="h-4 w-4" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(template);
                }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit template"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && !template.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(template);
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete template"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 text-xs rounded-full ${categoryConfig.color}`}>
          {categoryConfig.label}
        </span>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

// ===== TEMPLATE SECTION COMPONENT =====

const TemplateSection: React.FC<TemplateSectionProps> = ({ section, index }) => {
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'rating': return '⭐';
      case 'multiple_choice': return '☑️';
      case 'scale': return '📊';
      default: return '📋';
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm">{getSectionIcon(section.type)}</span>
        <span className="font-medium text-sm text-gray-900">{section.title}</span>
        {section.required && (
          <span className="px-1 py-0.5 text-xs bg-red-100 text-red-800 rounded">
            Required
          </span>
        )}
      </div>
      
      <div className="text-xs text-gray-600 space-y-1">
        <p>Type: {section.type}</p>
        {section.placeholder && <p>Placeholder: {section.placeholder}</p>}
        {section.minLength && <p>Min length: {section.minLength}</p>}
        {section.maxLength && <p>Max length: {section.maxLength}</p>}
        {section.options && <p>Options: {section.options.length} choices</p>}
      </div>
    </div>
  );
};

// ===== CREATE TEMPLATE MODAL COMPONENT =====

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTemplate
}) => {
  const [formData, setFormData] = useState({
    name: editingTemplate?.name || '',
    description: editingTemplate?.description || '',
    category: editingTemplate?.category || REVIEW_TEMPLATE_CATEGORIES.GENERAL,
    projectTypes: editingTemplate?.projectTypes || [],
    sections: editingTemplate?.sections || []
  });

  const [newSection, setNewSection] = useState({
    title: '',
    type: 'text' as const,
    required: false,
    placeholder: '',
    minLength: undefined as number | undefined,
    maxLength: undefined as number | undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const template: Omit<ReviewTemplate, 'id'> = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      projectTypes: formData.projectTypes,
      sections: formData.sections,
      isDefault: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSubmit(template);
    onClose();
  };

  const addSection = () => {
    if (newSection.title) {
      const section: ReviewTemplateSection = {
        id: `section_${Date.now()}`,
        title: newSection.title,
        type: newSection.type,
        required: newSection.required,
        placeholder: newSection.placeholder || undefined,
        minLength: newSection.minLength,
        maxLength: newSection.maxLength
      };

      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, section]
      }));

      setNewSection({
        title: '',
        type: 'text',
        required: false,
        placeholder: '',
        minLength: undefined,
        maxLength: undefined
      });
    }
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {editingTemplate ? 'Edit Template' : 'Create New Template'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ReviewTemplateCategory }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Sections
            </label>
            
            <div className="space-y-3 mb-4">
              {formData.sections.map((section, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-sm">{section.title}</span>
                    <span className="text-xs text-gray-500 ml-2">({section.type})</span>
                    {section.required && (
                      <span className="text-xs text-red-600 ml-2">Required</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Section</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Section title"
                  value={newSection.title}
                  onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newSection.type}
                  onChange={(e) => setNewSection(prev => ({ ...prev, type: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="rating">Rating</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="scale">Scale</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={newSection.required}
                    onChange={(e) => setNewSection(prev => ({ ...prev, required: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
                <button
                  type="button"
                  onClick={addSection}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Add Section
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== MAIN REVIEW TEMPLATES COMPONENT =====

export const ReviewTemplates: React.FC<ReviewTemplatesProps> = ({
  category,
  projectType,
  onTemplateSelect,
  onTemplateCreate,
  showCreateButton = true,
  showCategoryFilter = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReviewTemplateCategory | 'all'>(
    category || 'all'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<ReviewTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReviewTemplate | undefined>();

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let templates = [...DEFAULT_TEMPLATES];

    // Filter by category
    if (selectedCategory !== 'all') {
      templates = templates.filter(template => template.category === selectedCategory);
    }

    // Filter by project type
    if (projectType) {
      templates = templates.filter(template => 
        template.projectTypes.includes(projectType)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.projectTypes.some(type => type.toLowerCase().includes(query))
      );
    }

    return templates;
  }, [selectedCategory, projectType, searchQuery]);

  const handleTemplateSelect = useCallback((template: ReviewTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect(template);
  }, [onTemplateSelect]);

  const handleTemplateCreate = useCallback((template: Omit<ReviewTemplate, 'id'>) => {
    onTemplateCreate?.(template);
    setShowCreateModal(false);
  }, [onTemplateCreate]);

  const handleTemplateEdit = useCallback((template: ReviewTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  }, []);

  const handleTemplateDelete = useCallback((template: ReviewTemplate) => {
    // In a real implementation, this would delete from the database
    console.log('Delete template:', template.id);
  }, []);

  const handleTemplateDuplicate = useCallback((template: ReviewTemplate) => {
    const duplicatedTemplate: Omit<ReviewTemplate, 'id'> = {
      ...template,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onTemplateCreate?.(duplicatedTemplate);
  }, [onTemplateCreate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Templates</h2>
          <p className="text-gray-600">Choose a professional template for your review</p>
        </div>
        
        {showCreateButton && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Template</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {showCategoryFilter && (
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ReviewTemplateCategory | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Template Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleTemplateSelect}
              onEdit={handleTemplateEdit}
              onDelete={handleTemplateDelete}
              onDuplicate={handleTemplateDuplicate}
              isSelected={selectedTemplate?.id === template.id}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No templates available for this project type'
            }
          </p>
          {showCreateButton && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Template</span>
            </button>
          )}
        </div>
      )}

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {selectedTemplate.name}
              </h3>
              <p className="text-blue-700 mb-2">{selectedTemplate.description}</p>
              <div className="flex items-center space-x-4 text-sm text-blue-600">
                <span className="flex items-center space-x-1">
                  <Info className="h-4 w-4" />
                  <span>{selectedTemplate.sections.length} sections</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{selectedTemplate.projectTypes.length} project types</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-blue-900">Template Sections:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedTemplate.sections.map((section, index) => (
                <TemplateSection key={index} section={section} index={index} />
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleTemplateSelect(selectedTemplate)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Use This Template
            </button>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTemplate(undefined);
        }}
        onSubmit={handleTemplateCreate}
        editingTemplate={editingTemplate}
      />
    </div>
  );
};

export default ReviewTemplates;

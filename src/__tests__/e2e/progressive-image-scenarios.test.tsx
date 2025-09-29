import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PortfolioCarousel from '@/components/talent/talents/Portfolio';
import { MessageBubble } from '@/components/messagesComp/message-bubble';
import { MessageInput } from '@/components/messagesComp/message-input';
import { type Message } from '@/types/messages-types';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock ProgressiveImage component with realistic behavior
jest.mock('@/components/ui/progressive-image', () => {
  return function MockProgressiveImage({ src, alt, onLoad, onError, ...props }: any) {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);
    
    React.useEffect(() => {
      // Simulate loading delay
      const timer = setTimeout(() => {
        if (src && !src.includes('invalid')) {
          setIsLoaded(true);
          onLoad?.();
        } else {
          setHasError(true);
          onError?.();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }, [src, onLoad, onError]);
    
    if (hasError) {
      return (
        <div data-testid="image-error">
          <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs">Failed to load</p>
        </div>
      );
    }
    
    return (
      <img
        src={src}
        alt={alt}
        data-testid="progressive-image"
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
    );
  };
});

// Mock emoji picker
jest.mock('@emoji-mart/react', () => {
  return function MockPicker() {
    return <div data-testid="emoji-picker">Emoji Picker</div>;
  };
});

describe('Progressive Image Loading End-to-End Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Profile Scenario', () => {
    it('handles complete user profile with progressive images', async () => {
      render(
        <div className="user-profile">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src="https://example.com/user-avatar.jpg" 
              alt="User avatar"
              blurDataURL="data:image/jpeg;base64,custom-blur"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      );
      
      // Initially should show blur placeholder
      const progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveClass('opacity-0');
      
      // Wait for image to load
      await waitFor(() => {
        expect(progressiveImage).toHaveClass('opacity-100');
      }, { timeout: 2000 });
    });

    it('handles avatar loading failure gracefully', async () => {
      render(
        <Avatar>
          <AvatarImage 
            src="https://example.com/invalid-avatar.jpg" 
            alt="User avatar"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      
      // Wait for error state
      await waitFor(() => {
        expect(screen.getByTestId('image-error')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Fallback should be shown
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Portfolio Gallery Scenario', () => {
    const mockPortfolioItems = [
      {
        id: '1',
        title: 'E-commerce Website',
        description: 'Modern e-commerce platform',
        date: 'January 2024',
        image: 'https://example.com/project1.jpg',
      },
      {
        id: '2',
        title: 'Mobile App',
        description: 'Fitness tracking app',
        date: 'February 2024',
        image: 'https://example.com/project2.jpg',
      },
      {
        id: '3',
        title: 'Dashboard Design',
        description: 'Analytics dashboard',
        date: 'March 2024',
        image: 'https://example.com/project3.jpg',
      },
    ];

    it('handles portfolio browsing with progressive loading', async () => {
      render(
        <PortfolioCarousel 
          items={mockPortfolioItems}
          itemsPerPage={2}
          talentId="talent-123"
        />
      );
      
      // Should show first 2 items
      expect(screen.getByText('E-commerce Website')).toBeInTheDocument();
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard Design')).not.toBeInTheDocument();
      
      // Images should be loading
      const progressiveImages = screen.getAllByTestId('progressive-image');
      expect(progressiveImages).toHaveLength(2);
      
      // Wait for images to load
      await waitFor(() => {
        progressiveImages.forEach(img => {
          expect(img).toHaveClass('opacity-100');
        });
      }, { timeout: 2000 });
      
      // Navigate to next page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      // Should show third item
      expect(screen.getByText('Dashboard Design')).toBeInTheDocument();
      expect(screen.queryByText('E-commerce Website')).not.toBeInTheDocument();
    });

    it('handles portfolio project selection', async () => {
      render(
        <PortfolioCarousel 
          items={mockPortfolioItems}
          itemsPerPage={3}
          talentId="talent-123"
        />
      );
      
      // Wait for images to load
      await waitFor(() => {
        const progressiveImages = screen.getAllByTestId('progressive-image');
        progressiveImages.forEach(img => {
          expect(img).toHaveClass('opacity-100');
        });
      }, { timeout: 2000 });
      
      // Click on first project
      const firstProject = screen.getByText('E-commerce Website').closest('[class*="cursor-pointer"]');
      fireEvent.click(firstProject!);
      
      expect(mockPush).toHaveBeenCalledWith('/talent/talent-123/portfolio/1');
    });

    it('handles portfolio with mixed image states', async () => {
      const mixedPortfolioItems = [
        {
          id: '1',
          title: 'Valid Project',
          description: 'This image loads successfully',
          date: 'January 2024',
          image: 'https://example.com/valid-project.jpg',
        },
        {
          id: '2',
          title: 'Invalid Project',
          description: 'This image fails to load',
          date: 'February 2024',
          image: 'https://example.com/invalid-project.jpg',
        },
      ];
      
      render(
        <PortfolioCarousel 
          items={mixedPortfolioItems}
          itemsPerPage={2}
          talentId="talent-123"
        />
      );
      
      // Wait for loading to complete
      await waitFor(() => {
        const progressiveImages = screen.getAllByTestId('progressive-image');
        const errorStates = screen.queryAllByTestId('image-error');
        
        // One should load successfully, one should fail
        expect(progressiveImages).toHaveLength(1);
        expect(errorStates).toHaveLength(1);
      }, { timeout: 2000 });
    });
  });

  describe('Messaging Scenario', () => {
    const mockMessage: Message = {
      id: '1',
      text: 'Check out this image!',
      time: '2024-01-15T10:30:00Z',
      direction: 'sent',
      attachments: [
        {
          id: 'att1',
          name: 'screenshot.png',
          url: 'https://example.com/screenshot.png',
          size: 1024000,
          kind: 'image',
          mime: 'image/png',
        },
      ],
      status: 'delivered',
      replyTo: null,
    };

    it('handles message with image attachments', async () => {
      render(<MessageBubble {...mockMessage} />);
      
      const progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toBeInTheDocument();
      expect(progressiveImage).toHaveAttribute('src', 'https://example.com/screenshot.png');
      
      // Wait for image to load
      await waitFor(() => {
        expect(progressiveImage).toHaveClass('opacity-100');
      }, { timeout: 2000 });
    });

    it('handles multiple image attachments in message', async () => {
      const messageWithMultipleImages = {
        ...mockMessage,
        attachments: [
          {
            id: 'att1',
            name: 'image1.png',
            url: 'https://example.com/image1.png',
            size: 1024000,
            kind: 'image',
            mime: 'image/png',
          },
          {
            id: 'att2',
            name: 'image2.jpg',
            url: 'https://example.com/image2.jpg',
            size: 1024000,
            kind: 'image',
            mime: 'image/jpeg',
          },
        ],
      };
      
      render(<MessageBubble {...messageWithMultipleImages} />);
      
      const progressiveImages = screen.getAllByTestId('progressive-image');
      expect(progressiveImages).toHaveLength(2);
      
      // Wait for all images to load
      await waitFor(() => {
        progressiveImages.forEach(img => {
          expect(img).toHaveClass('opacity-100');
        });
      }, { timeout: 2000 });
    });

    it('handles message input with image previews', async () => {
      // Mock file
      const mockFile = new File(['image content'], 'test-image.jpg', {
        type: 'image/jpeg',
      });
      
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
      
      render(<MessageInput placeholder="Type a message..." />);
      
      // Simulate file selection
      const fileInput = screen.getByLabelText('Attach files');
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      await waitFor(() => {
        const progressiveImage = screen.getByTestId('progressive-image');
        expect(progressiveImage).toBeInTheDocument();
        expect(progressiveImage).toHaveAttribute('alt', 'test-image.jpg');
      });
      
      // Wait for image to load
      await waitFor(() => {
        const progressiveImage = screen.getByTestId('progressive-image');
        expect(progressiveImage).toHaveClass('opacity-100');
      }, { timeout: 2000 });
    });
  });

  describe('Performance and User Experience Scenarios', () => {
    it('handles rapid image loading scenarios', async () => {
      const manyItems = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Project ${i + 1}`,
        description: `Description for project ${i + 1}`,
        date: 'January 2024',
        image: `https://example.com/project${i + 1}.jpg`,
      }));
      
      render(
        <PortfolioCarousel 
          items={manyItems}
          itemsPerPage={5}
          talentId="talent-123"
        />
      );
      
      // Should show first 5 items
      const progressiveImages = screen.getAllByTestId('progressive-image');
      expect(progressiveImages).toHaveLength(5);
      
      // Wait for all images to load
      await waitFor(() => {
        progressiveImages.forEach(img => {
          expect(img).toHaveClass('opacity-100');
        });
      }, { timeout: 3000 });
    });

    it('handles network failure scenarios gracefully', async () => {
      const itemsWithInvalidImages = [
        {
          id: '1',
          title: 'Project with Invalid Image',
          description: 'This project has an invalid image URL',
          date: 'January 2024',
          image: 'https://example.com/invalid-image.jpg',
        },
      ];
      
      render(
        <PortfolioCarousel 
          items={itemsWithInvalidImages}
          itemsPerPage={1}
          talentId="talent-123"
        />
      );
      
      // Wait for error state
      await waitFor(() => {
        expect(screen.getByTestId('image-error')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Project should still be clickable
      const projectCard = screen.getByText('Project with Invalid Image').closest('[class*="cursor-pointer"]');
      fireEvent.click(projectCard!);
      
      expect(mockPush).toHaveBeenCalledWith('/talent/talent-123/portfolio/1');
    });

    it('maintains user interaction during image loading', async () => {
      render(
        <div className="mixed-content">
          <Avatar className="h-12 w-12">
            <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          
          <PortfolioCarousel 
            items={[{
              id: '1',
              title: 'Test Project',
              description: 'Test description',
              date: 'January 2024',
              image: 'https://example.com/project.jpg',
            }]}
            itemsPerPage={1}
            talentId="talent-123"
          />
        </div>
      );
      
      // User should be able to interact with content while images load
      const projectCard = screen.getByText('Test Project').closest('[class*="cursor-pointer"]');
      expect(projectCard).toBeInTheDocument();
      
      // Click should work even while images are loading
      fireEvent.click(projectCard!);
      expect(mockPush).toHaveBeenCalledWith('/talent/talent-123/portfolio/1');
      
      // Wait for images to load
      await waitFor(() => {
        const progressiveImages = screen.getAllByTestId('progressive-image');
        progressiveImages.forEach(img => {
          expect(img).toHaveClass('opacity-100');
        });
      }, { timeout: 2000 });
    });
  });
});

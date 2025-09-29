import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import PortfolioCarousel from '@/components/talent/talents/Portfolio';
import { MessageBubble } from '@/components/messagesComp/message-bubble';
import { type Message } from '@/types/messages-types';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock ProgressiveImage component
jest.mock('@/components/ui/progressive-image', () => {
  return function MockProgressiveImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        data-testid="progressive-image"
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    );
  };
});

describe('Progressive Image Loading Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Avatar Integration', () => {
    it('integrates progressive loading with avatar component', async () => {
      render(
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src="https://example.com/avatar.jpg" 
            alt="User avatar"
            blurDataURL="data:image/jpeg;base64,custom-blur"
          />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      );
      
      const progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toBeInTheDocument();
      expect(progressiveImage).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      expect(progressiveImage).toHaveAttribute('alt', 'User avatar');
      expect(progressiveImage).toHaveAttribute('blurDataURL', 'data:image/jpeg;base64,custom-blur');
      expect(progressiveImage).toHaveAttribute('fill', 'true');
      expect(progressiveImage).toHaveAttribute('sizes', '40px');
    });

    it('handles avatar loading states correctly', async () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      );
      
      const progressiveImage = screen.getByTestId('progressive-image');
      
      // Simulate loading
      fireEvent.load(progressiveImage);
      
      await waitFor(() => {
        expect(progressiveImage).toHaveClass('opacity-100');
      });
    });

    it('handles avatar error states correctly', async () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/invalid.jpg" alt="User avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      );
      
      const progressiveImage = screen.getByTestId('progressive-image');
      
      // Simulate error
      fireEvent.error(progressiveImage);
      
      await waitFor(() => {
        expect(screen.getByText('U')).toBeInTheDocument();
      });
    });
  });

  describe('Portfolio Integration', () => {
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
    ];

    it('integrates progressive loading with portfolio carousel', () => {
      render(
        <PortfolioCarousel 
          items={mockPortfolioItems}
          itemsPerPage={2}
          talentId="talent-123"
        />
      );
      
      const progressiveImages = screen.getAllByTestId('progressive-image');
      expect(progressiveImages).toHaveLength(2);
      
      expect(progressiveImages[0]).toHaveAttribute('src', 'https://example.com/project1.jpg');
      expect(progressiveImages[1]).toHaveAttribute('src', 'https://example.com/project2.jpg');
    });

    it('handles portfolio navigation with progressive images', () => {
      render(
        <PortfolioCarousel 
          items={mockPortfolioItems}
          itemsPerPage={1}
          talentId="talent-123"
        />
      );
      
      // Click on first project
      const firstProject = screen.getByText('E-commerce Website').closest('[class*="cursor-pointer"]');
      fireEvent.click(firstProject!);
      
      expect(mockPush).toHaveBeenCalledWith('/talent/talent-123/portfolio/1');
    });

    it('handles portfolio pagination with progressive images', () => {
      const moreItems = [
        ...mockPortfolioItems,
        {
          id: '3',
          title: 'Dashboard Design',
          description: 'Analytics dashboard',
          date: 'March 2024',
          image: 'https://example.com/project3.jpg',
        },
      ];
      
      render(
        <PortfolioCarousel 
          items={moreItems}
          itemsPerPage={2}
          talentId="talent-123"
        />
      );
      
      // Should show first 2 items
      expect(screen.getByText('E-commerce Website')).toBeInTheDocument();
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard Design')).not.toBeInTheDocument();
      
      // Click next
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      // Should show third item
      expect(screen.getByText('Dashboard Design')).toBeInTheDocument();
      expect(screen.queryByText('E-commerce Website')).not.toBeInTheDocument();
    });
  });

  describe('Message Integration', () => {
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

    it('integrates progressive loading with message bubbles', () => {
      render(<MessageBubble {...mockMessage} />);
      
      const progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toBeInTheDocument();
      expect(progressiveImage).toHaveAttribute('src', 'https://example.com/screenshot.png');
      expect(progressiveImage).toHaveAttribute('alt', 'screenshot.png');
      expect(progressiveImage).toHaveAttribute('fill', 'true');
      expect(progressiveImage).toHaveAttribute('sizes', '(max-width: 640px) 50vw, 300px');
    });

    it('handles multiple image attachments in messages', () => {
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
      
      // Should use grid layout for multiple images
      const gridContainer = progressiveImages[0].closest('[class*="grid"]');
      expect(gridContainer).toHaveClass('grid-cols-2');
    });

    it('handles mixed attachment types in messages', () => {
      const messageWithMixedAttachments = {
        ...mockMessage,
        attachments: [
          {
            id: 'att1',
            name: 'image.png',
            url: 'https://example.com/image.png',
            size: 1024000,
            kind: 'image',
            mime: 'image/png',
          },
          {
            id: 'att2',
            name: 'document.pdf',
            url: 'https://example.com/document.pdf',
            size: 2048000,
            kind: 'file',
            mime: 'application/pdf',
          },
        ],
      };
      
      render(<MessageBubble {...messageWithMixedAttachments} />);
      
      // Should only render progressive image for the image attachment
      const progressiveImages = screen.getAllByTestId('progressive-image');
      expect(progressiveImages).toHaveLength(1);
      
      // Should also render file chip for the PDF
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });
  });

  describe('Cross-Component Integration', () => {
    it('maintains consistent progressive loading across different components', () => {
      const { rerender } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      );
      
      let progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveAttribute('fill', 'true');
      expect(progressiveImage).toHaveAttribute('sizes', '40px');
      
      // Test with portfolio component
      rerender(
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
      );
      
      progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveAttribute('src', 'https://example.com/project.jpg');
      expect(progressiveImage).toHaveAttribute('alt', 'Test Project');
    });

    it('handles progressive loading with different image sizes and contexts', () => {
      // Test avatar (small, square)
      const { rerender } = render(
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      );
      
      let progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveAttribute('sizes', '40px');
      
      // Test portfolio (medium, rectangular)
      rerender(
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
      );
      
      progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveAttribute('width', '300');
      expect(progressiveImage).toHaveAttribute('height', '200');
      
      // Test message (small, square)
      rerender(
        <MessageBubble 
          id="1"
          text="Test message"
          time="2024-01-15T10:30:00Z"
          direction="sent"
          attachments={[{
            id: 'att1',
            name: 'image.png',
            url: 'https://example.com/image.png',
            size: 1024000,
            kind: 'image',
            mime: 'image/png',
          }]}
          status="delivered"
          replyTo={null}
        />
      );
      
      progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveAttribute('fill', 'true');
      expect(progressiveImage).toHaveAttribute('sizes', '(max-width: 640px) 50vw, 300px');
    });
  });
});

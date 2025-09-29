import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageBubble } from '../message-bubble';
import { type Message } from '@/types/messages-types';

// Mock ProgressiveImage component
jest.mock('@/components/ui/progressive-image', () => {
  return function MockProgressiveImage({ src, alt, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        data-testid="progressive-image"
        {...props}
      />
    );
  };
});

// Mock message data
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
    {
      id: 'att2',
      name: 'document.pdf',
      url: 'https://example.com/document.pdf',
      size: 2048000,
      kind: 'file',
      mime: 'application/pdf',
    },
  ],
  status: 'delivered',
  replyTo: null,
};

describe('MessageBubble with Progressive Image Loading', () => {
  const defaultProps = {
    id: mockMessage.id,
    text: mockMessage.text,
    time: mockMessage.time,
    direction: mockMessage.direction,
    attachments: mockMessage.attachments,
    status: mockMessage.status,
    replyTo: mockMessage.replyTo,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders image attachments with progressive loading', () => {
    render(<MessageBubble {...defaultProps} />);
    
    const progressiveImages = screen.getAllByTestId('progressive-image');
    expect(progressiveImages).toHaveLength(1); // Only image attachment
    
    const imageAttachment = progressiveImages[0];
    expect(imageAttachment).toHaveAttribute('src', 'https://example.com/screenshot.png');
    expect(imageAttachment).toHaveAttribute('alt', 'screenshot.png');
  });

  it('uses placeholder when image URL is not provided', () => {
    const messageWithMissingImageUrl = {
      ...defaultProps,
      attachments: [
        {
          ...mockMessage.attachments[0],
          url: undefined,
        },
      ],
    };
    
    render(<MessageBubble {...messageWithMissingImageUrl} />);
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toHaveAttribute('src', '/placeholder.svg?height=300&width=300&query=chat-media');
  });

  it('applies correct styling to image containers', () => {
    render(<MessageBubble {...defaultProps} />);
    
    const imageContainer = screen.getByTestId('progressive-image').closest('div');
    expect(imageContainer).toHaveClass('relative', 'aspect-square', 'overflow-hidden', 'rounded-xl');
  });

  it('handles multiple image attachments', () => {
    const messageWithMultipleImages = {
      ...defaultProps,
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

  it('uses single column layout for single image', () => {
    render(<MessageBubble {...defaultProps} />);
    
    const gridContainer = screen.getByTestId('progressive-image').closest('[class*="grid"]');
    expect(gridContainer).toHaveClass('grid-cols-1');
  });

  it('applies correct sizes attribute to progressive images', () => {
    render(<MessageBubble {...defaultProps} />);
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toHaveAttribute('sizes', '(max-width: 640px) 50vw, 300px');
  });

  it('handles image attachments with different mime types', () => {
    const messageWithDifferentImageTypes = {
      ...defaultProps,
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
          name: 'image.jpg',
          url: 'https://example.com/image.jpg',
          size: 1024000,
          kind: 'image',
          mime: 'image/jpeg',
        },
        {
          id: 'att3',
          name: 'image.gif',
          url: 'https://example.com/image.gif',
          size: 1024000,
          kind: 'image',
          mime: 'image/gif',
        },
      ],
    };
    
    render(<MessageBubble {...messageWithDifferentImageTypes} />);
    
    const progressiveImages = screen.getAllByTestId('progressive-image');
    expect(progressiveImages).toHaveLength(3);
    
    expect(progressiveImages[0]).toHaveAttribute('alt', 'image.png');
    expect(progressiveImages[1]).toHaveAttribute('alt', 'image.jpg');
    expect(progressiveImages[2]).toHaveAttribute('alt', 'image.gif');
  });

  it('does not render progressive images for non-image attachments', () => {
    const messageWithOnlyFiles = {
      ...defaultProps,
      attachments: [
        {
          id: 'att1',
          name: 'document.pdf',
          url: 'https://example.com/document.pdf',
          size: 2048000,
          kind: 'file',
          mime: 'application/pdf',
        },
      ],
    };
    
    render(<MessageBubble {...messageWithOnlyFiles} />);
    
    expect(screen.queryByTestId('progressive-image')).not.toBeInTheDocument();
  });

  it('handles mixed attachment types correctly', () => {
    const messageWithMixedAttachments = {
      ...defaultProps,
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

  it('applies correct fill attribute to progressive images', () => {
    render(<MessageBubble {...defaultProps} />);
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toHaveAttribute('fill', 'true');
  });

  it('handles empty attachments array', () => {
    const messageWithoutAttachments = {
      ...defaultProps,
      attachments: [],
    };
    
    render(<MessageBubble {...messageWithoutAttachments} />);
    
    expect(screen.queryByTestId('progressive-image')).not.toBeInTheDocument();
  });

  it('maintains message bubble functionality with progressive images', () => {
    const onReplyMock = jest.fn();
    const onJumpToMock = jest.fn();
    
    render(
      <MessageBubble 
        {...defaultProps} 
        onReply={onReplyMock}
        onJumpTo={onJumpToMock}
      />
    );
    
    // Progressive image should be present
    expect(screen.getByTestId('progressive-image')).toBeInTheDocument();
    
    // Message text should be present
    expect(screen.getByText('Check out this image!')).toBeInTheDocument();
    
    // Reply functionality should work
    const replyButton = screen.getByLabelText('Reply');
    fireEvent.click(replyButton);
    expect(onReplyMock).toHaveBeenCalledWith('1');
  });
});

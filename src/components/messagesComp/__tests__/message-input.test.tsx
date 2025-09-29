import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MessageInput } from '../message-input';

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

// Mock emoji picker
jest.mock('@emoji-mart/react', () => {
  return function MockPicker() {
    return <div data-testid="emoji-picker">Emoji Picker</div>;
  };
});

describe('MessageInput with Progressive Image Loading', () => {
  const defaultProps = {
    placeholder: 'Type a message...',
    onSend: jest.fn(),
    onAttach: jest.fn(),
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders progressive images for image attachments', async () => {
    // Create a mock file
    const mockFile = new File(['image content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });
    
    // Mock URL.createObjectURL
    const mockObjectURL = 'blob:mock-object-url';
    global.URL.createObjectURL = jest.fn(() => mockObjectURL);
    
    render(<MessageInput {...defaultProps} />);
    
    // Simulate file selection
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      const progressiveImages = screen.getAllByTestId('progressive-image');
      expect(progressiveImages).toHaveLength(1);
      
      const progressiveImage = progressiveImages[0];
      expect(progressiveImage).toHaveAttribute('alt', 'test-image.jpg');
    });
  });

  it('uses placeholder when data URL is not available', async () => {
    const mockFile = new File(['image content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });
    
    // Mock URL.createObjectURL to return undefined
    global.URL.createObjectURL = jest.fn(() => undefined as any);
    
    render(<MessageInput {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      const progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveAttribute('src', '/placeholder.svg?height=96&width=96&query=attachment-preview');
    });
  });

  it('applies correct styling to progressive images', async () => {
    const mockFile = new File(['image content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
    
    render(<MessageInput {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      const progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveClass('rounded-lg', 'object-cover');
    });
  });

  it('applies correct sizes attribute to progressive images', async () => {
    const mockFile = new File(['image content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
    
    render(<MessageInput {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      const progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveAttribute('sizes', '(max-width: 640px) 50vw, 200px');
    });
  });

  it('applies fill attribute to progressive images', async () => {
    const mockFile = new File(['image content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
    
    render(<MessageInput {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      const progressiveImage = screen.getByTestId('progressive-image');
      expect(progressiveImage).toHaveAttribute('fill', 'true');
    });
  });

  it('handles multiple image attachments with progressive loading', async () => {
    const mockFiles = [
      new File(['image1 content'], 'test-image1.jpg', { type: 'image/jpeg' }),
      new File(['image2 content'], 'test-image2.png', { type: 'image/png' }),
    ];
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
    
    render(<MessageInput {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: mockFiles,
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      const progressiveImages = screen.getAllByTestId('progressive-image');
      expect(progressiveImages).toHaveLength(2);
      
      expect(progressiveImages[0]).toHaveAttribute('alt', 'test-image1.jpg');
      expect(progressiveImages[1]).toHaveAttribute('alt', 'test-image2.png');
    });
  });

  it('does not render progressive images for non-image files', async () => {
    const mockFile = new File(['document content'], 'test-document.pdf', {
      type: 'application/pdf',
    });
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
    
    render(<MessageInput {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.queryByTestId('progressive-image')).not.toBeInTheDocument();
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });
  });

  it('handles mixed file types correctly', async () => {
    const mockFiles = [
      new File(['image content'], 'test-image.jpg', { type: 'image/jpeg' }),
      new File(['document content'], 'test-document.pdf', { type: 'application/pdf' }),
    ];
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
    
    render(<MessageInput {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: mockFiles,
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      // Should only render progressive image for the image file
      const progressiveImages = screen.getAllByTestId('progressive-image');
      expect(progressiveImages).toHaveLength(1);
      
      // Should also show the PDF file name
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });
  });

  it('removes progressive images when attachments are removed', async () => {
    const mockFile = new File(['image content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
    
    render(<MessageInput {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByTestId('progressive-image')).toBeInTheDocument();
    });
    
    // Remove the attachment
    const removeButton = screen.getByLabelText('Remove test-image.jpg');
    fireEvent.click(removeButton);
    
    await waitFor(() => {
      expect(screen.queryByTestId('progressive-image')).not.toBeInTheDocument();
    });
  });

  it('maintains input functionality with progressive images', async () => {
    const mockFile = new File(['image content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
    
    render(<MessageInput {...defaultProps} />);
    
    // Add image attachment
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(screen.getByTestId('progressive-image')).toBeInTheDocument();
    });
    
    // Type in the input
    const textInput = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(textInput, { target: { value: 'Check out this image!' } });
    
    expect(textInput).toHaveValue('Check out this image!');
    
    // Send button should be enabled
    const sendButton = screen.getByLabelText('Send message');
    expect(sendButton).not.toBeDisabled();
  });

  it('handles different image file types', async () => {
    const mockFiles = [
      new File(['image content'], 'test.jpg', { type: 'image/jpeg' }),
      new File(['image content'], 'test.png', { type: 'image/png' }),
      new File(['image content'], 'test.gif', { type: 'image/gif' }),
      new File(['image content'], 'test.webp', { type: 'image/webp' }),
    ];
    
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-object-url');
    
    render(<MessageInput {...defaultProps} />);
    
    const fileInput = screen.getByLabelText('Attach files');
    Object.defineProperty(fileInput, 'files', {
      value: mockFiles,
      writable: false,
    });
    
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      const progressiveImages = screen.getAllByTestId('progressive-image');
      expect(progressiveImages).toHaveLength(4);
      
      expect(progressiveImages[0]).toHaveAttribute('alt', 'test.jpg');
      expect(progressiveImages[1]).toHaveAttribute('alt', 'test.png');
      expect(progressiveImages[2]).toHaveAttribute('alt', 'test.gif');
      expect(progressiveImages[3]).toHaveAttribute('alt', 'test.webp');
    });
  });
});

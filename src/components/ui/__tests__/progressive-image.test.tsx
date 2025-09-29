import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressiveImage from '../progressive-image';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        {...props}
        data-testid="next-image"
      />
    );
  };
});

describe('ProgressiveImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
    width: 300,
    height: 200,
  };

  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  it('renders with blur placeholder initially', () => {
    render(<ProgressiveImage {...defaultProps} />);
    
    // Should show blur placeholder
    const blurImage = screen.getByAltText('');
    expect(blurImage).toBeInTheDocument();
    expect(blurImage).toHaveClass('filter', 'blur-sm', 'scale-110');
  });

  it('shows loading spinner when image is not loaded', () => {
    render(<ProgressiveImage {...defaultProps} />);
    
    const loadingSpinner = screen.getByRole('status', { hidden: true });
    expect(loadingSpinner).toBeInTheDocument();
    expect(loadingSpinner).toHaveClass('animate-spin');
  });

  it('transitions to main image when loaded', async () => {
    render(<ProgressiveImage {...defaultProps} />);
    
    const mainImage = screen.getByAltText('Test image');
    expect(mainImage).toHaveClass('opacity-0');
    
    // Simulate image load
    fireEvent.load(mainImage);
    
    await waitFor(() => {
      expect(mainImage).toHaveClass('opacity-100');
    });
  });

  it('hides blur placeholder when main image loads', async () => {
    render(<ProgressiveImage {...defaultProps} />);
    
    const blurImage = screen.getByAltText('');
    const mainImage = screen.getByAltText('Test image');
    
    // Initially blur is visible, main image is hidden
    expect(blurImage).toHaveClass('opacity-100');
    expect(mainImage).toHaveClass('opacity-0');
    
    // Simulate image load
    fireEvent.load(mainImage);
    
    await waitFor(() => {
      expect(blurImage).toHaveClass('opacity-0');
      expect(mainImage).toHaveClass('opacity-100');
    });
  });

  it('shows error state when image fails to load', async () => {
    render(<ProgressiveImage {...defaultProps} />);
    
    const mainImage = screen.getByAltText('Test image');
    
    // Simulate image error
    fireEvent.error(mainImage);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });

  it('calls onLoad callback when image loads', async () => {
    const onLoadMock = jest.fn();
    render(<ProgressiveImage {...defaultProps} onLoad={onLoadMock} />);
    
    const mainImage = screen.getByAltText('Test image');
    fireEvent.load(mainImage);
    
    await waitFor(() => {
      expect(onLoadMock).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onError callback when image fails to load', async () => {
    const onErrorMock = jest.fn();
    render(<ProgressiveImage {...defaultProps} onError={onErrorMock} />);
    
    const mainImage = screen.getByAltText('Test image');
    fireEvent.error(mainImage);
    
    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledTimes(1);
    });
  });

  it('uses custom blur data URL when provided', () => {
    const customBlurDataURL = 'data:image/jpeg;base64,custom-blur-data';
    render(<ProgressiveImage {...defaultProps} blurDataURL={customBlurDataURL} />);
    
    const blurImage = screen.getByAltText('');
    expect(blurImage).toHaveAttribute('src', customBlurDataURL);
  });

  it('uses default blur data URL when not provided', () => {
    render(<ProgressiveImage {...defaultProps} />);
    
    const blurImage = screen.getByAltText('');
    expect(blurImage).toHaveAttribute('src', expect.stringContaining('data:image/jpeg;base64,'));
  });

  it('applies custom className', () => {
    render(<ProgressiveImage {...defaultProps} className="custom-class" />);
    
    const container = screen.getByTestId('next-image').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('handles fill prop correctly', () => {
    render(<ProgressiveImage {...defaultProps} fill />);
    
    const mainImage = screen.getByAltText('Test image');
    expect(mainImage).toHaveAttribute('fill', 'true');
  });

  it('handles priority prop correctly', () => {
    render(<ProgressiveImage {...defaultProps} priority />);
    
    const mainImage = screen.getByAltText('Test image');
    expect(mainImage).toHaveAttribute('priority', 'true');
  });

  it('handles sizes prop correctly', () => {
    const sizes = '(max-width: 640px) 50vw, 300px';
    render(<ProgressiveImage {...defaultProps} sizes={sizes} />);
    
    const mainImage = screen.getByAltText('Test image');
    expect(mainImage).toHaveAttribute('sizes', sizes);
  });

  it('handles quality prop correctly', () => {
    render(<ProgressiveImage {...defaultProps} quality={90} />);
    
    const mainImage = screen.getByAltText('Test image');
    expect(mainImage).toHaveAttribute('quality', '90');
  });

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<ProgressiveImage {...defaultProps} style={customStyle} />);
    
    const container = screen.getByTestId('next-image').closest('div');
    expect(container).toHaveStyle('background-color: red');
  });

  it('handles placeholder prop', () => {
    const customPlaceholder = 'https://example.com/placeholder.jpg';
    render(<ProgressiveImage {...defaultProps} placeholder={customPlaceholder} />);
    
    const mainImage = screen.getByAltText('Test image');
    expect(mainImage).toHaveAttribute('src', customPlaceholder);
  });
});

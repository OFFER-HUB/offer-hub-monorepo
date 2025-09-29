import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';

// Mock ProgressiveImage component
jest.mock('../progressive-image', () => {
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

describe('Avatar with Progressive Loading', () => {
  const defaultProps = {
    src: 'https://example.com/avatar.jpg',
    alt: 'User avatar',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders avatar with progressive loading by default', () => {
    render(
      <Avatar>
        <AvatarImage {...defaultProps} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toBeInTheDocument();
    expect(progressiveImage).toHaveAttribute('src', defaultProps.src);
    expect(progressiveImage).toHaveAttribute('alt', defaultProps.alt);
  });

  it('uses ProgressiveImage when progressive prop is true', () => {
    render(
      <Avatar>
        <AvatarImage {...defaultProps} progressive={true} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toBeInTheDocument();
  });

  it('uses regular AvatarImage when progressive prop is false', () => {
    render(
      <Avatar>
        <AvatarImage {...defaultProps} progressive={false} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    const regularImage = screen.getByRole('img');
    expect(regularImage).toBeInTheDocument();
    expect(regularImage).not.toHaveAttribute('data-testid', 'progressive-image');
  });

  it('passes blurDataURL to ProgressiveImage', () => {
    const blurDataURL = 'data:image/jpeg;base64,custom-blur';
    render(
      <Avatar>
        <AvatarImage {...defaultProps} blurDataURL={blurDataURL} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toHaveAttribute('blurDataURL', blurDataURL);
  });

  it('applies correct className to ProgressiveImage', () => {
    render(
      <Avatar>
        <AvatarImage {...defaultProps} className="custom-avatar-class" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toHaveClass('aspect-square', 'h-full', 'w-full', 'custom-avatar-class');
  });

  it('sets fill and sizes props correctly for ProgressiveImage', () => {
    render(
      <Avatar>
        <AvatarImage {...defaultProps} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toHaveAttribute('fill', 'true');
    expect(progressiveImage).toHaveAttribute('sizes', '40px');
  });

  it('shows fallback when image fails to load', async () => {
    render(
      <Avatar>
        <AvatarImage {...defaultProps} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    const progressiveImage = screen.getByTestId('progressive-image');
    fireEvent.error(progressiveImage);
    
    await waitFor(() => {
      const fallback = screen.getByText('U');
      expect(fallback).toBeInTheDocument();
    });
  });

  it('handles missing src gracefully', () => {
    render(
      <Avatar>
        <AvatarImage src="" alt="No image" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toHaveAttribute('src', '');
  });

  it('maintains backward compatibility with existing props', () => {
    const customProps = {
      src: 'https://example.com/avatar.jpg',
      alt: 'User avatar',
      className: 'custom-class',
      style: { width: '50px' },
    };
    
    render(
      <Avatar>
        <AvatarImage {...customProps} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    const progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toHaveAttribute('src', customProps.src);
    expect(progressiveImage).toHaveAttribute('alt', customProps.alt);
    expect(progressiveImage).toHaveClass('custom-class');
  });

  it('works with different avatar sizes', () => {
    const { rerender } = render(
      <Avatar className="h-8 w-8">
        <AvatarImage {...defaultProps} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    let progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toBeInTheDocument();
    
    // Test with larger avatar
    rerender(
      <Avatar className="h-16 w-16">
        <AvatarImage {...defaultProps} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    );
    
    progressiveImage = screen.getByTestId('progressive-image');
    expect(progressiveImage).toBeInTheDocument();
  });
});

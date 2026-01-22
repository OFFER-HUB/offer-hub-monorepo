import { validateAvatarUrl, AVATAR_IMAGE_EXTENSIONS } from '@/utils/validation';

describe('Avatar URL Validation', () => {
  describe('validateAvatarUrl', () => {
    it('should validate valid HTTPS URLs with allowed image extensions', () => {
      const validUrls = [
        'https://example.com/avatar.jpg',
        'https://example.com/avatar.jpeg',
        'https://example.com/avatar.png',
        'https://example.com/avatar.gif',
        'https://example.com/avatar.webp',
        'http://example.com/avatar.JPG', // case insensitive
        'https://example.com/path/to/avatar.png',
        'https://cdn.example.com/avatars/user123.jpeg',
      ];

      validUrls.forEach(url => {
        expect(validateAvatarUrl(url)).toBe(true);
      });
    });

    it('should validate valid HTTP URLs with allowed image extensions', () => {
      const validUrls = [
        'http://example.com/avatar.jpg',
        'http://example.com/avatar.png',
      ];

      validUrls.forEach(url => {
        expect(validateAvatarUrl(url)).toBe(true);
      });
    });

    it('should reject URLs with invalid formats', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com/avatar.jpg',
        'file:///path/to/avatar.jpg',
        'javascript:alert("xss")',
        '',
        '   ', // whitespace only
        null,
        undefined,
      ];

      invalidUrls.forEach(url => {
        expect(validateAvatarUrl(url as any)).toBe(false);
      });
    });

    it('should reject URLs with unsupported image extensions', () => {
      const invalidUrls = [
        'https://example.com/avatar.bmp',
        'https://example.com/avatar.svg',
        'https://example.com/avatar.tiff',
        'https://example.com/avatar.ico',
        'https://example.com/avatar.webp.exe', // executable extension
      ];

      invalidUrls.forEach(url => {
        expect(validateAvatarUrl(url)).toBe(false);
      });
    });

    it('should reject URLs without image extensions', () => {
      const invalidUrls = [
        'https://example.com/avatar',
        'https://example.com/avatar/',
        'https://example.com/avatar.html',
        'https://example.com/avatar.php',
        'https://example.com/avatar.json',
      ];

      invalidUrls.forEach(url => {
        expect(validateAvatarUrl(url)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      // URLs with query parameters
      expect(validateAvatarUrl('https://example.com/avatar.jpg?size=100')).toBe(true);

      // URLs with fragments
      expect(validateAvatarUrl('https://example.com/avatar.png#section')).toBe(true);

      // URLs with special characters
      expect(validateAvatarUrl('https://example.com/avatar-with-dashes.png')).toBe(true);
      expect(validateAvatarUrl('https://example.com/avatar_underscores.jpeg')).toBe(true);
    });
  });

  describe('AVATAR_IMAGE_EXTENSIONS', () => {
    it('should contain all allowed image extensions', () => {
      expect(AVATAR_IMAGE_EXTENSIONS).toEqual(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
    });

    it('should be readonly', () => {
      expect(() => {
        (AVATAR_IMAGE_EXTENSIONS as any).push('.svg');
      }).toThrow();
    });
  });
});
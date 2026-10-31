// Global type declarations for the mobile app

// @env module (Expo)
declare module '@env' {
  export const EXPO_PUBLIC_API_URL: string;
  export const EXPO_PUBLIC_APP_SCHEME: string;
  export const EXPO_PUBLIC_NEON_AUTH_BASE_URL: string;
}

/**
 * `Intl.Segmenter` is used for grapheme-accurate text animation. The mobile
 * tsconfig targets ES2020, whose lib does not include the Segmenter
 * declarations, so they are provided here instead of casting at each use site.
 */
declare namespace Intl {
  type SegmenterGranularity = 'grapheme' | 'word' | 'sentence';

  interface Segment {
    segment: string;
    index: number;
    input: string;
    isWordLike?: boolean;
  }

  interface Segments {
    [Symbol.iterator](): IterableIterator<Segment>;
    containing(index: number): Segment | undefined;
  }

  interface SegmenterOptions {
    granularity?: SegmenterGranularity;
    localeMatcher?: 'best fit' | 'lookup';
  }

  class Segmenter {
    constructor(locales?: string | string[], options?: SegmenterOptions);
    segment(input: string): Segments;
    readonly resolvedOptions: { locale: string; granularity: SegmenterGranularity };
  }
}

import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

// The raw JSON data is an object with a 'placeholderImages' key.
// We need to access this key to get the array of images.
export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

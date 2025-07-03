export interface OutfitItems {
  top?: string;
  bottom?: string;
  shoes?: string;
  accessory?: string;
  dress?: string;
}

export interface RawOutfit {
  outfitId?: string;
  _id?: string;
  image_url?: string;
  outfit_items?: OutfitItems;
  likedAt?: string;
  dateAdded?: string;
  activity?: string;
  weather?: string;
  formality?: string;
  prompt?: string;
  gender?: string;
}

export interface LikedOutfit {
  outfitId: string;
  image_url: string;
  outfit_items: Record<string, any>;
  likedAt: Date;
  activity: string;
  weather: string;
  formality: string;
  prompt?: string;
  gender?: string;
} 
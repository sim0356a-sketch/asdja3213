
export enum UserTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export interface ExtraCharacter {
  id: string;
  name: string;
  role: string;
  description: string;
  photo?: string;
}

export interface User {
  id: string;
  telegramId?: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  childName: string;
  childAvatar?: string;
  childPhotos: string[]; 
  extraCharacters: ExtraCharacter[]; 
  credits: number;
  tier: UserTier;
  createdAt: number;
}

export interface TalePage {
  text: string;
  imageUrl: string;
}

export interface Tale {
  id: string;
  title: string;
  pages: TalePage[];
  status: 'generating' | 'ready' | 'error';
  progress?: number; 
  currentStep?: string; 
  createdAt: number;
  childName?: string;
  heroPhoto?: string;
  hook?: string; 
}

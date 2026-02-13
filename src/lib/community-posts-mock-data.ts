export interface CommunityPost {
  id: string;
  title: string;
  date: string;
  status: 'Published' | 'Draft';
  content?: string;
  tags?: string;
}

export const previousPosts: CommunityPost[] = [];

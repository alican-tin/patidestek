export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isBanned: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  imageUrl?: string;
  provinceCode: string;
  provinceName: string;
  districtCode: string;
  districtName: string;
  neighbourhoodName: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    name: string;
  };
  category?: Category;
  tags: Tag[];
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface CommentReport {
  id: number;
  reason: 'SPAM' | 'ABUSE' | 'PERSONAL_INFO' | 'OTHER';
  details?: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
  comment?: {
    id: number;
    content: string;
    postId?: number;
    post?: {
      id: number;
    };
    user?: {
      id: number;
      name: string;
    };
  };
  reporter?: {
    id: number;
    name: string;
  };
}

export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  provinceCode: string;
}

export interface Neighbourhood {
  name: string;
  districtCode: string;
  provinceCode: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  posts: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

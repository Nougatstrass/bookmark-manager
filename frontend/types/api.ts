export type Tag = {
  id: number;
  name: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type Bookmark = {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  favorite: boolean;
  showOnStart: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type BookmarkWithTags = Bookmark & {
  tags: string[]; // The backend returns names array
};

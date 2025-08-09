import type { BookmarkWithTags, Bookmark } from '~/types/api';

export const useBookmarks = () => {
  const {
    public: { apiBase },
  } = useRuntimeConfig();

  const list = (opts?: any) =>
    useFetch<BookmarkWithTags[]>(`${apiBase}/bookmarks`, {
      server: true, // SSR okay (talks to http://localhost:3001)
      ...opts,
    });

  const getById = (id: number, opts?: any) =>
    useFetch<BookmarkWithTags>(`${apiBase}/bookmarks/${id}`, { ...opts });

  const create = (payload: Partial<Bookmark> & { tags?: string[] }) =>
    $fetch<BookmarkWithTags>(`${apiBase}/bookmarks`, { method: 'POST', body: payload });

  const update = (id: number, payload: Partial<Bookmark> & { tags?: string[] }) =>
    $fetch<BookmarkWithTags>(`${apiBase}/bookmarks/${id}`, { method: 'PUT', body: payload });

  const remove = (id: number) =>
    $fetch<{ message: string }>(`${apiBase}/bookmarks/${id}`, { method: 'DELETE' });

  return { list, getById, create, update, remove };
};

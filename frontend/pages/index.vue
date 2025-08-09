<template>
  <section class="p-6">
    <h1 class="mb-4 text-3xl font-bold">Start</h1>

    <div v-if="pending">Loading...</div>
    <div v-else-if="error" class="text-red-600">Failed to load</div>
    <div v-else>
      <p v-if="startBookmarks.length === 0" class="text-gray-500">No Start bookmarks yet</p>
      <ul v-else class="space-y-3">
        <li v-for="b in startBookmarks" :key="b.id" class="rounded border bg-white p-4 shadow-sm">
          <a :href="b.url" target="_blank" class="break-all text-blue-600 hover:underline">
            {{ b.title || b.url }}
          </a>
          <div class="mt-2 flex flex-wrap gap-2">
            <span v-for="t in b.tags" :key="t" class="rounded bg-gray-100 px-2 py-0.5 text-xs">
              #{{ t }}
            </span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BookmarkWithTags } from '@/types/api';
import { useBookmarks } from '@/composables/useBookmarks';

const { list } = useBookmarks();
const { data, pending, error } = await list();

const startBookmarks = computed<BookmarkWithTags[]>(() =>
  ((data.value ?? []) as BookmarkWithTags[]).filter((b) => b.showOnStart)
);
</script>

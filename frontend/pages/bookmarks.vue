
<template>
    
    <section class="p-6">

        <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold">Bookmarks</h1>
            <button 
                @click="refresh()" 
                class="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >Refresh</button>
        </div>

        <div v-if="pending" class="text-gray-500">Loading...</div>
        <div v-else-if="error" class="text-red-600">Failed to load bookmarks</div>

        <ul v-else class="space-y-3">

            <li v-for="b in bookmarks" :key="b.id" class="border rounded p-4 bg-white shadow-sm">

                <div class="flex items-start justify-between gap-4">
                    <div>
                        <a :href="b.url" target="_blank" class="text-blue-600 hover:underline break-all">
                            {{ b.title || b.url }}
                        </a>
                        <p v-if="b.description" class="text-sm text-gray-600 mt-1">{{ b.description }}</p>
                        <div class="mt-2 flex flex-wrap gap-2">
                            <span v-for="t in b.tags" :key="t" class="text-xs px-2 py-0.5 rounded bg-gray-100">
                                #{{ t }}
                            </span>
                        </div>
                    </div>
                    <div class="flex shrink-0 items-center gap-2">
                        <span v-if="b.favorite" title="Favorite" class="text-yellow-500">
                            ★
                        </span>
                        <span v-if="b.showOnStart" title="Show on Start" class="text-green-600 text-xs border rounded px-2 py-0.5">
                            Start
                        </span>
                    </div>
                </div>
                <p class="mt-2 text-xs text-gray-400">
                    Updated: {{ new Date(b.updatedAt).toLocaleDateString() }}
                </p>

            </li>

        </ul>

    </section>

</template>

<script setup lang="ts">

import type { BookmarkWithTags } from '@/types/api'
import { useBookmarks } from '@/composables/useBookmarks';

const { list } = useBookmarks()

// SSR fetch, automatically reactive
const { data, pending, error, refresh } = await list()

const bookmarks = computed<BookmarkWithTags[]>(() => data.value ?? [])

</script>

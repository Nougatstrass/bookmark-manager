
<template>

    <section class="p-6">

        <h1 class="text-3xl font-bold mb-4">Start</h1>

        <div v-if="pending">Loading...</div>
        <div v-else-if="error" class="text-red-600">Failed to load</div>
        <div v-else>
            <p v-if="startBookmarks.length === 0" class="text-gray-500">No Start bookmarks yet</p>
            <ul v-else class="space-y-3">
                <li v-for="b in startBookmarks" :key="b.id" class="border rounded p-4 bg-white shadow-sm">
                    <a :href="b.url" target="_blank" class="text-blue-600 hover:underline break-all">
                        {{ b.title || b.url }}
                    </a>
                    <div class="mt-2 flex flex-wrap gap-2">
                        <span v-for="t in b.tags" :key="t" class="text-xs px-2 py-0.5 rounded bg-gray-100">
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

    const { list } = useBookmarks()
    const { data, pending, error } = await list()

    const startBookmarks = computed<BookmarkWithTags[]>(
        () => (data.value ?? []).filter(b => b.showOnStart)
    )

</script>

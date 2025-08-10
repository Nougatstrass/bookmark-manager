<template>

  <section class="p-6 space-y-6">

    <div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Bookmarks</h1>
		<button @click="refresh()" 
			class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
		>
		Refresh
		</button>
    </div>

	<!-- Create form -->
	<BookmarkForm @created="handleCreated" />

    <div v-if="pending" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">Failed to load bookmarks</div>

	<!-- List -->
    <ul v-else class="space-y-3">

		<li v-for="b in bookmarks" :key="b.id" class="rounded border bg-white p-4 shadow-sm">

			<div class="flex items-start justify-between gap-4">
				<div>
					<a :href="b.url" target="_blank" class="break-all text-blue-600 hover:underline">
					{{ b.title || b.url }}
					</a>
					<p v-if="b.description" class="mt-1 text-sm text-gray-600">{{ b.description }}</p>
					<div class="mt-2 flex flex-wrap gap-2">
					<span v-for="t in b.tags" :key="t" class="rounded bg-gray-100 px-2 py-0.5 text-xs">
						#{{ t }}
					</span>
					</div>
				</div>
				<div class="flex shrink-0 items-center gap-2">
					<span v-if="b.favorite" title="Favorite" class="text-yellow-500"> ★ </span>
					<span
					v-if="b.showOnStart"
					title="Show on Start"
					class="rounded border px-2 py-0.5 text-xs text-green-600"
					>
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
	import { useBookmarks } from '@/composables/useBookmarks'
	import BookmarkForm from '@/components/BookmarkForm.vue'

	const { list } = useBookmarks()

	// SSR fetch, automatically reactive
	const { data, pending, error, refresh } = await list()

	const bookmarks = computed<BookmarkWithTags[]>(() => (data.value ?? []) as BookmarkWithTags[])

	const handleCreated = async () => {
		await refresh()		// Fetch latest list after creating a bookmark
	}

</script>

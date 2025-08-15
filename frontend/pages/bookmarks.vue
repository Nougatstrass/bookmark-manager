
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
						<span v-if="b.favorite" title="Favorite" class="text-yellow-500">★</span>
						<span
							v-if="b.showOnStart"
							title="Show on Start"
							class="rounded border px-2 py-0.5 text-xs text-green-600"
						>
						Start
						</span>

						<!-- Actions -->
						<button 
							@click="openEdit(b)" 
							title="Edit" 
							class="ml-3 rounded border px-2 py-1 text-sm hover:bg-gray-50">
							Edit
						</button>
						<button 
							@click="askDelete(b)" 
							title="Delete" 
							class="rounded border px-2 py-1 text-sm hover:bg-red-50 text-red-600 border-red-300">
							Delete
						</button>					

					</div>
				</div>

				<p class="mt-2 text-xs text-gray-400">
					Updated: {{ new Date(b.updatedAt).toLocaleDateString() }}
				</p>

			</li>

		</ul>

		<!-- Edit modal -->
		<BookmarkEditModal
			:open="editOpen"
			:bookmark="selected"
			@close="closeEdit"
			@saved="handleSaved" 
		/>

		<!-- Delete confirm modal -->
		<Modal :open="confirmOpen" @close="closeConfirm">

			<template #title>Delete bookmark</template>
			<p>
				Are you sure you want to delete 
				<strong>{{ toDelete?.title || toDelete?.url }}</strong>?
			</p>

			<template #footer>

				<div class="flex items-center justify-end gap-2">

					<button 
						@click="closeConfirm" 
						:disabled="deleting" 
						class="rounded boerder px-4 py-2 hover:bg-gray-100">
						Cancel
					</button>

					<button 
						@click="confirmDelete" 
						:disabled="deleting" 
						:aria-busy="deleting ? 'true' : 'false'" 
						aria-label="Confirm delete" 
						class="inline-flex items-center gap-2 rounded bg-red-600 text-white 
							px-4 py-2 hover:bg-red-700 disabled:opacity-50">
							<svg 
								v-if="deleting" 
								view-box="0 0 24 24" 
								fill="none" 
								aria-hidden="true" 
								class="h-4 w-4 animate-spin">
								<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" 
									class="opacity-25" />
								<path fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" 
									class="opacity-75" />
							</svg>
						{{ deleting ? 'Deleting...' : 'Delete' }}
					</button>

				</div>

			</template>

		</Modal>

	</section>

</template>

<script setup lang="ts">

	import type { BookmarkWithTags } from '@/types/api'
	import { useBookmarks } from '@/composables/useBookmarks'
	import BookmarkForm from '@/components/BookmarkForm.vue'
	import BookmarkEditModal from '@/components/BookmarkEditModal.vue'
	import Modal from '@/components/ui/Modal.vue'

	const { list, remove } = useBookmarks()

	// SSR fetch, automatically reactive
	const { data, pending, error, refresh } = await list()

	const bookmarks = computed<BookmarkWithTags[]>(() => (data.value ?? []) as BookmarkWithTags[])

	// Edit modal state
	const editOpen = ref(false)
	const selected = ref<BookmarkWithTags | null>(null)

	const openEdit = (b: BookmarkWithTags) => {
		selected.value = b
		editOpen.value = true
	}

	const closeEdit = () => {
		editOpen.value = false
		selected.value = null
	}

	const handleCreated = async () => {
		await refresh() // Fetch latest list after creating a bookmark
	}

	const handleSaved = async () => {
		await refresh()
	}

	// Delete confirm modal
	const confirmOpen = ref(false)
	const deleting = ref(false)
	const toDelete = ref<BookmarkWithTags | null>(null)

	const askDelete = (b: BookmarkWithTags) => {
		toDelete.value = b
		confirmOpen.value = true
	}

	const closeConfirm = () => {
		confirmOpen.value = false
		toDelete.value = null
	}

	const confirmDelete = async () => {
		if (!toDelete.value) return

		deleting.value = true

		try {
			await remove(toDelete.value.id)
			await refresh()
			closeConfirm()

		} catch(e) {
			// You could surface a toast here
			console.error(e)
		} finally {
			deleting.value = false
		}
	}

</script>

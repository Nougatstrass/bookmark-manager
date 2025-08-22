
<template>

	<section class="p-6 space-y-6 scroll-smooth">

		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">Bookmarks</h1>
			<button @click="refresh()" 
				class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
			>
			Refresh
			</button>
		</div>

		<!-- Create form -->
		<div id="new-bookmark">
			<BookmarkForm @created="handleCreated" />
		</div>
		
		<!-- Skeletons for initial load -->
		<div v-if="isInitialLoading" aria-live="polite" class="space-y-3">
			<BookmarkSkeleton v-for="i in 3" :key="i" />
		</div>

		<div v-else-if="error" class="text-red-600">Failed to load bookmarks</div>

		<!-- Empty state -->
		<EmptyState 
			v-else-if="showEmpty" 
			@action="scrollToNew" 
			title="No bookmarks yet" 
			description="Add your first bookmark to get started" 
			buttonLabel="Add a new bookmark" 
		/>

		<!-- Empty state or list -->
		<EmptyState 
			v-if="!pending && !error && items.length === 0" 
			@action="refresh" 
		/>

		<ul v-else class="space-y-3">

			<li v-for="b in items" :key="b.id" class="rounded border bg-white p-4 shadow-sm">

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
							:disabled="deleting && toDelete?.id === b.id" 
							class="rounded border px-2 py-1 text-sm hover:bg-red-50 text-red-600 border-red-300">
							Delete
						</button>					

					</div>
				</div>

				<p class="mt-2 text-xs text-gray-400">
					Updated: {{ new Date(b.updatedAt).toLocaleString() }}
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
						class="rounded border px-4 py-2 hover:bg-gray-100">
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
								viewBox="0 0 24 24" 
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
	
	import { computed, ref, watchEffect } from 'vue'
	import type { BookmarkWithTags } from '@/types/api'
	import { useBookmarks } from '@/composables/useBookmarks'
	import BookmarkForm from '@/components/BookmarkForm.vue'
	import BookmarkEditModal from '@/components/BookmarkEditModal.vue'
	import Modal from '@/components/ui/Modal.vue'
	import BookmarkSkeleton from '@/components/ui/BookmarkSkeleton.vue'
	import { useToast } from '@/composables/useToast'
	import EmptyState from '@/components/ui/EmptyState.vue'
	import { useRoute } from 'vue-router'

	const route = useRoute()
	
	const { list, remove } = useBookmarks()

	const toast = useToast()

	// COMMENTED OUT FOR TESTING PURPOSE - TURN ON AT PRODUCTION
	// SSR fetch, automatically reactive
	// const { data, pending, error, refresh } = await list()

	// ONLY USED FOR TESTING PURPOSE - COMMENT OUT OR DELETE AT PRODUCTION
	const { data, pending, error, refresh } = await list({
		query: { empty: route.query.empty }
	})

	const bookmarks = computed<BookmarkWithTags[]>(() => (data.value ?? []) as BookmarkWithTags[])

	// Local working list the UI renders
	const items = ref<BookmarkWithTags[]>([])

	// Keep items in sync with server data on initial load/refresh
	watchEffect(() => {
		items.value = (data.value ?? []) as BookmarkWithTags[]
	})

	// Show skeletons only when loading AND there's no data yet
	const isInitialLoading = computed(() => {
		const hasData = Array.isArray(data.value) && data.value.length > 0
		return pending.value && !hasData 
	})

	const showEmpty = computed(() => {
		const hasData = Array.isArray(items.value) && items.value.length > 0
		return !pending.value && !error.value && !hasData
	})

	// Smooth scroll to the create form
	const scrollToNew = () => {
		const el = document.getElementById('new-bookmark')

		if (!el) return

		// Smooth scroll to the form container
		el?.scrollIntoView({ behavior: 'smooth', block: 'start' })

		// Brief highlight so users see where to look
		el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
		setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'), 700)

		// Try to focus the first input for quick typing
		document.getElementById('create-url')?.focus()
	}

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

	const handleSaved = async () => {
		await refresh()
	}

	// Delete confirm modal state
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

	// Optimistic delete
	const confirmDelete = async () => {
		if (!toDelete.value) return

		deleting.value = true

		// 1. Snapshot current list to allow rollback
		const previous = items.value.slice()

		// 2. Optimistically remove from UI
		const id = toDelete.value.id
		items.value = items.value.filter(b => b.id !== id)

		try {
			// 3. Call API in the background
			await remove(id)

			// 4. Optionally refresh to sync with server (keeps tags, dates 100 % accurate)
			await refresh()

			toast.success('Bookmark deleted')

			// 5. Close the confirm dialog
			closeConfirm()

		} catch(e: any) {
			// Roll back on failure
			items.value = previous
			toast.error('Could not delete bookmark. Please try again.')
			console.error('Delete failed:', e?.data.error || e?.message)
			
		} finally {
			deleting.value = false
		}
	}

	const handleCreated = async () => {
		await refresh() // Fetch latest list after creating a bookmark
	}

</script>

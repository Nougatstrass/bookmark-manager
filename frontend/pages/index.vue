
<template>

	<section class="p-6 space-y-6 scroll-smooth">

		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">Start</h1>
			<button 
				@click="refresh()" 
				class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
			>
				Refresh
			</button>
		</div>

		<!-- Optional: form on start -->
		<div id="new-bookmark">
			<BookmarkForm @created="() => refresh()" />
		</div>

		<!-- Initial skeletons -->
		<div v-if="isInitialLoading" aria-live="polite">
			<BookmarkSkeleton v-for="i in 3" :key="i" />
		</div>

		<!-- Error state -->
		<div v-else-if="error" class="text-red-600">Failed to load bookmarks</div>

		<!-- Empty state (no showOnStart bookmarks) -->
		<EmptyState 
			v-else-if="startItems.length === 0" 
			title="Nothing on Start yet" 
			description="Mark some bookmarks with 'Show on Start' to see them here" 
			@action="scrollToNew" 
			buttonLabel="Add a bookmark" 
		/>

		<!-- List -->
		<ul 
			v-else 
			:aria-busy="isRefreshing ? 'true' : 'false'" 
			class="space-y-3" 
			:class="isRefreshing ? 'motion-safe:animate-pulse' : ''"
		>	
			<li 
				v-for="b in startItems" 
				:key="b.id" 
				class="rounded border bg-white p-4 shadow-sm"
			>
				<div class="flex items-start justify-between gap-4">

					<div>

						<a :href="b.url" 
							target="_blank" 
							class="break-all text-blue-600  hover:underline"
						>
							{{ b.title || b.url }}
						</a>

						<p v-if="b.description" class="mt-1 text-sm text-gray-600">
							{{ b.description }}
						</p>

						<div class="mt-2 flex flex-wrap gap-2">
							<span 
								v-for="t in b.tags" 
								:key="t" 
								class="rounded bg-gray-100 px-2 py-0.5 text-xs"
							>
								#{{ t }}
							</span>
						</div>

					</div>

					<div class="flex shrink-0 items-center gap-2">
						<span 
							v-if="b.favorite" 
							title="Favorite" 
							class="text-yellow-500">★</span>

						<!-- Start marker -->	
						<!-- <span 
							title="Shown on Start" 
							class="rounded border px-2 py-0.5 text-xs text-green-600"
						>
							Start
						</span> -->

						<NuxtLink 
							to="/bookmarks" 
							title="Edit on Bookmarks page" 
							class="ml-3 rounded border px-2 py-1 text-sm hover:bg-gray-50">
							Edit
						</NuxtLink>

						<button 
							v-if="b.showOnStart" 
							@click="removeFromStart(b)" 
							class="rounded border px-2 py-1 text-sm text-red-600 hover:bg-red-50">
							Remove from Start
						</button>
						
					</div>
				</div>

				<p class="mt-2 text-xs text-gray-400">
					Updated {{ new Date(b.updatedAt).toLocaleString() }}
				</p>

			</li>
		</ul>

	</section>

</template>

<script setup lang="ts">

	import { ref, watchEffect, computed } from 'vue'
	import type { BookmarkWithTags } from '@/types/api'
	import { useBookmarks } from '@/composables/useBookmarks'
	import BookmarkSkeleton from '@/components/ui/BookmarkSkeleton.vue'
	import EmptyState from '@/components/ui/EmptyState.vue'
	import { useToast } from '@/composables/useToast'

	// Fetch all bookmarks (or your existing call here)
	const { update, list } = useBookmarks()
	const { data, pending, error, refresh } = await list()

	// Local items mirror (same pattern as /bookmarks)
	const items = ref<BookmarkWithTags[]>([])

	watchEffect(() => {
		items.value = (data.value ?? []) as BookmarkWithTags[]
	})

	// Only show those marked for Start
	const startItems = computed(() => 
		(items.value ?? []).filter(b => b.showOnStart)
	)

	// Niceties
	const hasData = computed(() => (startItems.value.length ?? 0) > 0)
	const isInitialLoading = computed(() => pending.value && !hasData.value)
	const isRefreshing = computed(() => pending.value && hasData)

	// Optional: scroll helper to create form if you keep one on Start
	const scrollToNew = () => {
		const el = document.getElementById('new-bookmark')

		if (!el) return

		el.scrollIntoView({ behavior: 'smooth', block: 'start' })
		el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
		setTimeout(() => el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2'), 700)

		document.getElementById('creat-url')?.focus()
	}

	async function removeFromStart(b: BookmarkWithTags) {

		const toast = useToast()
		
		try {
			await update(b.id, { showOnStart: false })
			await refresh()
			toast.success(`Removed "${b.title || b.url}" from Start`)
			
		} catch(e) {
			console.error('Remove from Start failed', e)
			toast.error('Failed to update bookmark')
		}
	}

</script>

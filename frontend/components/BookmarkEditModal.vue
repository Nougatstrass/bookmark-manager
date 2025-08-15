
<template>

    <Modal :open="open" @close="onClose">

            <template #title>Edit bookmark</template>

            <form @submit.prevent="onSubmit" class="space-y-4">

                <div>
                    <label for="url" class="block text-sm font-medium mb-1">URL *</label>
                    <input 
                        id="url" 
                        ref="urlInputEl" 
                        v-model.trim="form.url" 
                        type="url" 
                        required 
                        class="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
                    />
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <input 
                            id="title" 
                            v-model.trim="form.title" 
                            type="text" 
                            class="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
                        />
                    </div>
                </div>

                <div>
                    <label for="tags">Tags</label>
                    <input 
                        id="tags" 
                        v-model="tagsInput"
                        type="text" 
                        placeholder="Comma-separated"
                        class="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        Leave empty to keep current tags; otherwise we'll replace them.
                    </p>
                </div>

                <div class="flex items-center gap-6">
                    <label class="inline-flex items-center gap-2">
                        <input type="checkbox" v-model="form.favorite" class="rounded" />
                        <span>Favorite</span>
                    </label>
                    <label class="inline-flex items-center gap-2">
                        <input type="checkbox" v-model="form.showOnStart" class="rounded"/>
                        <span>Show on Start</span>
                    </label>
                </div>

                <p v-if="errorMsg" class="text-red-600 text-sm">{{ errorMsg }}</p>

            </form>

            <template #footer>

                <div class="flex items-center justify-end gap-2">

                    <button 
                        @click="onClose" 
                        :disabled="saving" 
                        class="rounded border px-4 py-2 hover:bg-gray-100">
                        Cancel
                    </button>

                    <!-- <button 
                        @click="onSubmit" 
                        :disabled="saving" 
                        class="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 
                        disabled:opacity-50">
                        {{ saving ? 'Saving...' : 'Save changes' }}
                    </button> -->

                    <button
                        @click="onSubmit" 
                        :disabled="saving"
                        :aria-busy="saving ? 'true' : 'false'"
                        class="inline-flex items-center gap-2 rounded bg-blue-600 text-white 
                            px-4 py-2 hover:bg-blue-700 disabled:opacity-50">
                        <svg 
                            v-if="saving" 
                            view-box="0 0 24 24" 
                            fill="none" 
                            aria-hidden="true" 
                            class="h-4 w-4 animate-spin"
                        >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z" class="opacity-75" />
                        </svg>
                        {{ saving ? 'Saving...' : 'Save changes' }}
                    </button>

                </div>

            </template>

    </Modal>

</template>

<script setup lang="ts">

    import { reactive, ref, watch, nextTick } from 'vue'
    import Modal from '@/components/ui/Modal.vue'
    import type { BookmarkWithTags } from '@/types/api'
    import { useBookmarks } from '@/composables/useBookmarks'

    const props = defineProps<{
        open: boolean
        bookmark: BookmarkWithTags | null
    }>()

    const emit = defineEmits<{
        (e: 'close'): void
        (e: 'saved'): void
    }>()

    const { update } = useBookmarks()

    const form = reactive({
        url: '',
        title: '' as string | null,
        description: '' as string | null,
        favorite: false,
        showOnStart: false
    })

    const tagsInput = ref('')   // Comma-separated input
    const saving = ref(false)
    const errorMsg = ref<string | null>(null)

    // Ref for the first input
    const urlInputEl = ref<HTMLInputElement | null>(null)

    // When bookmark changes, fill form
    watch(
        () => props.bookmark,
        (b) => {
            if (!b) return
            form.url = b.url
            form.title = b.title
            form.description = b.description
            form.favorite = b.favorite
            form.showOnStart = b.showOnStart
            tagsInput.value = b.tags?.join(', ') ?? ''
            errorMsg.value = null
        },
        { immediate: true }
    )

    // When modal opens, focus the URL input (after DOM updates)
    watch(
        () => props.open,
        async (isOpen) => {
            if (isOpen) {
                await nextTick()
                urlInputEl.value?.focus()
                urlInputEl.value?.select()  // Handy: select existing URL
            }
        }
    )

    const onClose = () => emit('close')

    const parseTags = (input: string) =>
        Array.from(new Set(input.split(',').map(t => t.trim()).filter(Boolean)))

    const onSubmit = async () => {
        if (!props.bookmark) return
        errorMsg.value = null
        saving.value = true

        try {
            // If tagsInput is empty, send undefined so backend keeps tags unchange
            const tags = tagsInput.value.trim() === '' ? undefined: parseTags(tagsInput.value)

            await update(props.bookmark.id, {
                url: form.url,
                title: form.title ?? undefined,
                description: form.description ?? undefined,
                favorite: form.favorite,
                showOnStart: form.showOnStart,
                tags
            })

            emit('saved')   // Parent will refresh
            emit('close')

        } catch(e: any) {
            const msg = e?.data?.error || e?.message || ''

            if (e?.status === 409 || /already exists/i.test(msg)) {
                errorMsg.value = 'A bookmark with this URL already exists'
            } else {
                errorMsg.value = msg || 'Failed to save changes'
            }
        } finally {
            saving.value = false
        }
    }

</script>

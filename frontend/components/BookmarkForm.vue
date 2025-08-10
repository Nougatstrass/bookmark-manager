
<template>

    <form @submit.prevent="onSubmit" class="space-y-4 bg-white rounded-lg shadow p-4">

        <h2 class="text-xl font-semibold">Add a new bookmark</h2>

        <div class="grid md:grid-cols-2 gap-4">

            <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-1" for="url">URL *</label>
                <input 
                    id="url" 
                    v-model.trim="form.url" 
                    type="url" 
                    required 
                    placeholder="https://example.com" 
                    class="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
                />
            </div>

            <div>
                <label for="title" class="block text-sm font-medium mb-1">Title</label>
                <input 
                    id="title" 
                    v-model.trim="form.title" 
                    type="text" 
                    placeholder="Title (optional)" 
                    class="w-full rounded border px-3 py-2 focus:outline-none focus:ring" 
                />
            </div>

            <div>
                <label for="description" class="block text-sm font-medium mb-1">Description</label>
                <input 
                    id="description" 
                    v-model.trim="form.description" 
                    type="text" 
                    placeholder="Description (optional)" 
                    class="w-full rounded border px-3 py-2 focus:outline-none focus:ring" 
                />
            </div>

            <div class="md:col-span-2">
                <label for="tags" class="block text-sm font-medium mb-1">Tags</label>
                <input 
                    id="tags" 
                    v-model="form.tagsInput" 
                    type="text" 
                    placeholder="Comma-separated, e.g. news, reading, dev" 
                    class="w-full rounded border px-3 py-2 focus:outline-none focus:ring" 
                />
                <p>Missing tags will be created automatically</p>
            </div>

        </div>

        <div class="flex items-center gap-6">
            <label class="inline-flex items-center gap-2">
                <input type="checkbox" v-model="form.favorite" class="rounded" />
                <span>Favorite</span>
            </label>
            <label class="inline-flex items-center gap-2">
                <input type="checkbox" v-model="form.showOnStart" class="rounded" />
                <span>Show on Start</span>
            </label>
        </div>

        <div class="flex items-center gap-3">
            <button 
            type="submit" 
            :disabled="submitting" 
            class="rounded bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
            >
                {{ submitting ? 'Adding...' : 'Add bookmark' }}
            </button>
            <button 
                type="button" 
                :disabled="submitting" 
                @click="reset"
                class="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
            >
                Reset
            </button>
        </div>

        <p v-if="errorMsg" class="text-red-600 text-sm">{{ errorMsg }}</p>
        <p v-if="successMsg" class="text-green-700 text-sm">{{ successMsg }}</p>

    </form>

</template>

<script setup lang="ts">

    import { reactive, ref } from 'vue'
    import { useBookmarks } from '@/composables/useBookmarks'
    import type { BookmarkWithTags } from '@/types/api'

    const emit = defineEmits<{ (e: 'created', bookmark: BookmarkWithTags): void }>()
    const { create } = useBookmarks()

    const form = reactive({
        url: '',
        title: '',
        description: '',
        tagsInput: '',
        favorite: false,
        showOnStart: false
    })

    const submitting = ref(false)
    const errorMsg = ref<string | null>(null)
    const successMsg = ref<string | null>(null)

    const parseTags = (input: string) =>
        Array.from(
            new Set(
                input
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
            )
        )

    const reset = () => {
        form.url = ''
        form.title = ''
        form.description = ''
        form.tagsInput = ''
        form.favorite = false
        form.showOnStart = false
        errorMsg.value = null
        successMsg.value = null
    }

    const onSubmit = async () => {
        errorMsg.value = null
        successMsg.value = null

        if (!form.url) {
            errorMsg.value = 'URL is required'
            return
        }

        submitting.value = true

        try {
            const payload = {
                url: form.url,
                title: form.title || undefined,     // Optional
                description: form.description || undefined,     // Option
                favorite: form.favorite,
                showOnStart: form.showOnStart,
                tags: parseTags(form.tagsInput)
            }

            const created = await create(payload)
            successMsg.value = 'Bookmark created!'
            emit('created', created)
            // Optional: reset after success
            reset()

        } catch(e: any) {
            // Backend may send { error: "...", details?: ... }
            errorMsg.value = 
                e?.data?.error || e?.message || 'Failed to create bookmark. Please try again.'
        } finally {
            submitting.value = false
        }
    }

</script>

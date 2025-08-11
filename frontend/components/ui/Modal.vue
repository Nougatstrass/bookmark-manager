
<template>

    <div 
        v-if="open" 
        role="dialog" 
        aria-modal="true" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="$emit('close')" />

        <!-- Panel -->
        <div class="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-xl ring-1 ring-black/5">

            <header class="flex items-center justify-between px-4 py-3 border-b">

                <h3 class="text-lg font-semibold">
                    <slot name="title" />
                </h3>

                <button
                    @click="$emit('close')" 
                    aria-label="Close" 
                    class="rounded p-1 hover:bg-gray-100"
                >
                    ✕
                </button>

            </header>

            <div class="p-4">
                <slot />
            </div>

            <footer v-if="$slots.footer" class="px-4 py-3 border-t bg-gray-50">
                <slot name="footer" />
            </footer>

        </div>

    </div>

</template>

<script setup lang="ts">

    defineProps<{ open: boolean }>()
    defineEmits<{ (e: 'close'): void }>()

</script>

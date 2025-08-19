
<template>

<!-- Screen reader live region -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
    <span v-for="t in toasts" :key="'sr-' + t.id">{{ t.message }}</span>
</div>

<!-- Visual toasts (bottom-right) -->
 <div class="fixed inset-x-0 bottom-0 z-[60] flex justify-end px-4 pb-6 pointer-events-none">

    <div class="w-full max-w-sm space-y-2 pointer-events-auto">

        <TransitionGroup name="toast" tag="div">

            <div
                v-for="t in toasts" 
                :key="t.id" 
                role="status"
                class="rounded-lg shadow ring-1 ring-black/5 p-3 flex items-start gap-3 
                text-sm" 
                :class="toastBg(t.type)"
            >

                <span class="mt-0.5">
                    <!-- Simple icons -->
                    <span v-if="t.type === 'success'">✅</span>
                    <span v-else-if="t.type === 'error'">⚠️</span>
                    <span v-else>ℹ️</span>
                </span>

                <p class="flex-1">{{ t.message }}</p>

                <button
                    @click="remove(t.id)" 
                    aria-label="Dismiss" 
                    class="rounded px-2 py-1 text-sx hover:bg-black/10"
                >
                    ✕
                </button>

            </div>

        </TransitionGroup>

    </div>

 </div>

</template>

<script setup lang="ts">

    import { useToast } from '@/composables/useToast'

    const { toasts, remove } = useToast()

    const toastBg = (type: 'success' | 'error' | 'info') => {
        switch (type) {
            case 'success':
                return 'bg-green-50 text-green-800'
            case 'error':
                return 'bg-red-50 text-red-800'
            default:
                return 'bg-slate-50 text-slate-800'
        }
    }

</script>

<style scoped>

    .toast-enter-from, .toast-leave-to {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
    }
    .toast-enter-active, .toast-leave-active {
        transition: all 160ms ease;
    }

</style>

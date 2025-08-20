
<template>

    <div class="rounded-lg border bg-white p-8 text-center shadow-sm">

        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <!-- Simple icon -->
             <span class="text-xl">🔖</span>
        </div>

        <h2 class="text-xl font-semibold">{{ title }}</h2>

        <p class="mt-1 text-sm text-gray-600">
            {{ description }}
        </p>

        <button
            @click="$emit('action')" 
            class="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
            {{ buttonLabel }}
        </button>

    </div>

</template>

<script setup lang="ts">

    defineProps<{
        title: string
        description: string
        buttonLabel: string
    }>()

    defineEmits<{ (e:'action'): void }>()

</script>

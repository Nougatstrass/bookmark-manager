
<template>

    <div 
        role="status" 
        aria-label="Loading bookmark" 
        class="rounded border bg-white p-4 shadow-sm motion-safe:animate-pulse"
    >
        <div class="flex items-start justify-between gap-4">

            <div class="flex-1">

                <!-- Title line -->
                <div class="h-4 w-1/3 rounded bg-gray-200"></div>

                <!-- Description line -->
                <div class="mt-2 h-3 w-2/3 rounded bg-gray-200"></div>

                <!-- Tag chips -->
                <div class="mt-3 flex flex-wrap gap-2">
                    <div class="h-5 w-16 rounded bg-gray-200"></div>
                    <div class="h-5 w-12 rounded bg-gray-200"></div>
                    <div class="h-5 w-20 rounded bg-gray-200"></div>
                </div>

            </div>

            <!-- Actions area -->
            <div class="shrink-0 flex items-center gap-2">
                <div class="h-4 w-4 rounded-full bg-gray-200"></div>
                <div class="h-5 w-10 rounded bg-gray-200"></div>
                <div class="h-5 w-14 rounded bg-gray-200"></div>
            </div>
            
        </div>

        <!-- Updated at line -->
        <div class="mt-2 h-3 w-40 rounded bg-gray-200"></div>

    </div>

</template>

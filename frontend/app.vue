
<template>

    <div>

        <!-- Navigation -->
        <nav class="bg-gray-800 text-white p-4 shadow-md">

            <div class="flex justify-between items-center max-w-6xl mx-auto">

                <!-- Logo / App name -->
                <div class="text-lg font-bold tracking-wide">📑 Bookmark manager</div>

                <!-- Hamburger button (mobile) -->
                <button 
                    @click="isMenuOpen = !isMenuOpen" 
                    class="md:hidden focus:outline-none transition-transform duration-200 hover:scale-110" 
                    aria-label="Toggle menu"
                    >

                    <!-- Icon: three bars -->
                    <svg 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="w-7 h-7"
                    >
                        <path 
                            stroke-linecap="round" 
                            stroke-linejoin="round" 
                            stroke-width="2" 
                            d="M4 6h16M4 12h16m-7 6h7">
                        </path>
                
                    </svg>
                
                </button>

                <!-- Menu (desktop) -->
                <ul class="hidden md:flex gap-6">
                    <li v-for="link in links" :key="link.to">
                        <NuxtLink 
                            :to="link.to" 
                            class="transition-colors duration-200 hover:text-yellow-400" 
                            :class="{ 'text-yellow-400 font-semibold': route.path === link.to }"
                        >
                            {{ link.label }}
                        </NuxtLink>
                    </li>
                </ul>

            </div>

            <!-- Menu (mobile) -->
            <div v-if="isMenuOpen" class="md:hidden mt-4 bg-gray-800 rounded-md shadow-lg">
                
                <ul class="flex flex-col gap-3 p-4">
                    <li v-for="link in links" :key="link.to">
                        <NuxtLink 
                            :to="link.to" 
                            class="block transition-colors duration-200 hover:text-yellow-400" 
                            :class="{ 'text-yellow-400 font-semibold': route.path === link.to }" 
                            @click="closeMenu"
                        >
                            {{ link.label }}
                        </NuxtLink>
                    </li>
                </ul>

            </div>
            
        </nav>

        <!-- Page content -->
        <main class="max-w-6xl mx-auto p-4">
            <NuxtPage />
        </main>

    </div>

</template>

<script setup lang="ts">

    import { ref } from 'vue'
    import { useRoute } from 'vue-router'

    const route = useRoute()
    const isMenuOpen = ref(false)

    const closeMenu = () => {
        isMenuOpen.value = false
    }

    const links = [
        { label: 'Start', to: '/' },
        { label: 'Bookmarks', to: '/bookmarks' },
        { label: 'About', to: '/about' },
        { label: 'Contact', to: '/contact' }
    ]

</script>

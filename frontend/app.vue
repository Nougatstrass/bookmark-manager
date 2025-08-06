
<template>

    <div>
        <!-- Navigation -->
        <nav class="bg-gray-800 text-white p-4">

            <div class="flex justify-between items-center">

                <!-- Logo / App name -->
                <div class="text-lg font-bold">Bookmark manager</div>

                <!-- Hamburger button (mobile) -->
                <button 
                    @click="isMenuOpen = !isMenuOpen" 
                    class="md:hidden focus:outline-none"
                    >

                    <!-- Icon: three bars -->
                    <svg 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="w-6 h-6"
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
                <ul class="hidden md:flex gap-4">
                    <li><NuxtLink to="/" class="hover:underline">Start</NuxtLink></li>
                    <li><NuxtLink to="/bookmarks" class="hover:underline">Bookmarks</NuxtLink></li>
                    <li><NuxtLink to="/about" class="hover:underline">About</NuxtLink></li>
                    <li><NuxtLink to="/contact" class="hover:underline">Contact</NuxtLink></li>
                </ul>
            </div>

            <!-- Menu (mobile) -->
            <div v-if="isMenuOpen" class="md:hidden mt-4">
                <ul class="flex flex-col gap-2">
                    <li><NuxtLink to="/" class="hover:underline" @click="closeMenu">Start</NuxtLink></li>
                    <li><NuxtLink to="/bookmarks" class="hover:underline" @click="closeMenu">Bookmarks</NuxtLink></li>
                    <li><NuxtLink to="/about" class="hover:underline" @click="closeMenu">About</NuxtLink></li>
                    <li><NuxtLink to="/contact" class="hover:underline" @click="closeMenu">Contact</NuxtLink></li>
                </ul>
            </div>
            
        </nav>

        <!-- Page content -->
         <main>
            <NuxtPage />
         </main>

    </div>

</template>

<script setup lang="ts">

    import { ref } from 'vue'

    const isMenuOpen = ref(false)

    const closeMenu = () => {
        isMenuOpen.value = false
    }

</script>

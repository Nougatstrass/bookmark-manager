
<template>

  <div>

    <!-- Navigation -->
    <nav class="bg-gray-800 p-4 text-white shadow-md">

      <div class="mx-auto flex max-w-6xl items-center justify-between">

        <!-- Logo / App name -->
        <div class="text-lg font-bold tracking-wide">📑 Bookmark manager</div>

        <!-- Hamburger button (mobile) -->
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="transition-transform duration-200 hover:scale-110 focus:outline-none md:hidden"
          aria-label="Toggle menu"
        >
          <!-- Icon: three bars -->
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>

        <!-- Menu (desktop) -->
        <ul class="hidden gap-6 md:flex">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="transition-colors duration-200 hover:text-yellow-400"
              :class="{ 'font-semibold text-yellow-400': route.path === link.to }"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Menu (mobile) -->
      <div v-if="isMenuOpen" class="mt-4 rounded-md bg-gray-800 shadow-lg md:hidden">
        <ul class="flex flex-col gap-3 p-4">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="block transition-colors duration-200 hover:text-yellow-400"
              :class="{ 'font-semibold text-yellow-400': route.path === link.to }"
              @click="closeMenu"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>

    <main class="mx-auto max-w-6xl p-4">

		<NuxtLoadingIndicator />

		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>

		<!-- Toasts -->
		<ToastList />

	</main>

  </div>

</template>

<script setup lang="ts">

	import { ref } from 'vue';
	import { useRoute } from 'vue-router';
	import ToastList from '@/components/ui/ToastList.vue';

	const route = useRoute();
	const isMenuOpen = ref(false);

	const closeMenu = () => {
		isMenuOpen.value = false;
	};

	const links = [
		{ label: 'Start', to: '/' },
		{ label: 'Bookmarks', to: '/bookmarks' },
		{ label: 'About', to: '/about' },
		{ label: 'Contact', to: '/contact' },
	];

</script>

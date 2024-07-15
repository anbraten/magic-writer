<template>
  <nav
    class="sticky top-4 z-10 mb-4 flex w-full max-w-6xl mx-auto rounded-md flex-wrap gap-2 border bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 p-2 items-center"
  >
    <NuxtLink to="/" class="text-xl">🧙🏽‍♂️</NuxtLink>

    <slot />

    <div class="navigation-start" />

    <div class="ml-auto flex items-center">
      <UButton to="/settings" icon="i-heroicons-cog" size="lg" variant="ghost" color="gray" aria-label="Settings" />
    </div>

    <slot name="end" />
  </nav>
</template>

<template>
  <div class="flex flex-col w-full">
    <navigation />
    <main>
      <slot />
    </main>
  </div>
</template>

<style>
body {
  @apply bg-neutral-100 dark:bg-neutral-900;
}
</style>

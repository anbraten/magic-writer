<template>
  <div class="w-full max-w-6xl mx-auto">
    <UCard class="mt-4">
      <template #header>
        <h1 class="text-xl">Settings</h1>
      </template>

      <form class="flex flex-col gap-4 max-w-lg">
        <UFormGroup label="AI Token" name="openaiToken">
          <UInput v-model="config.aiToken" />
        </UFormGroup>

        <UFormGroup label="AI Model" name="openaiModel">
          <USelect v-model="config.aiModel" :options="aiModels" />
        </UFormGroup>

        <UFormGroup label="Debounce time before suggesting" name="debounceSuggestion">
          <UInput v-model="config.debounceSuggestion" />
        </UFormGroup>

        <UFormGroup label="Color Mode" name="colorMode">
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
              color="gray"
              variant="ghost"
              aria-label="Theme"
              @click="isDark = !isDark"
            >
              {{ isDark ? 'Dark' : 'Light' }}
            </UButton>
            <template #fallback>
              <div class="w-8 h-8" />
            </template>
          </ClientOnly>
        </UFormGroup>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const config = useConfig();

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  },
});

const aiModels = [
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-4', value: 'gpt-4' },
];
</script>

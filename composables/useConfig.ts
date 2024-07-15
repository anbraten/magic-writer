import { useStorage } from '@vueuse/core';

export function useConfig() {
  const config = useStorage('magic-writer:config', {
    aiToken: '',
    aiModel: 'gpt-3.5-turbo',
    debounceSuggestion: 1000,
  });

  return config;
}

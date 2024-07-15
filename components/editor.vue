<template>
  <div class="flex flex-col w-full max-w-6xl mx-auto relative">
    <Teleport to=".navigation-start" v-if="editor">
      <div class="toolbar flex">
        <UDropdown :items="textTypes" :popper="{ placement: 'bottom-start' }">
          <UButton
            color="white"
            variant="ghost"
            :label="
              textTypes.flatMap((m) => m).find((t) => t.active)?.label || textTypes.flatMap((m) => m).at(0)?.label
            "
            trailing-icon="i-heroicons-chevron-down-20-solid"
          />
        </UDropdown>

        <div class="my-auto h-6 border-l border-gray-300" />

        <button
          type="button"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
          :title="$t('bold')"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <Icon name="i-heroicons:bold" class="h-4 w-4" />
        </button>
        <button
          type="button"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
          :title="$t('italic')"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <Icon name="i-heroicons:italic" class="h-4 w-4" />
        </button>
        <button
          type="button"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
          :title="$t('strikethrough')"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <Icon name="i-tabler:strikethrough" class="h-4 w-4" />
        </button>

        <button
          type="button"
          :disabled="!editor.can().chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }"
          :title="$t('code')"
          @click="editor.chain().focus().toggleCode().run()"
        >
          <Icon name="i-tabler:code" class="h-4 w-4" />
        </button>

        <div class="my-auto h-6 border-l border-gray-300" />

        <button
          type="button"
          :class="{ 'is-active': editor.isActive('bulletList') }"
          :title="$t('bullet_list')"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <Icon name="i-tabler:list" class="h-4 w-4" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('orderedList') }"
          :title="$t('numbered_list')"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <Icon name="i-tabler:list-numbers" class="h-4 w-4" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
          :title="$t('code_block')"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          <Icon name="i-tabler:source-code" class="h-4 w-4" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('blockquote') }"
          :title="$t('quote')"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <Icon name="i-tabler:blockquote" class="h-4 w-4" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': editor.isActive('horizontalRule') }"
          :title="$t('horizontal_rule')"
          @click="editor.chain().focus().setHorizontalRule().run()"
        >
          <Icon name="i-tabler:line-dashed" class="h-4 w-4" />
        </button>
      </div>
    </Teleport>

    <div class="w-full mx-auto bg-white dark:bg-neutral-800 p-4 rounded-md">
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Placeholder from '@tiptap/extension-placeholder';
import { AutocompleteExtension } from './Autocomplete';

const content = defineModel<string>({ required: true });

const t = (s: string) => s;
const $t = t;

const config = useConfig();

const CustomDocument = Document.extend({
  content: 'heading block*',
});

const editor = useEditor({
  content: content.value,
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert prose-neutral focus:outline-none',
    },
  },
  extensions: [
    CustomDocument,
    StarterKit.configure({
      document: false,
    }),
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          return 'A title for your document …';
        }

        return '';
      },
    }),
    AutocompleteExtension.configure({
      suggestionDebounce: config.value.debounceSuggestion,
      getSuggestions: async (previousText) => {
        if (!config.value.aiToken || !config.value.aiModel) {
          throw new Error('Please configure AI Token and AI Model');
        }

        const suggestion = await $fetch('/api/suggest', {
          method: 'POST',
          body: JSON.stringify({
            previousText,
            aiToken: config.value.aiToken,
            aiModel: config.value.aiModel,
          }),
        });

        if (typeof suggestion !== 'string') {
          throw new Error('Invalid suggestion');
        }

        return suggestion;
      },
    }),
  ],
  onUpdate({ editor }) {
    if (editor.getHTML() !== content.value) {
      content.value = editor.getHTML();
    }
  },
});

const textTypes = computed(() => [
  [
    {
      label: t('paragraph'),
      active: editor.value?.isActive('paragraph'),
      click() {
        editor.value?.chain().focus().setParagraph().run();
      },
    },
  ],
  [
    {
      label: t('heading_1'),
      labelClass: 'text-3xl font-bold',
      active: editor.value?.isActive('heading', { level: 1 }),
      click() {
        editor.value?.chain().focus().toggleHeading({ level: 1 }).run();
      },
    },
    {
      label: t('heading_2'),
      labelClass: 'text-2xl font-bold',
      active: editor.value?.isActive('heading', { level: 2 }),
      click() {
        editor.value?.chain().focus().toggleHeading({ level: 2 }).run();
      },
    },
    {
      label: t('heading_3'),
      labelClass: 'text-xl font-bold',
      active: editor.value?.isActive('heading', { level: 3 }),
      click() {
        editor.value?.chain().focus().toggleHeading({ level: 3 }).run();
      },
    },
    {
      label: t('heading_4'),
      labelClass: 'text-lg font-bold',
      active: editor.value?.isActive('heading', { level: 4 }),
      click() {
        editor.value?.chain().focus().toggleHeading({ level: 4 }).run();
      },
    },
    {
      label: t('heading_5'),
      labelClass: 'text-md',
      active: editor.value?.isActive('heading', { level: 5 }),
      click() {
        editor.value?.chain().focus().toggleHeading({ level: 5 }).run();
      },
    },
    {
      label: t('heading_6'),
      labelClass: 'text-xs',
      active: editor.value?.isActive('heading', { level: 6 }),
      click() {
        editor.value?.chain().focus().toggleHeading({ level: 6 }).run();
      },
    },
  ],
]);

// const textAlign = computed(() => [
//   [
//     {
//       icon: 'i-tabler-align-left',
//       active: editor.value?.isActive({ textAlign: 'left' }),
//       click() {
//         editor.value?.chain().focus().setTextAlign('left').run();
//       },
//     },
//     {
//       icon: 'i-tabler-align-center',
//       active: editor.value?.isActive({ textAlign: 'center' }),
//       click() {
//         editor.value?.chain().focus().setTextAlign('center').run();
//       },
//     },
//     {
//       icon: 'i-tabler-align-right',
//       active: editor.value?.isActive({ textAlign: 'right' }),
//       click() {
//         editor.value?.chain().focus().setTextAlign('right').run();
//       },
//     },
//   ],
// ]);

watch(content, (newValue) => {
  if (newValue !== editor.value?.getHTML()) {
    editor.value?.commands.setContent(newValue);
  }
});
</script>

<style scoped>
.toolbar button {
  @apply rounded-md px-2;
}

.toolbar button.is-active,
.toolbar button:hover {
  @apply bg-neutral-200 dark:bg-neutral-700;
}

::v-deep(.tiptap .is-empty::before) {
  content: attr(data-placeholder);
  @apply text-neutral-300 dark:text-neutral-600;
  float: left;
  height: 0;
  pointer-events: none;
}

::v-deep(.autocomplete-suggestion) {
  @apply text-neutral-300 dark:text-neutral-600;
}
</style>

<template>
  <div class="flex flex-col w-full">
    <div v-if="showToolbar" class="fixed top-0 left-0 w-full h-16 bg-white z-10" />
    <div
      v-if="editor && showToolbar"
      class="toolbar sticky top-4 z-10 mb-4 flex w-full rounded-md flex-wrap gap-2 border bg-gray-50 p-2"
    >
      <UDropdown :items="textTypes" :popper="{ placement: 'bottom-start' }">
        <UButton
          color="white"
          variant="ghost"
          :label="textTypes.flatMap((m) => m).find((t) => t.active)?.label || textTypes.flatMap((m) => m).at(0)?.label"
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

      <div class="ml-auto flex items-center">
        <p class="text-xl">🧙🏽‍♂️ writer</p>
      </div>
    </div>

    <div class="w-full">
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

const showToolbar = ref(true);

const CustomDocument = Document.extend({
  content: 'heading block*',
});

const editor = useEditor({
  content: content.value,
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl max-w-none focus:outline-none',
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
      getSuggestions: async (previousText) => {
        const suggestion = await $fetch('/api/suggest', {
          method: 'POST',
          body: JSON.stringify({ previousText }),
        });
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
  @apply bg-gray-200;
}

::v-deep(.autocomplete-suggestion) {
  @apply text-gray-400;
}
</style>

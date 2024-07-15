import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { debounce } from './debounce';

export const AutocompleteExtension = Node.create<{
  applySuggestionKey: string;
  suggestionDebounce: number;
  getSuggestions: (previousText: string) => Promise<string | null>;
}>({
  name: 'suggestion',

  addOptions() {
    return {
      applySuggestionKey: 'Tab',
      suggestionDebounce: 1500,
      previousTextLength: 4000,
      getSuggestions: async () => null,
    };
  },

  // addStorage() {
  //   return {
  //     getSuggestion: undefined,
  //     suggestion: null,
  //   };
  // },

  // addAttributes() {
  //   return {
  //     suggestion: {
  //       default: null,
  //       parseHTML: (element) => element.getAttribute('data-suggestion'),
  //       renderHTML: (attributes) => {
  //         return {
  //           'data-suggestion': attributes.suggestion,
  //         };
  //       },
  //     },
  //   };
  // },

  // onBeforeCreate() {
  //   this.storage.getSuggestion = debounce(async (previousText: string, cb: (suggestion: string | null) => void) => {
  //     const suggestion = await $fetch('/api/suggest', {
  //       method: 'POST',
  //       body: JSON.stringify({ previousText }),
  //     });

  //     cb(suggestion);
  //   }, this.options.suggestionDebounce);
  // },

  // addCommands() {
  //   return {
  //     // setSuggestion: (suggestion: string) => () => {
  //     //   this.editor.commands.insertContent(suggestion);
  //     //   return true;
  //     // },
  //     // applySuggestion: () => () => {
  //     //   // TODO
  //     //   return true;
  //     // },
  //     paragraph:
  //       () =>
  //       ({ commands }) => {
  //         return commands.setNode('paragraph');
  //       },
  //   };
  // },

  // addKeyboardShortcuts() {
  //   return {
  //     [this.options.applySuggestionKey]: () => this.editor.commands.applySuggestion(),
  //   };
  // },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey<DecorationSet>('suggestion');

    const getSuggestion = debounce(async (previousText: string, cb: (suggestion: string | null) => void) => {
      const suggestion = await this.options.getSuggestions(previousText);
      cb(suggestion);
    }, this.options.suggestionDebounce);

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldValue) {
            if (tr.getMeta(pluginKey)) {
              // Update the decoration state based on the async data
              const { decorations } = tr.getMeta(pluginKey);
              return decorations;
            }
            return tr.docChanged ? oldValue.map(tr.mapping, tr.doc) : oldValue;
          },
        },
        view() {
          return {
            update(view, prevState) {
              // This will add the widget decoration at the cursor position
              const selection = view.state.selection;
              const cursorPos = selection.$head.pos;
              const nextNode = view.state.doc.nodeAt(cursorPos);

              // If the cursor is not at the end of the block and we have a suggestion => hide the suggestion
              if (nextNode && !nextNode.isBlock && pluginKey.getState(view.state)?.find().length) {
                const tr = view.state.tr;
                tr.setMeta('addToHistory', false);
                tr.setMeta(pluginKey, { decorations: DecorationSet.empty });
                view.dispatch(tr);
                return;
              }

              // If the document didn't change, do nothing
              if (prevState && prevState.doc.eq(view.state.doc)) {
                return;
              }

              // reset the suggestion before fetching a new one
              setTimeout(() => {
                const tr = view.state.tr;
                tr.setMeta('addToHistory', false);
                tr.setMeta(pluginKey, { decorations: DecorationSet.empty });
                view.dispatch(tr);
              }, 0);

              // fetch a new suggestion
              const previousText = view.state.doc.textBetween(0, view.state.doc.content.size, ' ').slice(-4000);
              getSuggestion(previousText, (suggestion) => {
                if (!suggestion) return;

                const updatedState = view.state;

                const cursorPos = updatedState.selection.$head.pos;
                const suggestionDecoration = Decoration.widget(
                  cursorPos,
                  () => {
                    const parentNode = document.createElement('span');
                    const addSpace = nextNode && nextNode.isText ? ' ' : '';
                    parentNode.innerHTML = `${addSpace}${suggestion}`;
                    parentNode.classList.add('autocomplete-suggestion');
                    return parentNode;
                  },
                  { side: 1 },
                );

                const decorations = DecorationSet.create(updatedState.doc, [suggestionDecoration]);
                const tr = view.state.tr;
                tr.setMeta('addToHistory', false);
                tr.setMeta(pluginKey, { decorations });
                view.dispatch(tr);
              });
            },
          };
        },
        props: {
          decorations(editorState) {
            return pluginKey.getState(editorState);
          },
          handleKeyDown(view, event) {
            // if (event.key === 'Tab') {
            //   const { state, dispatch } = view;
            //   const { from, to } = state.selection;
            //   state.doc.nodesBetween(from, to, (node, pos) => {
            //     if (node.type.name === 'suggestion') {
            //       const tr = state.tr;
            //       tr.replaceWith(pos, pos + node.nodeSize, state.schema.text(node.attrs.suggestion));
            //       dispatch(tr);
            //       return false;
            //     }
            //   });
            //   return true;
            // }
            return false;
          },
        },
      }),
    ];
  },
});

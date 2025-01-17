import { Node, nodeInputRule, mergeAttributes } from '@tiptap/core';

import type { ImageUploader } from '@/common/components/editor/extensions/image/type';

import { dropImagePlugin } from './plugins/drop-image';

/**
 * Matches following attributes in Markdown-typed image: [, alt, src, title]
 *
 * Example:
 * ![Lorem](image.jpg) -> [, "Lorem", "image.jpg"]
 * ![](image.jpg "Ipsum") -> [, "", "image.jpg", "Ipsum"]
 * ![Lorem](image.jpg "Ipsum") -> [, "Lorem", "image.jpg", "Ipsum"]
 */
const IMAGE_INPUT_REGEX = /!\[(.+|:?)\]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const createImageExtension = (uploadFn: ImageUploader) => Node.create({
    name: 'image',
    inline: true,
    group: 'inline',
    draggable: true,
    addAttributes() {
        return {
            src: {},
            alt: { default: null },
            title: { default: null },
            'file-id': {},
            'data-loading': { default: false }, // for loading spinner
            style: { default: null }, // for loading spinner
            width: { default: 'auto' },
            height: { default: 'auto' },
            error: { default: null },
        };
    },
    parseHTML: () => [
        {
            tag: 'img[src]',
            getAttrs: (dom) => {
                if (typeof dom === 'string') return {};
                const element = dom as HTMLImageElement;
                return {
                    src: element.getAttribute('src'),
                    title: element.getAttribute('title'),
                    alt: element.getAttribute('alt'),
                    'file-id': element.getAttribute('file-id'),
                    style: element.getAttribute('style'),
                    width: element.getAttribute('width'),
                    height: element.getAttribute('height'),
                    error: element.getAttribute('error'),
                };
            },
        },
    ],
    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(HTMLAttributes, {
            onerror: "this.setAttribute('error', 'true')",
        })];
    },
    // eslint-disable-next-line no-unused-vars
    addCommands(this: any) {
        return (attrs) => (state, dispatch) => {
            const { selection } = state;
            const position = selection.$cursor
                ? selection.$cursor.pos
                : selection.$to.pos;
            const node = this.type.create(attrs);
            const transaction = state.tr.insert(position, node);
            dispatch(transaction);
        };
    },
    addInputRules() {
        return [
            nodeInputRule({
                find: IMAGE_INPUT_REGEX,
                type: this.type,
                getAttributes: (match) => {
                    const [, alt, src, title] = match;
                    return { src, alt, title };
                },
            }),
        ];
    },
    addProseMirrorPlugins() {
        return [dropImagePlugin(uploadFn)];
    },
});

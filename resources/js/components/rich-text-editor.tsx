import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Code, Italic, Link as LinkIcon, List, ListOrdered, Redo, Strikethrough, Underline as UnderlineIcon, Undo } from 'lucide-react';
import { useCallback, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
    editable?: boolean;
}

export function RichTextEditor({ content = '', onChange, placeholder = 'Write something...', className, editable = true }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-3 py-2',
            },
        },
    });

    // Update content when prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={cn('rounded-md border bg-background', className)}>
            {editable && (
                <div className="flex flex-wrap items-center gap-1 border-b p-1">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('bold')}
                        onPressedChange={() => editor.chain().focus().toggleBold().run()}
                        aria-label="Toggle bold"
                    >
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('italic')}
                        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                        aria-label="Toggle italic"
                    >
                        <Italic className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('underline')}
                        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                        aria-label="Toggle underline"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('strike')}
                        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                        aria-label="Toggle strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Toggle>

                    <div className="mx-1 h-6 w-px bg-border" />

                    <Toggle
                        size="sm"
                        pressed={editor.isActive('bulletList')}
                        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                        aria-label="Toggle bullet list"
                    >
                        <List className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('orderedList')}
                        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                        aria-label="Toggle ordered list"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>

                    <div className="mx-1 h-6 w-px bg-border" />

                    <Toggle
                        size="sm"
                        pressed={editor.isActive('code')}
                        onPressedChange={() => editor.chain().focus().toggleCode().run()}
                        aria-label="Toggle code"
                    >
                        <Code className="h-4 w-4" />
                    </Toggle>
                    <Toggle size="sm" pressed={editor.isActive('link')} onPressedChange={setLink} aria-label="Add link">
                        <LinkIcon className="h-4 w-4" />
                    </Toggle>

                    <div className="mx-1 h-6 w-px bg-border" />

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="h-8 w-8 p-0"
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="h-8 w-8 p-0"
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <EditorContent editor={editor} />
        </div>
    );
}

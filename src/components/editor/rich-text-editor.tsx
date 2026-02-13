"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const ReactQuill = useMemo(() => dynamic(() => import('react-quill-new'), { ssr: false }), []) as any;

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
        'list', 'indent',
        'script', 'align',
        'color', 'background',
        'link', 'image', 'video'
    ];

    return (
        <div className={`bg-white text-black rounded-md flex flex-col ${className}`}>
            <style jsx global>{`
                .ql-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .ql-editor {
                    flex: 1;
                    overflow-y: auto;
                    min-height: 200px;
                }
            `}</style>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="text-black flex flex-col h-full"
            />
        </div>
    );
}

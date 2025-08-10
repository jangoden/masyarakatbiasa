import React from 'react';
import ReactQuill, { Quill } from 'react-quill';
// Pastikan baris ini ada di file main.jsx atau App.jsx Anda:
// import 'react-quill/dist/quill.snow.css';

// Langkah 1: Daftarkan Opsi Font
const Font = Quill.import('formats/font');
const fontFamilies = [
  'poppins',
  'jetbrains-mono',
  'playfair-display',
  'roboto-slab',
  'fira-code',
  'source-code-pro',
  'merriweather',
  'space-grotesk',
  'ubuntu-mono'
];
Font.whitelist = fontFamilies;
Quill.register(Font, true);


// Langkah 2: Konfigurasi Toolbar Editor
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, false] }, { 'font': fontFamilies }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    [{ 'align': [] }],
    ['clean']
  ],
};

const formats = [
  'header', 'font',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'align',
  'color', 'background'
];


// Langkah 3: Terapkan ke Komponen
const RichTextEditor = ({ value, onChange }) => {
  return (
    <div className="bg-white text-gray-800 rounded-md prose-stone">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Mulai tulis ceritamu di sini..."
      />
        </div>
    );
};

export default RichTextEditor;

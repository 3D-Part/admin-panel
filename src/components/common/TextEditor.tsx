import React from 'react'
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

type TextEditorType = {
  handleEditorChange: (text: string) => void
  defaultValue?: string
  placeholder?: string
  id?: string
}

const TextEditor: React.FC<TextEditorType> = ({
  handleEditorChange,
  defaultValue,
  placeholder,
  id,
}) => {
  const modules = {
    toolbar: [
      // [{ font: [] }, { header: [] }],
      [{ font: [] }],
      [{ size: [] }], // Add font size options
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }], // Add color and background color options
      ['link'],
    ],
  }

  const formats = [
    'font',
    'size',
    'header',
    'list',
    'bold',
    'italic',
    'underline',
    'color',
    'link',
  ]

  const onChange = (value: string) => {
    handleEditorChange(value)
  }

  return (
    <div>
      <ReactQuill
        defaultValue={defaultValue}
        id={id}
        placeholder={placeholder}
        className="text-editor-dark flex flex-col min-h-[200px] w-full overflow-hidden rounded-lg border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
        theme="snow"
        modules={modules}
        formats={formats}
        onChange={onChange}
      />
    </div>
  )
}

export default TextEditor

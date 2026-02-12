'use client'
import { Label, TextInput, Button } from 'flowbite-react'
import React, { useState, KeyboardEvent } from 'react'
import { HiX, HiPlus } from 'react-icons/hi'

interface KeywordsProps {
  keywords: string[]
  onChange: (keywords: string[]) => void
  label?: string
  placeholder?: string
}

const Keywords: React.FC<KeywordsProps> = ({
  keywords,
  onChange,
  label = 'Keywords',
  placeholder = 'Add keyword...',
}) => {
  const [inputValue, setInputValue] = useState('')

  const addKeyword = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !keywords.includes(trimmedValue)) {
      onChange([...keywords, trimmedValue])
      setInputValue('')
    }
  }

  const removeKeyword = (indexToRemove: number) => {
    onChange(keywords.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  return (
    <div className="w-full">
      <div className="mb-2 block">
        <Label className="text-base" value={label} />
      </div>

      {/* Input for adding new keywords */}
      <div className="flex gap-2 mb-3 items-center">
        <TextInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button
          type="button"
          color="purple"
          size="lg"
          onClick={addKeyword}
          disabled={!inputValue.trim() || keywords.includes(inputValue.trim())}
        >
          <HiPlus className="w-4 h-4" />
        </Button>
      </div>

      {/* Display existing keywords */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm"
            >
              <span>{keyword}</span>
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="hover:bg-purple-200 dark:hover:bg-purple-700 rounded-full p-1 transition-colors"
                aria-label={`Remove ${keyword}`}
              >
                <HiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Keywords

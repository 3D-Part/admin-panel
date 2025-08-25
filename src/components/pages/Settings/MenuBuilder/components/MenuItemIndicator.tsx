import React from 'react'

// Color palette for different nesting levels
const levelColors = [
  { light: 'from-blue-400 to-blue-600', dark: 'from-blue-500 to-blue-700' },
  { light: 'from-green-400 to-green-600', dark: 'from-green-500 to-green-700' },
  {
    light: 'from-purple-400 to-purple-600',
    dark: 'from-purple-500 to-purple-700',
  },
  {
    light: 'from-orange-400 to-orange-600',
    dark: 'from-orange-500 to-orange-700',
  },
  { light: 'from-pink-400 to-pink-600', dark: 'from-pink-500 to-pink-700' },
  {
    light: 'from-indigo-400 to-indigo-600',
    dark: 'from-indigo-500 to-indigo-700',
  },
  { light: 'from-teal-400 to-teal-600', dark: 'from-teal-500 to-teal-700' },
  { light: 'from-red-400 to-red-600', dark: 'from-red-500 to-red-700' },
  {
    light: 'from-yellow-400 to-yellow-600',
    dark: 'from-yellow-500 to-yellow-700',
  },
  { light: 'from-cyan-400 to-cyan-600', dark: 'from-cyan-500 to-cyan-700' },
]

interface MenuItemIndicatorProps {
  level: number
}

const MenuItemIndicator: React.FC<MenuItemIndicatorProps> = ({ level }) => {
  const getLevelColor = (level: number) => {
    // if (level === 0) return null
    const colorIndex = level % levelColors.length
    return levelColors[colorIndex]
  }

  const levelColor = getLevelColor(level)

  if (!levelColor) return null

  return (
    <div
      className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${levelColor.light} dark:${levelColor.dark}`}
    />
  )
}

export default MenuItemIndicator

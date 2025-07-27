# Theme Switcher Components

This directory contains theme switching components for the admin panel.

## Components

### ThemeSwitcher

A dropdown component that allows users to choose between Light, Dark, and System themes.

**Usage:**

```tsx
import ThemeSwitcher from '@/components/common/ThemeSwitcher'

// In your component
;<ThemeSwitcher />
```

### ThemeToggle

A simple toggle button that switches between Light and Dark themes.

**Usage:**

```tsx
import { ThemeToggle } from '@/components/common/ThemeSwitcher'

// In your component
;<ThemeToggle />
```

### ThemeProvider

A provider component that initializes the theme system and handles system theme changes.

**Usage:**

```tsx
import ThemeProvider from '@/components/common/ThemeProvider'

// Wrap your app
;<ThemeProvider>
  <YourApp />
</ThemeProvider>
```

## Features

- **Persistent Storage**: Theme preference is saved to localStorage
- **System Theme Support**: Automatically follows system dark/light mode preference
- **Smooth Transitions**: Uses Tailwind's dark mode classes for seamless switching
- **Accessible**: Proper ARIA labels and keyboard navigation support

## Theme Options

- **Light**: Forces light mode
- **Dark**: Forces dark mode
- **System**: Follows the user's system preference

## Implementation Details

The theme system uses:

- Zustand store for state management
- Tailwind CSS dark mode classes
- localStorage for persistence
- CSS media queries for system theme detection

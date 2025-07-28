# Responsive Table Components

This directory contains reusable components for creating mobile-responsive tables that automatically adapt to different screen sizes.

## Components

### ResponsiveTable

A wrapper component that provides the basic table structure with responsive behavior.

### MobileTableCard

A card component used to display table rows on mobile devices.

### MobileCardItem

A component for displaying key-value pairs within mobile cards.

### ResponsiveTableWrapper

A higher-level wrapper that handles the switching between desktop table and mobile card layouts, including mobile pagination.

### MobileCardBuilder

A helper component for quickly building mobile card layouts with common patterns.

## Usage

### Basic Implementation

```tsx
import { ResponsiveTableWrapper, MobileCardBuilder } from '@/components/common'

const MyTable = () => {
  const mobileCards = data.map((item) => (
    <MobileCardBuilder
      key={item.id}
      title={item.name}
      subtitle={item.description}
      onClick={() => handleClick(item)}
      items={[
        {
          label: 'Category',
          value: item.category,
        },
        {
          label: 'Price',
          value: `$${item.price}`,
        },
      ]}
      actions={
        <div className="flex gap-2">
          <button onClick={() => editItem(item)}>Edit</button>
          <button onClick={() => deleteItem(item)}>Delete</button>
        </div>
      }
    />
  ))

  return (
    <ResponsiveTableWrapper
      mobileCards={mobileCards}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => changeCurrentPage(page)}
      count={count}
    >
      {/* Your existing table structure */}
      <div className="overflow-x-auto relative min-h-[100px] table-container">
        <Table>
          <Table.Head>{/* Table headers */}</Table.Head>
          <Table.Body>{/* Table rows */}</Table.Body>
        </Table>
      </div>
    </ResponsiveTableWrapper>
  )
}
```

## Mobile Pagination

The ResponsiveTableWrapper now includes built-in mobile pagination support using a custom `MobilePagination` component. This component is specifically designed for mobile screens and prevents overflow issues.

### Pagination Props

- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `onPageChange`: Function to handle page changes
- `count`: Total number of items (optional, for display)

### Mobile Pagination Features

- **Compact Design**: Shows only essential navigation elements to prevent overflow
- **Current Page Display**: Shows "current / total" format (e.g., "3 / 10")
- **Navigation Arrows**: Previous and next buttons with clear icons
- **First Page Button**: Quick access to the first page with double arrow icon
- **Touch-Friendly**: Larger buttons optimized for mobile interaction
- **Disabled States**: Buttons are disabled when at first/last page
- **Total Count**: Displays total item count below pagination
- **Consistent Styling**: Matches the overall design system

### Mobile Pagination Layout

```
[<<] [<] [3 / 10] [>] [>>]
        Total: 100 items
```

- **<<** : Go to first page
- **<** : Go to previous page
- **3 / 10** : Current page / Total pages
- **>** : Go to next page
- **>>** : Go to last page (not shown to save space)

### Benefits

- **No Overflow**: Compact design prevents horizontal scrolling
- **Clear Navigation**: Users can easily understand current position
- **Quick Access**: First page button for rapid navigation
- **Touch Optimized**: Large touch targets for mobile interaction
- **Accessibility**: Proper ARIA labels and keyboard navigation

## CSS Classes

The following CSS classes are available for styling:

### Desktop Table

- `.table-desktop` - Hides content on mobile, shows on desktop
- `.table-container` - Container styling for tables
- `.table-header` - Header row styling
- `.table-row` - Row styling
- `.table-cell` - Cell styling

### Mobile Cards

- `.table-mobile` - Shows content on mobile, hides on desktop
- `.mobile-card-container` - Container for mobile cards
- `.mobile-card` - Individual card styling
- `.mobile-card-header` - Card header styling
- `.mobile-card-content` - Card content area
- `.mobile-card-item` - Individual item within card
- `.mobile-card-label` - Label styling
- `.mobile-card-value` - Value styling
- `.mobile-card-actions` - Actions area styling

### Mobile Pagination

- `.mobile-pagination-container` - Container for mobile pagination (used by MobilePagination component)

## Responsive Breakpoints

- **Desktop (md and up)**: Shows traditional table layout with pagination
- **Mobile (below md)**: Shows card-based layout with mobile pagination

## Features

- **Automatic Responsive Switching**: Tables automatically switch to card layout on mobile
- **Mobile Pagination**: Built-in mobile-friendly pagination controls
- **Consistent Styling**: Maintains design consistency across desktop and mobile
- **Interactive Elements**: Supports click handlers and actions on both layouts
- **Dark Mode Support**: All components support dark mode
- **Accessibility**: Maintains proper semantic structure and ARIA labels
- **Touch Optimization**: Larger touch targets for mobile interaction

## Implementation Examples

### Products Table

The Products table demonstrates a complex implementation with:

- Product images and names
- Category badges
- Price and quantity information
- Dropdown actions menu
- Mobile pagination support

### Users Table

The Users table shows:

- User names and emails
- Contact information
- Points display
- Simple card layout
- Mobile pagination

### Orders Table

The Orders table includes:

- Order details
- Status badges
- Date formatting
- Action buttons
- Mobile pagination

## Best Practices

1. **Keep Mobile Cards Simple**: Don't overload mobile cards with too much information
2. **Use Clear Labels**: Make sure mobile card labels are descriptive
3. **Consistent Actions**: Keep actions consistent between desktop and mobile
4. **Test Responsive Behavior**: Always test on various screen sizes
5. **Optimize Images**: Use appropriate image sizes for mobile cards
6. **Pagination UX**: Ensure pagination is easy to use on mobile devices

## Migration Guide

To migrate an existing table to be mobile responsive with pagination:

1. Import the responsive components
2. Wrap your existing table with `ResponsiveTableWrapper`
3. Create mobile card layouts using `MobileCardBuilder`
4. Add pagination props to ResponsiveTableWrapper
5. Test on mobile devices
6. Adjust styling as needed

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all imports are correct
2. **Styling Conflicts**: Check for conflicting CSS classes
3. **Mobile Layout Issues**: Verify mobile card structure
4. **Action Handlers**: Ensure click handlers work on both layouts
5. **Pagination Not Showing**: Check that all pagination props are provided

### Debug Tips

- Use browser dev tools to test responsive behavior
- Check console for any import or component errors
- Verify that mobile cards render correctly
- Test all interactive elements on mobile
- Ensure pagination controls are touch-friendly

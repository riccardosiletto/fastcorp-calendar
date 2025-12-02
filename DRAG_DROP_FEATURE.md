# Drag & Drop Project Reordering Feature

## Overview
Projects can now be reordered by dragging and dropping them in the grid view. The order is automatically saved and persists across page refreshes.

## How to Use

### Reordering Projects
1. Navigate to the **Dashboard** page
2. Hover over any project card in the grid view
3. You'll see a **drag handle** (⋮⋮ icon) appear on the left side of the project header
4. Click and hold the drag handle
5. Drag the project to your desired position
6. Release to drop - the project will snap into place
7. The new order is automatically saved

### Visual Indicators
- **Drag Handle**: Appears on hover, shows the grip vertical icon (⋮⋮)
- **While Dragging**: Card becomes semi-transparent (50% opacity)
- **Cursor Changes**: From "grab" to "grabbing" when actively dragging

## Technical Implementation

### Components Modified
1. **AppContext.jsx**
   - Added `reorderProjects()` function
   - Exposes function to update project order

2. **Dashboard.jsx**
   - Imported `@dnd-kit` components
   - Created `SortableProjectCard` component
   - Wrapped projects grid with `DndContext` and `SortableContext`
   - Added `handleDragEnd` to process reordering
   - Added drag sensors with 8px activation distance

3. **Dashboard.css**
   - Added `.drag-handle` styles
   - Added `.dragging` state styles
   - Smooth transitions and hover effects

### Libraries Used
- `@dnd-kit/core` - Core drag and drop functionality
- `@dnd-kit/sortable` - Sortable list utilities
- `@dnd-kit/utilities` - CSS transform utilities

### Features
- ✅ Visual drag handle on hover
- ✅ Smooth animations during drag
- ✅ Snap to grid positions
- ✅ Auto-save order to localStorage
- ✅ Works with 5-column grid layout
- ✅ Responsive - adjusts to screen size
- ✅ Only works in Grid View (not Kanban view)
- ✅ 8px activation distance prevents accidental drags

## Other Changes in This Update

### Removed Progress Bars
- Progress indicators removed from Dashboard project cards
- Progress section removed from Projects detail view
- Cleaner, more minimal design

### New Projects Created
All old projects deleted and replaced with:
1. **24Hassistance** - Logo from `/loghi progetti/24Hassistance.svg`
2. **Design2Taste** - Logo from `/loghi progetti/Design2Taste.svg`
3. **DoEatBetter** - Logo from `/loghi progetti/DoEatBetter.svg`
4. **HRtrails** - Logo from `/loghi progetti/HRtrails.svg`
5. **SkillSherpa** - Logo from `/loghi progetti/SkillSherpa.svg`

All projects start with:
- Their respective company logos
- No tasks initially
- No due dates
- Unique brand colors

## User Experience

### Before Drag
- Hover over project card
- Drag handle (⋮⋮) fades in
- Cursor shows "grab" when hovering handle

### During Drag
- Card becomes semi-transparent
- Cursor changes to "grabbing"
- Card follows mouse movement
- Other cards shift to make space

### After Drop
- Card snaps into new position
- Order updates immediately
- Saved to localStorage automatically
- Sidebar updates to reflect new order

## Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses pointer events for better touch device support
- Requires JavaScript enabled

## Performance
- Lightweight library (@dnd-kit)
- Only active during drag operations
- No performance impact when idle
- Efficient re-rendering with React keys


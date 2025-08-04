# PageHeader Component

A reusable page header component for dashboard pages that provides consistent layout and styling.

## Features

- **Title**: Display page title with proper heading hierarchy
- **Description**: Optional description text below the title
- **Breadcrumbs**: Optional breadcrumb navigation
- **Actions**: Optional action buttons via slot
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Proper semantic HTML structure

## Usage

### Basic Usage

```vue
<template>
  <PageHeader title="Dashboard Overview" />
</template>

<script setup lang="ts">
import PageHeader from "./PageHeader.vue";
</script>
```

### With Description

```vue
<template>
  <PageHeader 
    title="User Management" 
    description="View and manage all users in your system" 
  />
</template>
```

### With Breadcrumbs

```vue
<template>
  <PageHeader 
    title="Settings" 
    :breadcrumbs="['Dashboard', 'Settings', 'General']" 
  />
</template>
```

### With Actions

```vue
<template>
  <PageHeader title="Posts">
    <template #actions>
      <button class="btn btn-primary">Create Post</button>
      <button class="btn btn-secondary">Export</button>
    </template>
  </PageHeader>
</template>
```

### Complete Example

```vue
<template>
  <PageHeader 
    title="User Management" 
    description="View and manage all users in your system"
    :breadcrumbs="['Dashboard', 'Users']"
  >
    <template #actions>
      <button class="btn btn-primary">Add User</button>
      <button class="btn btn-secondary">Export Users</button>
    </template>
  </PageHeader>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `undefined` | The page title |
| `description` | `string` | `undefined` | Optional description text |
| `breadcrumbs` | `string[]` | `undefined` | Array of breadcrumb items |

## Slots

| Slot | Description |
|------|-------------|
| `actions` | Content for action buttons (right side) |

## Running Tests

To run the unit tests for this component:

1. **Install dependencies** (if not already installed):
   ```bash
   # From the project root
   pnpm install
   ```

2. **Run the tests**:
   ```bash
   # From the theme package directory
   cd packages/theme
   pnpm test:unit
   ```

3. **Run specific test file**:
   ```bash
   pnpm test:unit PageHeader.test.ts
   ```

4. **Run tests in watch mode**:
   ```bash
   pnpm test:unit --watch
   ```

## Test Coverage

The tests cover:

- ✅ Component rendering with different props
- ✅ Conditional rendering (when props are not provided)
- ✅ Props validation
- ✅ Complex scenarios with all features combined
- ✅ Accessibility (proper HTML structure)
- ✅ Breadcrumb functionality
- ✅ Actions slot functionality

## Requirements

- Node.js >= 22
- pnpm (for dependency management)
- Vue 3
- Vitest (for testing)
- @vue/test-utils (for component testing) 
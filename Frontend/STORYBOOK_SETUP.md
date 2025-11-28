# Storybook Setup Guide for Monetaris Frontend

## Overview

Storybook is a tool for developing UI components in isolation. It allows you to:
- Document components with live examples
- Test components in different states
- Share component library with designers

**Status: 🔜 PLANNED - Setup instructions for when activated**

## Installation

```bash
cd Frontend

# Install Storybook for React + Vite
npx storybook@latest init --type react --builder vite

# This will install:
# - @storybook/react
# - @storybook/react-vite
# - @storybook/addon-essentials
# - @storybook/addon-interactions
# - @storybook/test
```

## Configuration

### .storybook/main.ts

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../components/**/*.mdx',
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',  // Accessibility testing
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
```

### .storybook/preview.ts

```typescript
import type { Preview } from '@storybook/react';
import '../index.css';  // Import Tailwind styles

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'barbie', value: '#fff0f5' },
      ],
    },
  },
};

export default preview;
```

## Story Template

### Example: Button.stories.tsx

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    children: 'Loading...',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled',
    disabled: true,
  },
};
```

## Package.json Scripts

Add these scripts to `Frontend/package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build -o storybook-static",
    "storybook:test": "test-storybook"
  }
}
```

## Component Story Requirements

When Storybook is active, the **coder agent** MUST:

1. **Create `.stories.tsx` for every component**
   ```
   Button.tsx → Button.stories.tsx
   UserCard.tsx → UserCard.stories.tsx
   ```

2. **Include all significant states**
   - Default state
   - Loading state
   - Error state
   - Empty state
   - Disabled state

3. **Add autodocs tag**
   ```typescript
   tags: ['autodocs'],
   ```

4. **Document props with argTypes**
   ```typescript
   argTypes: {
     variant: {
       control: 'select',
       description: 'Visual style variant',
       options: ['primary', 'secondary'],
     },
   },
   ```

## Folder Structure

```
Frontend/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx    ← Story file
│   │   ├── Button.test.tsx       ← Unit test
│   │   └── index.ts
│   └── UserCard/
│       ├── UserCard.tsx
│       ├── UserCard.stories.tsx
│       └── UserCard.test.tsx
├── .storybook/
│   ├── main.ts
│   └── preview.ts
└── storybook-static/             ← Build output
```

## CI/CD Integration

Add to GitHub Actions:

```yaml
storybook:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npm run storybook:build
    - name: Upload Storybook
      uses: actions/upload-artifact@v4
      with:
        name: storybook
        path: storybook-static/
```

## Runner Agent Validation

When Storybook is active, runner validates:

```bash
# Build must succeed
npm run storybook:build

# Every component must have a story
for component in $(find components -name "*.tsx" ! -name "*.stories.tsx" ! -name "*.test.tsx"); do
  story="${component%.tsx}.stories.tsx"
  [ ! -f "$story" ] && echo "FAIL: Missing story for $component"
done
```

## Activation Checklist

Before activating Storybook requirement:

- [ ] Run `npx storybook@latest init`
- [ ] Configure `.storybook/main.ts`
- [ ] Configure `.storybook/preview.ts`
- [ ] Add scripts to `package.json`
- [ ] Create initial stories for existing components
- [ ] Update runner.md to enforce story requirement
- [ ] Update coder.md with story templates

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [React + Vite Setup](https://storybook.js.org/docs/get-started/react-vite)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)
- [Autodocs](https://storybook.js.org/docs/writing-docs/autodocs)

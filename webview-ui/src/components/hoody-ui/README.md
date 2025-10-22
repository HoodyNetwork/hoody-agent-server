# Hoody UI Library 🎨

Enhanced, reusable UI components for Hoody Code with Gemini-inspired design.

## 🚀 Quick Start

```tsx
import { GeminiScrollbar, HoodyUIShowcase } from "@/components/hoody-ui"

// Use in your component
<GeminiScrollbar variant="autohide" smooth>
  <YourContent />
</GeminiScrollbar>

// Or view the showcase
<HoodyUIShowcase />
```

## 📦 What's Included

### ✅ Completed Components

#### 1. **GeminiScrollbar** - Elegant Scrollbar Component
Minimal, smooth scrollbar inspired by Google Gemini.

**Features:**
- 🎯 Multiple variants: default, minimal, autohide, hidden
- 📏 Size options: thin (6px), default (8px), wide (12px)
- 🌊 Smooth scrolling support
- 🎨 VSCode theme integration
- 🖱️ Hover animations

**Usage:**
```tsx
// Default scrollbar
<GeminiScrollbar>
  <div className="h-[500px]">Long content...</div>
</GeminiScrollbar>

// Autohide variant
<GeminiScrollbar variant="autohide" smooth>
  <div>Content appears with scrollbar on hover</div>
</GeminiScrollbar>

// With ScrollableContainer helper
<ScrollableContainer maxHeight="300px" variant="minimal">
  <div>Easy scrollable content</div>
</ScrollableContainer>
```

**Props:**
```tsx
interface GeminiScrollbarProps {
  variant?: "default" | "minimal" | "autohide" | "hidden"
  size?: "thin" | "default" | "wide"
  smooth?: boolean
  className?: string
  children: React.ReactNode
}
```

#### 2. **HoodyUIShowcase** - Interactive Demo
Live demonstration of all Hoody UI components with interactive examples.

**Features:**
- 📑 Tabbed interface
- 🔍 Live code examples
- 🎮 Interactive controls
- 📱 Responsive design

## 🏗️ Architecture

### Component Structure
```
src/components/hoody-ui/
├── scrollbar/
│   ├── gemini-scrollbar.css     # Scrollbar styles
│   ├── GeminiScrollbar.tsx      # React component
│   └── index.ts                 # Exports
├── HoodyUIShowcase.tsx          # Demo page
├── index.ts                     # Main exports
└── README.md                    # This file
```

### Design Principles

1. **VSCode Theme Integration**
   - All components use VSCode CSS variables
   - Automatic dark/light theme support
   - Consistent with extension UI

2. **Performance First**
   - Minimal re-renders
   - CSS-based animations
   - Efficient event handlers

3. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - ARIA attributes

4. **Reusability**
   - Composable components
   - Flexible props API
   - TypeScript support

## 🎨 Styling System

### Tailwind CSS v4
The library uses Tailwind CSS v4 with modern @layer approach:

```css
@layer theme, base, components, utilities;
```

### VSCode Variables
Access theme colors via Tailwind:

```tsx
className="bg-vscode-editor-background text-vscode-editor-foreground"
```

Available variables:
- `--color-vscode-foreground`
- `--color-vscode-editor-background`
- `--color-vscode-button-background`
- `--color-vscode-focusBorder`
- And 40+ more...

### Custom Utilities
```css
.gemini-scrollbar          /* Base scrollbar */
.gemini-scrollbar-minimal  /* Minimal variant */
.gemini-scrollbar-autohide /* Auto-hide variant */
.gemini-scrollbar-smooth   /* Smooth scrolling */
```

## 📋 Roadmap

### Phase 1: Foundation ✅
- [x] Gemini Scrollbar
- [x] UI Showcase Demo
- [x] Documentation

### Phase 2: Chat Components 🚧
- [ ] Enhanced Chat Container
- [ ] Message Bubble Component
- [ ] Code Block with Copy
- [ ] User/Assistant Message Variants
- [ ] Typing Indicator
- [ ] Message Actions

### Phase 3: Layout Components 📝
- [ ] Chat Layout
- [ ] Sidebar Layout
- [ ] Split View
- [ ] Resizable Panels

### Phase 4: Advanced Features 📝
- [ ] Task History Sidebar
- [ ] Settings Panel
- [ ] Code Diff Viewer
- [ ] File Browser
- [ ] Modal System
- [ ] Notification System

## 🔧 Development

### Adding New Components

1. Create component directory:
```bash
mkdir -p src/components/hoody-ui/my-component
```

2. Create component files:
```tsx
// my-component/MyComponent.tsx
import React from "react"
import "./my-component.css"

export interface MyComponentProps {
  // props
}

export const MyComponent: React.FC<MyComponentProps> = (props) => {
  return <div>My Component</div>
}
```

3. Export in index:
```tsx
// my-component/index.ts
export { MyComponent } from "./MyComponent"
export type { MyComponentProps } from "./MyComponent"

// hoody-ui/index.ts
export * from "./my-component"
```

4. Add to showcase:
```tsx
// HoodyUIShowcase.tsx
const MyComponentShowcase = () => {
  return <MyComponent />
}
```

### Testing Components

1. Run dev server:
```bash
npm run dev
```

2. Import showcase in your app:
```tsx
import { HoodyUIShowcase } from "@/components/hoody-ui"

<HoodyUIShowcase />
```

3. Test in different themes:
- Switch VSCode theme
- Verify colors adapt
- Check contrast ratios

## 📚 Examples

### Example 1: Chat Container with Scrollbar
```tsx
import { GeminiScrollbar } from "@/components/hoody-ui"

export const ChatContainer = () => {
  return (
    <div className="flex h-screen flex-col">
      <header>Chat Header</header>
      
      <GeminiScrollbar variant="autohide" smooth className="flex-1">
        <div className="space-y-4 p-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} {...msg} />
          ))}
        </div>
      </GeminiScrollbar>
      
      <footer>Chat Input</footer>
    </div>
  )
}
```

### Example 2: Settings Panel
```tsx
import { ScrollableContainer } from "@/components/hoody-ui"

export const SettingsPanel = () => {
  return (
    <ScrollableContainer maxHeight="600px" variant="minimal">
      <div className="space-y-6 p-6">
        <SettingsSection title="General">
          <SettingItem />
        </SettingsSection>
      </div>
    </ScrollableContainer>
  )
}
```

## 🤝 Contributing

### Guidelines
1. Follow existing patterns
2. Use TypeScript
3. Include JSDoc comments
4. Add to showcase
5. Update README

### Code Style
```tsx
// ✅ Good
export const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  return <div className="flex flex-col gap-4">...</div>
}

// ❌ Avoid
export function MyComponent(props: any) {
  return <div style={{ display: "flex" }}>...</div>
}
```

## 📖 Resources

### Documentation
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives)
- [React Virtuoso](https://virtuoso.dev/)

### Inspiration
- Google Gemini UI
- VSCode Design
- Vercel Design System

## 📝 License

Part of Hoody Code project.

---

**Built with ❤️ for the Hoody Code community**
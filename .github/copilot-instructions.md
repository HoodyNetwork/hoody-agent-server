# Hoodycode Change Marking Guidelines

We are a fork of Roo. We regularly merge in the Roo codebase. To enable us to merge more easily, we mark all
our own changes with `hoodycode_change` comments.

## Basic Usage

### Single Line Changes

For single line changes, add the comment at the end of the line:

```typescript
let i = 2 // hoodycode_change
```

### Multi-line Changes

For multiple consecutive lines, wrap them with start/end comments:

```typescript
// hoodycode_change start
let i = 2
let j = 3
// hoodycode_change end
```

## Language-Specific Examples

### HTML/JSX/TSX

```html
{/* hoodycode_change start */}
<CustomHoodyComponent />
{/* hoodycode_change end */}
```

### CSS/SCSS

```css
/* hoodycode_change */
.hoodycode-specific-class {
	color: blue;
}

/* hoodycode_change start */
.another-class {
	background: red;
}
/* hoodycode_change end */
```

## Special Cases

### Hoodycode specific file

if the filename or directory name contains hoodycode no marking with comments is required

### New Files

If you're creating a completely new file that doesn't exist in Roo, add this comment at the top:

```
// hoodycode_change - new file
```

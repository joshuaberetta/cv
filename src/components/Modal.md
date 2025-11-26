# Modal Component

A reusable modal component for displaying expanded content with overlay and close functionality.

## Features

- **Keyboard Support**: Close with Escape key
- **Click Outside**: Close by clicking the overlay
- **Body Scroll Lock**: Prevents scrolling when modal is open
- **Animations**: Smooth fade-in and slide-up animations
- **Accessible**: Includes ARIA labels and keyboard navigation
- **Responsive**: Adapts to mobile screens

## Usage

```tsx
import Modal from '../components/Modal';

const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <div className="modal-body">
    {/* Your content here */}
  </div>
</Modal>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls whether modal is visible |
| `onClose` | `() => void` | Yes | Callback fired when modal should close |
| `children` | `React.ReactNode` | Yes | Content to display in modal |

## Modal Body Classes

The modal provides several CSS classes for styling content:

- `.modal-body` - Main container for modal content (includes padding)
- `.modal-details` - Grid layout for detail items
- `.modal-detail-item` - Individual detail row
- `.modal-tags` - Container for tag pills
- `.modal-tag` - Individual tag style
- `.modal-link` - Styled link button

## Examples

### Project Modal
```tsx
<Modal isOpen={isOpen} onClose={handleClose}>
  <div className="modal-body">
    <h2>Project Name</h2>
    <p>Description of the project...</p>
    <div className="modal-tags">
      <span className="modal-tag">React</span>
      <span className="modal-tag">TypeScript</span>
    </div>
    <a href="..." className="modal-link">
      View Project
    </a>
  </div>
</Modal>
```

### Details Modal
```tsx
<Modal isOpen={isOpen} onClose={handleClose}>
  <div className="modal-body">
    <h2>Title</h2>
    <h3>Subtitle</h3>
    <div className="modal-details">
      <span className="modal-detail-item">📍 Location</span>
      <span className="modal-detail-item">📅 Date</span>
    </div>
  </div>
</Modal>
```

## Current Usage

The Modal component is used in the Globe Page for expanding:
1. Project cards - Shows full description, all tags, and link to project
2. Training cards - Shows full training details and location info
3. Work experience cards - Shows complete job details and dates

## Styling

- Background overlay: Black with 70% opacity
- Modal background: Portfolio cream (#FCF6E5)
- Border: Gray (#6A7A82)
- Close button: Circular with hover state (pink on hover)
- Links: Portfolio blue (#3388F8) on hover

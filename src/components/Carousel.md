# Carousel Component

A reusable, responsive carousel component for displaying multiple items with navigation controls.

## Features

- **Responsive**: Automatically adjusts items per view based on screen width
  - Desktop (>900px): Shows configured `itemsPerView`
  - Tablet (600-900px): Shows max 2 items
  - Mobile (<600px): Shows 1 item
- **Navigation**: Previous/Next buttons and indicator dots
- **Smooth Transitions**: CSS-based animations for smooth sliding
- **Accessible**: Includes ARIA labels and keyboard navigation support
- **Customizable**: Configure items per view and gap spacing

## Usage

```tsx
import Carousel from '../components/Carousel';

// Basic usage with 3 items per view
<Carousel itemsPerView={3} gap={24}>
  {items.map((item, index) => (
    <div key={index} className="your-card">
      {/* Your content */}
    </div>
  ))}
</Carousel>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode[]` | required | Array of elements to display in carousel |
| `itemsPerView` | `number` | `3` | Number of items visible at once (desktop) |
| `gap` | `number` | `24` | Space between items in pixels |

## Examples

### Projects Carousel (3 items)
```tsx
<Carousel itemsPerView={3} gap={24}>
  {projects.map((project, index) => (
    <ProjectCard key={index} project={project} />
  ))}
</Carousel>
```

### Work Experience Carousel (2 items)
```tsx
<Carousel itemsPerView={2} gap={24}>
  {jobs.map((job, index) => (
    <WorkCard key={index} job={job} />
  ))}
</Carousel>
```

### Trainings Carousel (3 items)
```tsx
<Carousel itemsPerView={3} gap={24}>
  {trainings.map((training, index) => (
    <TrainingCard key={index} training={training} />
  ))}
</Carousel>
```

## Styling

The carousel component uses its own CSS file (`Carousel.css`) which includes:
- Navigation buttons with hover states
- Indicator dots with active states
- Responsive breakpoints
- Portfolio theme colors (cream, gray, pink, blue)

Card styles should be defined in your own component/page CSS files.

## Current Usage in Project

The Carousel component is currently used in the Globe Page for:
1. **Projects & Tools** - 3 items per view
2. **Trainings & Workshops** - 3 items per view
3. **Work Experience** - 2 items per view

All carousels automatically adapt to mobile and tablet screens.

# CSS Structure

This directory contains all the styles for the BrickByte application. The styles are organized in a modular way to maintain scalability and ease of maintenance.

## Directory Structure

```
styles/
├── base.css           # Global styles and CSS reset
├── index.css          # Main entry point that imports all styles
├── components/        # Reusable component styles
│   ├── navbar.css
│   ├── property-card.css
│   ├── transaction-form.css
│   └── loading.css
└── pages/            # Page-specific styles
    ├── properties.css
    ├── property-detail.css
    ├── create-property.css
    ├── my-shares.css
    ├── login.css
    └── register.css
```

## Style Organization

### Base Styles (`base.css`)
- CSS reset
- Typography
- Layout utilities
- Grid system
- Responsive breakpoints
- Common utility classes

### Component Styles (`components/`)
- Reusable UI components
- Each component has its own CSS file
- Follows BEM naming convention
- Includes responsive styles

### Page Styles (`pages/`)
- Page-specific styles
- Layout and composition of components
- Page-specific responsive adjustments

## Usage

1. Import the main stylesheet in your application:
```javascript
import './styles/index.css';
```

2. Use the provided utility classes for common styling needs:
```html
<div class="container">
  <div class="grid grid-3">
    <!-- Grid items -->
  </div>
</div>
```

3. Follow the BEM naming convention for custom components:
```css
.block__element--modifier {
  /* styles */
}
```

## Best Practices

1. Keep component styles modular and self-contained
2. Use utility classes for common styling needs
3. Follow the mobile-first approach for responsive design
4. Maintain consistent naming conventions
5. Document any complex styles or hacks
6. Test styles across different browsers and devices

## Adding New Styles

1. For new components:
   - Create a new file in `components/`
   - Import it in `index.css`

2. For new pages:
   - Create a new file in `pages/`
   - Import it in `index.css`

3. For global styles:
   - Add to `base.css` if they're truly global
   - Consider creating a new component if they're specific to a feature 
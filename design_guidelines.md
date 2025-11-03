# Solar Quote Management System - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with Glassmorphism Aesthetic

Drawing inspiration from Apple's macOS Big Sur glassmorphism, Stripe's premium fintech interfaces, and Linear's sophisticated SaaS design. The glassmorphism treatment creates a premium, trustworthy feel essential for high-value solar installations while maintaining form functionality.

**Core Principles:**
- Depth through layered transparency
- Premium feel through refined glass effects
- Trust through clarity and polish
- Efficiency through progressive disclosure

---

## Typography

**Font Families:**
- Primary: Inter (Google Fonts) - body text, form labels, buttons
- Display: Outfit (Google Fonts) - headings, step titles, hero text

**Hierarchy:**
- Hero Headline: Outfit, 56px/64px, weight 700
- Section Headers: Outfit, 40px/48px, weight 600
- Step Titles: Outfit, 32px/40px, weight 600
- Subsection Headers: Inter, 24px/32px, weight 600
- Body Text: Inter, 16px/24px, weight 400
- Form Labels: Inter, 14px/20px, weight 500, letter-spacing 0.02em, uppercase
- Input Text: Inter, 16px/24px, weight 400
- Helper Text: Inter, 14px/20px, weight 400
- Button Text: Inter, 16px/24px, weight 600

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24

**Container Strategy:**
- Page container: max-w-7xl, centered
- Form container: max-w-4xl, centered
- Content sections: px-4 mobile, px-8 desktop

**Grid System:**
- Form steps: Single column with max-w-2xl for optimal reading
- Supporting info panels: 2-column grid on desktop (form + sidebar info)
- Step indicator: Horizontal flex layout
- Benefits section: 3-column grid (grid-cols-1 md:grid-cols-3)

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Frosted glass navbar with backdrop-blur-lg effect
- Semi-transparent background with subtle gradient border
- Logo left, navigation center, CTA button right
- Sticky positioning with shadow-on-scroll behavior
- Height: 20 units (80px)

### Hero Section
**Full-Width Hero with Glassmorphic Overlay:**
- Hero height: 80vh minimum
- Large background image with gradient overlay
- Centered glassmorphic card containing:
  - Headline and subheadline
  - Primary CTA button (blurred background)
  - Trust indicators (client count, reviews)
- Card specs: backdrop-blur-2xl, rounded-3xl, padding-16, subtle shadow-2xl

### Multi-Step Form System

**Step Indicator Component:**
- Horizontal timeline with 4 connected steps
- Each step: Circle (12 units diameter) with step number
- Active step: Larger scale (1.1x), elevated shadow
- Completed steps: Checkmark icon
- Connecting lines: Semi-transparent with gradient
- Below circles: Step labels (14px)
- Spacing between steps: Equal distribution across container

**Form Card Container:**
- Glassmorphic panel: backdrop-blur-xl, rounded-2xl
- Padding: 12 units all sides
- Subtle gradient border (1px)
- Floating shadow: shadow-2xl with custom blur
- Min-height: 600px for consistent size across steps

**Step 1 - Property Information:**
Layout: Single column form
- Address autocomplete field (large, prominent)
- Property type selector (radio cards in 2-column grid)
- Roof type selector (dropdown with icons)
- Average monthly energy bill (currency input with helper text)
- Each field group: spacing-6 between

**Step 2 - Energy Usage:**
Layout: Mixed column
- Upload utility bill area (large dropzone, glassmorphic)
- Energy consumption slider with visual feedback
- Peak usage times (checkbox group, 3-column grid)
- Monthly kwh input with live cost calculator
- Side panel: Energy savings visualization chart

**Step 3 - System Preferences:**
Layout: Card-based selections
- Panel preference cards (3 options, grid-cols-3)
- Each card: Image top, title, features list, select button
- Battery storage toggle with expandable specs
- Financing options (radio cards with payment breakdown)
- Installation timeline preference (horizontal date picker)

**Step 4 - Contact & Review:**
Layout: Split view (60/40)
- Left: Contact form (name, email, phone, preferred contact time)
- Right: Quote summary panel
  - System specs recap
  - Estimated costs (prominent)
  - Projected savings timeline
  - Next steps list
- Bottom: Terms checkbox, submit button (large, prominent)

**Form Input Specifications:**
- Text inputs: backdrop-blur-md, rounded-xl, padding-4, border with subtle gradient
- Focus state: Enhanced glow, scale-101
- Dropdowns: Custom styled with glassmorphic dropdown menu
- Radio/Checkbox: Custom with glass effect on selection
- Buttons: Primary (glass with gradient), Secondary (ghost glass)
- All inputs: 12 units height, smooth transitions (300ms)

### Supporting Sections

**Benefits Grid (Below Form):**
- 3 cards in grid layout
- Each card: Icon top (16 units size), title, description
- Glass treatment matching form aesthetic
- Hover: Subtle lift and enhanced glow
- Spacing: gap-8

**Trust Section:**
- Partner logos in glassmorphic containers
- Certification badges
- Customer testimonial cards (2-column)
- Each element: consistent glass treatment

**Footer:**
- Glassmorphic footer bar
- 4-column grid: Company info, Quick links, Resources, Contact
- Newsletter signup with glass input
- Social icons with hover glass effect
- Bottom bar: Copyright, legal links

### Interactive Elements

**Buttons:**
- Primary CTA: Large (padding-6 x-12), glass with gradient border, shadow-xl
- Secondary: Ghost glass, border-only
- Icon buttons: Square (12 units), centered icon
- All: Hover scale-105, enhanced shadow, 300ms transitions

**Progress Indicators:**
- Linear progress bar below step indicator
- Glassmorphic track with gradient fill
- Smooth animation on step completion

**Tooltips & Popovers:**
- Small glassmorphic cards
- backdrop-blur-lg, rounded-lg
- Arrow pointer with matching glass effect
- Fade-in animation (200ms)

---

## Animations

**Micro-interactions Only:**
- Form validation: Shake on error (subtle)
- Step transitions: Fade and slide (400ms)
- Input focus: Glow expansion (200ms)
- Button hover: Scale and shadow (300ms)
- Card hover: Lift and glow (300ms)

**No page-load animations** - instant content display

---

## Images

**Required Images:**

1. **Hero Background Image:**
   - Modern solar panel installation on residential roof
   - Bright, clean, daytime shot
   - High resolution, subtle vignette for text readability
   - Position: Cover, center
   - Treatment: Gradient overlay (dark to transparent, bottom to top)

2. **System Preference Cards (Step 3):**
   - Three product images: Standard panels, Premium panels, Luxury panels
   - Clean product shots on neutral backgrounds
   - Size: 400x300px each
   - Rounded corners to match card design

3. **Benefits Section Icons/Illustrations:**
   - Iconography for: Cost savings, Environmental impact, Energy independence
   - Modern, minimalist illustration style
   - SVG format preferred from Heroicons library

4. **Trust Section:**
   - Partner logos (Tesla, Enphase, SunPower, etc.)
   - Certification badges (Energy Star, NABCEP)
   - Optional: Customer installation photos (2-3 real examples)

**Large Hero Image:** YES - Full-width hero with glassmorphic overlay card centered

---

## Accessibility

- WCAG AA compliant contrast ratios despite transparency
- All form inputs: Visible labels, clear focus states
- Keyboard navigation: Tab order follows visual flow
- Screen reader: ARIA labels on all interactive elements
- Error messages: Clear, actionable, visible to assistive tech
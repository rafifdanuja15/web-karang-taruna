---
name: Kinetic Community
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#002e44'
  on-tertiary: '#ffffff'
  tertiary-container: '#004565'
  on-tertiary-container: '#36b6fb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  button:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: auto
  max-width: 1200px
---

## Brand & Style

The design system is engineered to represent a modern youth organization—balancing the seriousness of community leadership with the vibrant energy of youth. The brand personality is proactive, inclusive, and structured. 

The design style follows a **Modern Corporate** aesthetic with **High-Contrast** accents. It utilizes ample whitespace and a clear information hierarchy to ensure accessibility for all community members, while using bold color blocks and purposeful motion to maintain a contemporary feel. The emotional response should be one of trust, momentum, and collective empowerment.

## Colors

This design system uses a high-contrast palette to drive action and legibility. 

- **Primary (Deep Blue):** Represents stability, tradition, and professional governance. Used for navigation, primary buttons, and structural headings.
- **Secondary (Energetic Orange):** Represents youth, creativity, and vigor. Used sparingly for calls-to-action (CTAs), notification badges, and interactive highlights.
- **Tertiary (Sky Blue):** Provides a bridge between the deep blue and the background, used for secondary actions or category tags.
- **Neutral:** A slate-based scale used for body text and subtle borders to keep the UI grounded and legible.
- **Background/Surface:** A crisp off-white background with pure white surfaces creates a "layered" effect that feels clean and organized.

## Typography

**Hanken Grotesk** is the sole typeface for this design system to ensure a unified, modern, and highly legible appearance across all touchpoints.

- **Display & Headlines:** Use heavy weights (700-800) to establish authority. Tighten letter spacing slightly for a more "impactful" look.
- **Body Text:** Use a standard weight (400) with generous line height (1.5x) to ensure long-form content about community programs remains readable.
- **Labels:** Use uppercase and increased letter spacing for small metadata or overlines to distinguish them from body content.

## Layout & Spacing

The layout utilizes a **12-column fixed grid** for desktop and a **4-column fluid grid** for mobile. 

- **Desktop:** The content is centered within a 1200px container. This prevents line lengths from becoming too long on ultra-wide monitors.
- **Mobile:** Margins are reduced to 16px to maximize screen real estate for content.
- **Rhythm:** All spacing follows a 4px/8px base-8 system. Vertical section spacing should be aggressive (xxl) to create a distinct separation between different initiatives and programs.

## Elevation & Depth

To maintain a professional yet accessible feel, the design system avoids heavy shadows. Instead, it uses **Tonal Layers** and **Soft Ambient Shadows**.

- **Level 0 (Background):** Base color of the page.
- **Level 1 (Cards/Surface):** White background with a subtle 1px border (#E2E8F0).
- **Level 2 (Hover/Active):** A very diffused, low-opacity shadow (Color: Primary, Alpha: 0.08, Blur: 20px) to indicate interactivity.
- **Overlays:** Modals and dropdowns use a medium shadow with a backdrop blur (8px) to maintain context of the underlying page while focusing user attention.

## Shapes

The shape language is defined as **Rounded**. This choice softens the "corporate" edge of the deep blue color palette, making the organization feel more approachable to a younger demographic.

- **Buttons & Inputs:** Use the standard `rounded` (0.5rem) setting.
- **Cards & Large Containers:** Use `rounded-lg` (1rem) to frame content comfortably.
- **Featured Sections:** Use `rounded-xl` (1.5rem) for hero background sections to create a modern, "app-like" feel on the landing page.

## Components

### Buttons
- **Primary:** Deep Blue background with white text. High-contrast, bold weight.
- **Secondary (CTA):** Energetic Orange background. Used only for the most important action on the page (e.g., "Join Us").
- **Ghost:** Transparent background with a Primary Blue outline. Used for secondary navigation or "Read More" links.

### Cards
- Cards must feature a 1px border. For news or event cards, the image should be at the top with a `rounded-t` corner treatment. Include a Padding of `lg` (24px) for the content area inside the card.

### Inputs
- Fields should have a light grey background (#F1F5F9) to distinguish them from the white surface. On focus, the border transitions to Primary Blue with a 2px stroke.

### Chips/Tags
- Used for categorizing youth programs (e.g., "Sports", "Education", "Arts"). Use a light tint of the Primary color (Alpha 0.1) for the background and the pure Primary color for the text.

### Progress Bars
- Essential for showing "Fundraising" or "Project Completion" status. Use a subtle grey track with the Secondary Orange as the fill color to represent energy and progress.
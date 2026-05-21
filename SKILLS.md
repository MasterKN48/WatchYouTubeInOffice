---
name: design-teams-live-com
description: Design system extracted from Microsoft Teams meeting (https://teams.live.com/light-meetings/launch?p=jtHLUDY3Dl9kJ3j2xR&anon=true&v=.jlw&launchType=web&lightExperience=true&correlationId=0f069138-fbc6-4016-8a74-248fd9f72fab&agent=web&coords=eyJtZWV0aW5nVXJsIjoiaHR0cHM6Ly90ZWFtcy5saXZlLmNvbS9tZWV0LzkzODE0NTM3NjU3OTE%2FcD1qdEhMVURZM0RsOWtKM2oyeFImYW5vbj10cnVlJnY9LmpsdyZsYXVuY2hUeXBlPXdlYiZsaWdodEV4cGVyaWVuY2U9dHJ1ZSZjb3JyZWxhdGlvbklkPTBmMDY5MTM4LWZiYzYtNDAxNi04YTc0LTI0OGZkOWY3MmZhYiZhbm9uPXRydWUiLCJtZWV0aW5nQ29kZSI6IjkzODE0NTM3NjU3OTEiLCJwYXNzY29kZSI6Imp0SExVRFkzRGw5a0ozajJ4UiJ9&deeplinkId=05b384aa-7005-411a-a34e-43a621987ea9). Use when building UI that should match this brand's visual identity.
triggers:
  - "Microsoft Teams meeting"
  - "teams-live-com"
  - "design like Microsoft Teams meeting"
  - "Microsoft Teams meeting風"
source: https://teams.live.com/light-meetings/launch?p=jtHLUDY3Dl9kJ3j2xR&anon=true&v=.jlw&launchType=web&lightExperience=true&correlationId=0f069138-fbc6-4016-8a74-248fd9f72fab&agent=web&coords=eyJtZWV0aW5nVXJsIjoiaHR0cHM6Ly90ZWFtcy5saXZlLmNvbS9tZWV0LzkzODE0NTM3NjU3OTE%2FcD1qdEhMVURZM0RsOWtKM2oyeFImYW5vbj10cnVlJnY9LmpsdyZsYXVuY2hUeXBlPXdlYiZsaWdodEV4cGVyaWVuY2U9dHJ1ZSZjb3JyZWxhdGlvbklkPTBmMDY5MTM4LWZiYzYtNDAxNi04YTc0LTI0OGZkOWY3MmZhYiZhbm9uPXRydWUiLCJtZWV0aW5nQ29kZSI6IjkzODE0NTM3NjU3OTEiLCJwYXNzY29kZSI6Imp0SExVRFkzRGw5a0ozajJ4UiJ9&deeplinkId=05b384aa-7005-411a-a34e-43a621987ea9
extractedAt: 2026-05-21T18:14:25.710Z
tags: ["light", "rounded", "accented", "compact", "sans-serif"]
---
# Design System Inspired by Microsoft Teams meeting

> Auto-extracted from `https://teams.live.com/light-meetings/launch?p=jtHLUDY3Dl9kJ3j2xR&anon=true&v=.jlw&launchType=web&lightExperience=true&correlationId=0f069138-fbc6-4016-8a74-248fd9f72fab&agent=web&coords=eyJtZWV0aW5nVXJsIjoiaHR0cHM6Ly90ZWFtcy5saXZlLmNvbS9tZWV0LzkzODE0NTM3NjU3OTE%2FcD1qdEhMVURZM0RsOWtKM2oyeFImYW5vbj10cnVlJnY9LmpsdyZsYXVuY2hUeXBlPXdlYiZsaWdodEV4cGVyaWVuY2U9dHJ1ZSZjb3JyZWxhdGlvbklkPTBmMDY5MTM4LWZiYzYtNDAxNi04YTc0LTI0OGZkOWY3MmZhYiZhbm9uPXRydWUiLCJtZWV0aW5nQ29kZSI6IjkzODE0NTM3NjU3OTEiLCJwYXNzY29kZSI6Imp0SExVRFkzRGw5a0ozajJ4UiJ9&deeplinkId=05b384aa-7005-411a-a34e-43a621987ea9` on 2026-05-21

## 1. Visual Theme & Atmosphere

Friendly, approachable design with rounded shapes and generous whitespace.

**Key Characteristics:**

- Inter as the heading font
- -apple-system as the body font for all running text
- Light/white background (#ffffff) as the primary canvas
- Primary accent `#d13438` used for CTAs and brand highlights
- 2 shadow level(s) detected — tinted shadows
- Rounded corners (4px+) creating a friendly, approachable feel
- Tags: light, rounded, accented, compact, sans-serif

## 2. Color Palette & Roles

### Primary

- **Primary Accent** (`#d13438`) · `--color-primary`: Brand color, CTA backgrounds, link text, interactive highlights.
- **Background** (`#ffffff`) · `--color-bg`: Page background, primary canvas.
- **Background Secondary** (`#1f1f1f`) · `--color-bg-secondary`: Cards, surfaces, alternating sections.

### Text

- **Text Primary** (`#000000`) · `--color-text`: Headings and body text.
- **Text Secondary** (`#666666`) · `--color-text-secondary`: Muted text, captions, placeholders.

### Borders & Surfaces

- **Border** (`#292929`) · `--color-border`: Dividers, outlines, input borders.

### Full Extracted Palette

| # | Hex | CSS Variable | Role | Area | Contrast |
|---|---|---|---|---|---|
| 1 | `#292929` | `--palette-1` | block | large | text-light |
| 2 | `#1f1f1f` | `--palette-2` | block | medium | text-light |
| 3 | `#d13438` | `--palette-3` | button | small | text-light |
| 4 | `#000000` | `--palette-4` | badge | small | text-light |

## 3. Typography Rules

- **Heading Font:** `Inter`, sans-serif
- **Body Font:** `-apple-system`, sans-serif

### Type Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H3 | -apple-system | 16px | 700 | 22px | normal |
| Body | -apple-system | 14px | 400 | 20.0004px | normal |

### Type Scale

| Token | Size | Suggested Usage |
|---|---|---|
| Display | `25px` | headings |
| H1 | `20px` | headings |
| H2 | `16px` | headings |
| H3 | `14px` | headings |
| H4 | `13px` | headings |
| Body L | `12px` | body / supporting text |
| Body | `11px` | body / supporting text |
| Small | `10px` | body / supporting text |

## 4. Component Stylings

### Primary Button

```css
.btn-primary {
  background: transparent;
  color: #ffffff;
  border-radius: 4px;
  padding: 0px 0px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0);
  cursor: pointer;
}
```

### Outline Button

```css
.btn-outline {
  background: transparent;
  color: #d6d6d6;
  border-radius: 4px;
  padding: 0px 0px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0);
  cursor: pointer;
}
```

### Outline Button 2

```css
.btn-outline-2 {
  background: transparent;
  color: #5c5c5c;
  border-radius: 4px;
  padding: 0px 0px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0);
  cursor: pointer;
}
```

### Filled Button

```css
.btn-filled {
  background: #d13438;
  color: #ffffff;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
```

### Ghost Button

```css
.btn-ghost {
  background: transparent;
  color: #d6d6d6;
  border-radius: 4px;
  padding: 5px 5px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}
```

## 5. Layout Principles

- **Base spacing unit:** `4px` — use multiples (8px, 12px, 16px, etc.)

### Spacing Scale (extracted from real elements)

| Token | Value | Role |
|---|---|---|
| spacing-1 | `4px` | element |
| spacing-2 | `5px` | element |
| spacing-3 | `2px` | element |
| spacing-4 | `1px` | element |
| spacing-5 | `8px` | element |
| spacing-6 | `10px` | element |

### Border Radius Scale

| Token | Value | Element |
|---|---|---|
| radius-subtle | `4px` | subtle |
| radius-button | `6px` | button |
| radius-card | `50px` | card |
| radius-subtle | `2px` | subtle |

## 6. Depth & Elevation

| Level | Shadow | Usage |
|---|---|---|
| Low | `rgba(0, 0, 0, 0.48) 0px 0.1px 1px 0.1px` | Cards, subtle elevation |
| Low | `rgb(117, 121, 235) 0px -4px 0px -2px inset` | Cards, subtle elevation |

## 7. Do's and Don'ts

### Do

- Use `#ffffff` as the primary background color
- Use `Inter` for all headings and `-apple-system` for body text
- Use `#d13438` as the single dominant accent/CTA color
- Maintain `4px` as the base spacing unit — all gaps should be multiples
- Use rounded corners (`4px`+) consistently for all interactive elements
- Apply the shadow system for elevation — use the extracted shadow values

### Don't

- Don't use colors outside the extracted palette without justification
- Don't substitute Inter/-apple-system with generic alternatives
- Don't use irregular spacing — stick to 4px grid
- Don't use dark/black backgrounds — this is a light-themed design
- Don't use sharp corners — they feel hostile in this rounded design language
- Don't use oversized hero text — this brand uses restrained type
- Don't use pure black (#000000) for text — use `#000000` instead
- Don't add decorative elements not present in the original design — no badges, ribbons, banners, or ornaments unless the source site uses them
- Don't invent UI patterns the source site doesn't have — if the original has no NEW badge, don't add one just because a red is in the palette

## 8. Responsive Behavior

| Breakpoint | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, stack sections, reduce font sizes ~80% |
| Tablet | 640–1024px | 2-column where appropriate, maintain spacing ratios |
| Desktop | 1024–1440px | Full layout as designed |
| Wide | > 1440px | Max-width container, center content |

- Touch targets: minimum 44×44px on mobile
- Maintain 4px base unit across breakpoints — only scale multipliers

## 9. Agent Prompt Guide

### Quick Color Reference

```
Background:  #ffffff
Text:        #000000
Accent:      #d13438
Border:      #292929
```

### Example Prompts

1. "Build a hero section with a `#ffffff` background, `Inter` heading in `#000000`, and a `#d13438` CTA button with 4px radius."
2. "Create a pricing card using background `#1f1f1f`, border `#292929`, `-apple-system` for text, and 12px padding."
3. "Design a navigation bar — `#ffffff` background, `#000000` links, `#d13438` for active state."
4. "Build a feature grid with 3 columns, 12px gap, each card using the card component style."
5. "Create a footer with `#000000` background, `#ffffff` text, and 8px padding."

### Iteration Guide

1. Start with layout structure (sections, grid, spacing)
2. Apply colors from the palette — background first, then text, then accents
3. Set typography — font families, sizes from the type scale, weights
4. Add components — buttons, cards, inputs using the specs above
5. Apply border-radius consistently across all elements
6. Add shadows for depth — use the extracted shadow values, not defaults
7. Check responsive behavior — test mobile and tablet layouts
8. Final pass — verify all colors match, spacing is consistent, fonts are correct

## 10. CSS Custom Properties

> 66 custom properties extracted from `:root` / `html` stylesheets.

### Color Variables

| Variable | Value |
|---|---|
| `--themeCarouselTextColor` | `#616161` |
| `--themeLoadingScreenColor` | `#f0f0f0` |
| `--ck-color-base-foreground` | `#fafafa` |
| `--ck-color-base-background` | `#fff` |
| `--ck-color-base-border` | `#ccced1` |
| `--ck-color-base-action` | `#53a336` |
| `--ck-color-base-focus` | `#6cb5f9` |
| `--ck-color-base-text` | `#333` |
| `--ck-color-base-active` | `#2977ff` |
| `--ck-color-base-active-focus` | `#0d65ff` |
| `--ck-color-base-error` | `#db3700` |
| `--ck-color-focus-border` | `hsl(var(--ck-color-focus-border-coordinates))` |
| `--ck-color-focus-outer-shadow` | `#cae1fc` |
| `--ck-color-focus-disabled-shadow` | `rgba(119,186,248,.3)` |
| `--ck-color-focus-error-shadow` | `rgba(255,64,31,.3)` |
| `--ck-color-shadow-drop` | `rgba(0,0,0,.15)` |
| `--ck-color-shadow-drop-active` | `rgba(0,0,0,.2)` |
| `--ck-color-shadow-inner` | `rgba(0,0,0,.1)` |
| `--ck-color-engine-placeholder-text` | `#707070` |
| `--ck-color-link-default` | `#0000f0` |
| `--ck-color-link-selected-background` | `rgba(31,176,255,.1)` |
| `--ck-color-link-fake-selection` | `rgba(31,176,255,.3)` |
| `--ck-color-editable-blur-selection` | `#d9d9d9` |
| `--ck-color-selector-focused-cell-background` | `rgba(158,201,250,.3)` |
| `--ck-table-selected-cell-background` | `rgba(158,207,250,.3)` |

### Spacing Variables

| Variable | Value |
|---|---|
| `--ck-z-default` | `1` |
| `--ck-disabled-opacity` | `.5` |
| `--ck-ui-component-min-height` | `2.3em` |
| `--ck-border-radius` | `2px` |
| `--ck-spacing-unit` | `0.6em` |
| `--ck-resizer-size` | `10px` |
| `--ck-resizer-border-width` | `1px` |
| `--ck-list-style-button-size` | `44px` |

### Typography Variables

| Variable | Value |
|---|---|
| `--ck-color-text` | `var(--ck-color-base-text)` |
| `--ck-color-list-button-on-text` | `var(--ck-color-base-background)` |
| `--ck-font-size-base` | `13px` |
| `--ck-line-height-base` | `1.84615` |
| `--ck-font-face` | `Helvetica,Arial,Tahoma,Verdana,Sans-Serif` |
| `--ck-font-size-tiny` | `0.7em` |
| `--ck-font-size-small` | `0.75em` |
| `--ck-font-size-normal` | `1em` |
| `--ck-font-size-big` | `1.4em` |
| `--ck-font-size-large` | `1.8em` |

### Other Variables

| Variable | Value |
|---|---|
| `--ck-z-modal` | `calc(var(--ck-z-default) + 999)` |
| `--ck-color-focus-border-coordinates` | `218,81.8%,56.9%` |
| `--ck-color-list-background` | `var(--ck-color-base-background)` |
| `--ck-color-list-button-hover-background` | `var(--ck-color-button-default-hover-background)` |
| `--ck-color-list-button-on-background` | `var(--ck-color-button-on-color)` |
| `--ck-color-list-button-on-background-focus` | `var(--ck-color-button-on-color)` |
| `--ck-focus-outer-shadow-geometry` | `0 0 0 3px` |
| `--ck-focus-outer-shadow` | `var(--ck-focus-outer-shadow-geometry) var(--ck-color-focus-outer-shadow)` |
| `--ck-focus-disabled-outer-shadow` | `var(--ck-focus-outer-shadow-geometry) var(--ck-color-focus-disabled-shadow)` |
| `--ck-focus-error-outer-shadow` | `var(--ck-focus-outer-shadow-geometry) var(--ck-color-focus-error-shadow)` |
| `--ck-focus-ring` | `1px solid var(--ck-color-focus-border)` |
| `--ck-inner-shadow` | `2px 2px 3px var(--ck-color-shadow-inner) inset` |
| `--ck-drop-shadow` | `0 1px 2px 1px var(--ck-color-shadow-drop)` |
| `--ck-drop-shadow-active` | `0 3px 6px 1px var(--ck-color-shadow-drop-active)` |
| `--ck-spacing-large` | `calc(var(--ck-spacing-unit)*1.5)` |
| ... | *(8 more)* |

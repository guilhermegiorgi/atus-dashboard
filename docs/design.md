---
tokens:
  color:
    background: "#000000"
    text_primary: "#FFFFFF"
    text_secondary: "rgba(255,255,255,0.6)"
    text_muted: "rgba(255,255,255,0.4)"

    border:
      subtle: "rgba(255,255,255,0.12)"
      hover: "rgba(255,255,255,0.25)"

    surface:
      pill: "rgba(255,255,255,0.04)"
      pill_active: "rgba(255,255,255,0.08)"

  typography:
    family:
      display: "Inter, SF Pro Display, system-ui"
      body: "Inter, system-ui"

    scale:
      hero:
        size: "64px"
        lineHeight: 1.05
        weight: 500
        letterSpacing: "-0.02em"

      body:
        size: "16px"
        lineHeight: 1.6
        weight: 400

      small:
        size: "14px"
        lineHeight: 1.4

    emphasis:
      style: italic
      opacity: 0.85

  spacing:
    xs: "4px"
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "40px"
    section: "80px"

  radius:
    pill: "999px"

  motion:
    fast: "150ms"
    base: "300ms"
    slow: "600ms"
    easing: "cubic-bezier(0.22, 1, 0.36, 1)"

---

# Design System — Blackstar

## Overview

Ultra-minimalist dark interface focused on:
- typography as primary UI
- subtle interaction
- extreme visual restraint

This is not a component-heavy system.

It is **perception-driven design**.

---

## Typography

### Hero Headline

Structure:
- Two lines
- Last word italicized

Example:
"The computer,
made *personal.*"

Rules:
- Weight: medium (500)
- Tight letter spacing
- Line height compressed
- No bold usage

### Emphasis

- Italic only
- Slight opacity reduction
- Used for 1 word max

Never:
- entire sentence
- multiple words

---

## Color Usage

- Pure black background
- No gradients in UI layer
- No colored accents

Text hierarchy:
1. White (primary)
2. 60% opacity (secondary)
3. 40% opacity (muted)

---

## Buttons (CRITICAL)

### Primary CTA

Style:
- Outline only
- No fill
- Rounded pill

Properties:
- Border: subtle white (low opacity)
- Background: transparent

Hover:
- Border becomes brighter
- Background gets slight fill (~4%)
- Smooth transition

Interaction:
- No scale jump
- No glow
- No shadow

---

## Navigation Pills

Style:
- Semi-transparent background
- Rounded pill
- Low contrast

States:

Default:
- Background: very subtle

Active:
- Slightly brighter background
- Stronger text

Hover:
- Increase opacity slightly

Important:
- No borders
- No heavy blur
- No shadows

---

## Badge (News)

Style:
- Pill shape
- Subtle border OR subtle fill
- Small text

Typography:
- uppercase optional
- high tracking

---

## Layout

- 2 column hero
- Left = text
- Right = visual

Max width:
- ~1400–1700px

Spacing:
- very generous
- lots of negative space

---

## Motion

### Entry

- fade in
- slight upward movement (~10px)
- staggered delays

### Hover

- opacity change only
- maybe slight background fill

Never:
- bounce
- aggressive easing
- large transforms

---

## Depth

No shadows.

Depth is created by:
- contrast
- spacing
- typography weight

---

## Visual Strategy

Image/3D:
- high contrast
- partially hidden
- asymmetrical

Text must always dominate.

---

## Do / Don't

### Do
- remove elements aggressively
- use whitespace
- rely on typography
- keep UI silent

### Don’t
- use bright colors
- add shadows
- use heavy glassmorphism
- overdesign components

---

## Core Principle

"If it looks designed, it's already too much."

Reduce until it feels obvious.
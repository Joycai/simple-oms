# Joycai Project: Visual Style Standard (v1.1)

> "The layout should be as organized as a library, and the interface as inviting as a well-read book."

## 1. Aesthetic Concept: "The Modern Library"
Inspired by the atmosphere of a classic study—combining the warmth of wood and old paper with the precision of modern typography. We aim for a look that is **Professional, Focused, and Scholarly**.

## 2. Color Palette (The Library's Pigments)

We use a mix of Tailwind's built-in colors and custom shades to achieve the "Modern Library" feel.

### Neutral & Surfaces
- **Background**: `bg-slate-50` (`#F8FAFC`) - Fresh paper.
- **Surface (Card)**: `bg-white` (`#FFFFFF`) - Clean desk.
- **Muted Text**: `text-slate-500` (`#64748B`) - Fading ink.
- **Deep Text**: `text-slate-950` (`#020617`) - Bold print.

### Brand Colors
- **Primary (Action)**: `bg-indigo-900` / `text-indigo-900` (`#1E1B4B`) - Midnight Ink. Use for primary buttons, active states, and branding.
- **Accent (Heritage)**: `text-amber-900` (`#451A03`) - Polished Oak. Use for icons, hover highlights, and decorative serif elements.

### Semantic Colors
- **Success**: `text-emerald-600` / `bg-emerald-50` - New Growth.
- **Error**: `text-rose-600` / `bg-rose-50` - Red Ink (Corrections).
- **Warning**: `text-amber-600` / `bg-amber-50` - Aged Parchment Warning.
- **Info**: `text-sky-600` / `bg-sky-50` - Blue Notation.

## 3. Typography (The Voice of the Story)

### Font Stacks
- **Headings (The Titles)**: `font-serif` (Playfair Display, Noto Serif SC for Chinese).
- **Body & Data (The Content)**: `font-sans` (Inter, Noto Sans SC for Chinese).

### Type Scale
- **h1 (Title)**: `text-3xl font-bold font-serif` - The Cover Title.
- **h2 (Section)**: `text-xl font-semibold font-serif` - Chapter Heading.
- **body**: `text-base font-normal font-sans` - The Narrative.
- **caption/data**: `text-sm font-medium font-sans` - Footnotes & Marginalia.

## 4. Components (The Shelf Items)

- **Rounding**: `rounded-lg` (8px) for cards and inputs. `rounded-full` for circular buttons/avatars.
- **Shadows**:
  - Cards: `shadow-sm` (Default), `shadow-md` (Hover).
  - Floating items (Dialogs/Toasts): `shadow-lg`.
- **Buttons**:
  - **Primary**: `bg-indigo-900 text-white hover:bg-indigo-800`.
  - **Outline**: `border border-slate-200 text-indigo-900 hover:bg-slate-50`.
  - **Ghost**: `text-slate-500 hover:text-indigo-900 hover:bg-slate-100`.

## 5. Layout & Spacing (The Binding)

- **Grid**: 8px based spacing (Tailwind default).
- **Margins**: 
  - Page Padding: `p-6` (Mobile) to `p-10` (Desktop).
  - Card Inner Padding: `p-6`.
- **Breakpoints**: 
  - Standard Tailwind: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

## 6. Iconography
- **Library Choice**: Lucide-react (Thin-line, consistent).
- **Stroke Width**: `1.5px` to `2px`.
- **Color**: `text-slate-500` for inactive, `text-indigo-900` or `text-amber-900` for active.

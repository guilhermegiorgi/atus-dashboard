# Lead Modals Workspace Design

Date: 2026-04-10
Project: `atus-dashboard`

## Objective

Fix the lead detail and lead edit/create modals so they work well on large monitors instead of feeling narrow, cramped, and scroll-heavy.

## Problem

The current lead modals inherit a small dialog shell and only partially override it.
This creates three UX failures:

1. The modal width is too small for data-dense lead workflows.
2. The whole popup scrolls as one block, which makes orientation and action flow worse.
3. The detail and form layouts do not use the available desktop space in a meaningful way.

## Scope

This design applies only to:

- `src/components/leads/LeadDetailModal.tsx`
- `src/components/leads/LeadFormModal.tsx`
- shared dialog styling in `src/components/ui/dialog.tsx` only if needed to support a workspace-style modal shell

It does not change:

- lead API contracts
- field semantics
- modal open/close flows
- routing

## UX Direction

### Desktop

Lead modals become workspace-style dialogs:

- nearly full-screen
- centered
- roughly `94-96vw` wide
- roughly `88-92vh` tall
- fixed header and footer
- scroll confined to the content area instead of the entire popup

### Mobile

Mobile stays as a vertical sheet-like modal:

- narrow margins
- high max-height
- normal vertical stacking
- no attempt to force desktop multi-column density

## Lead Detail Modal

### Layout

The detail modal should use the width for operational reading:

- top bar: lead identity, canonical status badges, primary actions
- left column: registration, origin/tracking, human state, operational state
- right column: messages and conversation context as the dominant area
- lower/right support block: actions timeline or audit list

### Behavior

- header remains visible while the body scrolls
- message area has its own internal scroll when needed
- conversation becomes the visually dominant block on desktop
- metadata is compact and scannable, not long stacked paragraphs

## Lead Form Modal

### Layout

The form modal should be grouped by editing intent instead of a long narrow list:

- block 1: lead identity and contact
- block 2: origin and intake context
- block 3: qualification and personal fields
- block 4: financial fields
- block 5: notes and long-form fields

Desktop grid behavior:

- two to four columns depending on field type
- textareas and long fields span full width
- footer actions stay fixed at the bottom

### Behavior

- body scrolls independently from header/footer
- save/cancel is always reachable without scrolling back to the bottom of a long page
- create and edit modes keep the current API behavior and supported fields

## Shared Dialog Shell

If the current dialog primitive cannot support this cleanly with per-modal classes alone, add a reusable workspace-style dialog class pattern.

Requirements:

- do not break other dialogs that still need compact sizing
- keep mobile behavior safe by default
- allow per-modal sizing without rewriting the dialog primitive for every screen

## Visual Rules

- reduce nested card noise inside the modal
- use spacing and section titles as hierarchy first
- reserve heavy borders/cards for real separation, not every small block
- keep badges and dense operational signals near the top
- prioritize readable scanning over decorative framing

## Testing

Add or update focused component tests to confirm:

- lead modals render with the new workspace sizing classes
- key content regions still appear in both create/edit and detail flows
- no regression in current submit/open behavior

## Risks

- over-expanding the shell without reorganizing content would only create empty space
- changing the shared dialog primitive too aggressively could regress other dialogs
- conversation and audit sections can still feel crowded if internal scrolling is not separated clearly

## Recommendation

Implement a workspace-style shell for these two modals only, then reorganize each modal to match the actual operator workflow.
The detail modal should bias toward conversation operations.
The form modal should bias toward grouped editing blocks with fixed actions.

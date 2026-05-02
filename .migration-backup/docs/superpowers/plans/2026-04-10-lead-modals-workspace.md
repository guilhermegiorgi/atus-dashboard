# Lead Modals Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the lead detail and lead form modals so they behave like near-fullscreen workspace dialogs on desktop while staying sheet-like on mobile.

**Architecture:** Keep the existing dialog primitive, but apply a workspace-style shell only to the lead modals. Reorganize `LeadDetailModal` around an operator workspace with fixed header/footer and a message-heavy layout, and reorganize `LeadFormModal` into grouped editing blocks with wider grids and internal scrolling.

**Tech Stack:** Next.js App Router, React, Base UI dialog wrappers, Vitest, Testing Library, Tailwind utility classes

---

### Task 1: Add failing modal sizing tests

**Files:**
- Modify: `src/components/leads/LeadDetailModal.test.tsx`
- Modify: `src/components/leads/LeadFormModal.test.tsx`

- [ ] **Step 1: Write the failing tests**

Add assertions that:
- `LeadDetailModal` renders a desktop workspace shell class such as `w-[min(96vw,1600px)]` and `h-[90vh]`
- `LeadFormModal` renders a desktop workspace shell class such as `w-[min(94vw,1400px)]` and `h-[88vh]`

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/components/leads/LeadDetailModal.test.tsx src/components/leads/LeadFormModal.test.tsx`
Expected: FAIL because current dialogs still use compact modal classes

- [ ] **Step 3: Commit**

```bash
git add src/components/leads/LeadDetailModal.test.tsx src/components/leads/LeadFormModal.test.tsx
git commit -m "test: cover lead workspace modal sizing"
```

### Task 2: Rebuild the shared modal shell usage for leads

**Files:**
- Modify: `src/components/leads/LeadDetailModal.tsx`
- Modify: `src/components/leads/LeadFormModal.tsx`
- Optionally modify: `src/components/ui/dialog.tsx`

- [ ] **Step 1: Implement the workspace modal shell**

Apply per-modal classes so desktop becomes near-fullscreen and mobile stays vertical:
- detail modal: large width, fixed height, `overflow-hidden`
- form modal: large width, fixed height, `overflow-hidden`
- use internal scrolling containers for modal body areas instead of scrolling the popup itself

- [ ] **Step 2: Reorganize LeadDetailModal**

Restructure to:
- keep header visible
- move top-level badges and identity to the top
- split the body into wide multi-column desktop layout
- give the conversation/messages area the dominant space
- keep timeline/actions and metadata readable without long vertical stacks

- [ ] **Step 3: Reorganize LeadFormModal**

Restructure to:
- keep header and footer stable
- group fields into logical blocks
- use wider desktop grids
- make textareas full-width
- keep mobile stacked and safe

- [ ] **Step 4: Run focused modal tests**

Run: `npm run test -- src/components/leads/LeadDetailModal.test.tsx src/components/leads/LeadFormModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/leads/LeadDetailModal.tsx src/components/leads/LeadFormModal.tsx src/components/ui/dialog.tsx src/components/leads/LeadDetailModal.test.tsx src/components/leads/LeadFormModal.test.tsx
git commit -m "feat: rebuild lead workspace modals"
```

### Task 3: Full verification

**Files:**
- No planned code changes unless verification reveals a regression

- [ ] **Step 1: Run full test suite**

Run: `npm run test`
Expected: PASS

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit verification-only follow-up if needed**

```bash
git add -A
git commit -m "fix: polish lead workspace modal layout"
```

Only create this commit if verification requires a final correction.

# Design System Document: The Clinical Sanctuary

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Aesthetician"**

This design system transcends the "generic wellness app" by blending the rigorous precision of a clinical laboratory with the high-end serenity of a luxury spa. We are moving away from the "template" look of rigid grids and heavy borders. Instead, we embrace **Soft Minimalism**—a philosophy where hierarchy is defined by light, depth, and breath rather than lines.

To achieve an editorial feel, this system utilizes intentional asymmetry. Hero elements should feel "unbound," often overlapping container edges or bleeding into the margins. We prioritize large, confident typography scales and "High-Tech Ethereal" accents—using glassmorphism and subtle glows to denote AI capabilities without breaking the organic, soothing flow of the experience.

---

## 2. Colors & Surface Philosophy
Our palette is rooted in nature and science: Soft greens (`primary`), pale blues (`secondary`), and lavenders (`tertiary`).

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the separation the eye needs.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of frosted glass.
- **Layer 0 (Base):** `surface` (#f8fafb)
- **Layer 1 (Sections):** `surface-container-low` (#f1f4f5)
- **Layer 2 (Interactive Cards):** `surface-container-lowest` (#ffffff)
- **Layer 3 (Floating/AI Elements):** `surface-bright` with 60% opacity and a 16px backdrop-blur.

### The "Glass & Gradient" Rule
To elevate AI-powered features, move beyond flat colors. Use **Signature Textures**:
*   **AI Hero CTAs:** Apply a linear gradient from `primary` (#426658) to `primary-container` (#bee6d3) at a 135° angle.
*   **Floating Modals:** Use `surface-container-lowest` with 80% opacity and a subtle `surface-tint` (#426658) at 5% opacity to give a "glassy" clinical feel.

---

## 3. Typography
The system uses a dual-font approach to balance authority with approachability.

*   **Display & Headlines (Manrope):** A geometric sans-serif that feels modern and precise. Use `display-lg` (3.5rem) for high-impact editorial moments, like a skin health score.
*   **Body & Titles (Inter):** A highly legible sans-serif for clinical data and instructions.

**Typography as Brand:**
*   **Confidence:** Use `headline-lg` with `on-surface` (#2d3435) for diagnosis headers.
*   **Guidance:** Use `body-md` with `on-surface-variant` (#596062) for routine descriptions to keep the interface feeling "quiet."
*   **High-Tech Accents:** Use `label-md` in all-caps with 0.05em letter spacing for AI-generated metadata or "Analyzing..." states.

---

## 4. Elevation & Depth
We convey importance through **Tonal Layering** rather than structural shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a natural "lift" that mimics high-end stationery.
*   **Ambient Shadows:** If a floating action button or "magic" AI card requires a shadow, use: `box-shadow: 0 12px 32px rgba(45, 52, 53, 0.06);`. The shadow is tinted with `on-surface` to feel organic.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in input fields, use `outline-variant` (#acb3b5) at **15% opacity**. Never use 100% opaque borders.
*   **Clinical Glass:** For AI overlays, use `backdrop-filter: blur(20px)` combined with a 1px "inner glow" using a white stroke at 20% opacity to simulate the edge of a glass lens.

---

## 5. Components

### Cards & Lists
*   **Radius:** All cards must use `md` (1.5rem / 24px) to maintain a "friendly-clinical" soft touch.
*   **No Dividers:** Forbid the use of horizontal rules (`<hr>`). Separate list items using `spacing-4` (1.4rem) of vertical white space or by placing each item in its own `surface-container-lowest` tile.

### Buttons
*   **Primary AI Button:** Uses the `primary` fill with a subtle 4px blur glow in the same color. Shape: `full` (pill).
*   **Secondary/Ghost:** `surface-container-highest` background with `on-surface` text. No border.

### AI Progress/Loading
*   **The "Aura" State:** Instead of a traditional spinner, use a pulsing radial gradient of `tertiary-container` (#dbdbf5) behind the user's uploaded photo to signify AI analysis.

### Input Fields
*   **Styling:** Use `surface-container-low` as the field fill. Upon focus, transition to `surface-container-lowest` with a "Ghost Border" of `primary` at 20%.

### Specialized Component: The "Skin Journal" Strip
*   An asymmetric horizontal scroll of `surface-container-lowest` cards. The first card should be larger (`headline-md`) to break the rhythm of the grid.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If a screen feels "busy," increase the spacing between containers using `spacing-8` or `spacing-10`.
*   **DO** overlap elements. Let a product image "break out" of its card and sit partially on the background `surface`.
*   **DO** use `tertiary` (lavender) sparingly for "moment of delight" features, like a completed routine notification.

### Don't
*   **DON'T** use pure black (#000000) for text. Always use `on-surface` (#2d3435) to maintain the "soothing" aesthetic.
*   **DON'T** use 90-degree corners. Everything must feel organic and touched by human hands.
*   **DON'T** use high-contrast drop shadows. If it looks like it's "hovering" more than a few millimeters off the screen, it's too heavy.
*   **DON'T** use "Alert Red" for errors if possible. Use `error` (#ac3434) at low saturations to keep the user calm, even when an issue arises.
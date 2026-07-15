# Implementation Plan: Immersive Landing Page

## Overview

Build a cinematic, scroll-driven landing page for CloudGuardian AI at the `/landing` route. The page features a 3D globe hero with React Three Fiber, scroll-triggered animations via GSAP ScrollTrigger, Framer Motion component transitions, and 8 self-contained sections showcasing the platform's capabilities. All source files are TypeScript (`.tsx`/`.ts`) within the existing Vite + React client.

## Tasks

- [x] 1. Foundation — Setup, Dependencies, and Routing
  - [x] 1.1 Install dependencies and extend Tailwind config
    - Add `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`, `framer-motion`, and `gsap` to `client/package.json`
    - Extend `client/tailwind.config.js` with Design_System colors: background (#0B0F14), surface (#111827), primary (#10B981), secondary (#22D3EE), accent (#7C3AED), warning (#F59E0B), critical (#EF4444), text (#F8FAFC), muted (#94A3B8)
    - _Requirements: 1.4, 1.6_

  - [x] 1.2 Create constants and animation utilities
    - Create `client/src/pages/Landing/utils/constants.ts` with DesignSystem interface and all color, timing, breakpoint, and metrics data
    - Create `client/src/pages/Landing/utils/animations.ts` with shared Framer Motion variants (fadeInUp, staggerContainer, scaleIn) and GSAP helper functions
    - _Requirements: 1.5, 10.6_

  - [x] 1.3 Create custom hooks
    - Create `client/src/pages/Landing/hooks/useScrollAnimation.ts` — returns `{ ref, progress, isInView }`, uses GSAP ScrollTrigger, cleans up on unmount
    - Create `client/src/pages/Landing/hooks/useMouseParallax.ts` — returns damped `{ x, y }` in [-1, 1], listens to mousemove, cleans up on unmount
    - Create `client/src/pages/Landing/hooks/useCountUp.ts` — animates from 0 to target with ease-out cubic, triggers on inView, returns `{ value, ref }`
    - Create `client/src/pages/Landing/hooks/useTypingAnimation.ts` — reveals text char-by-char at configurable speed, returns `{ displayText, isComplete }`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 1.4 Add landing page route with code-splitting
    - Modify `client/src/App.jsx` to add a lazy-loaded `/landing` route using `React.lazy` and `Suspense` with a loading fallback
    - Create `client/src/pages/Landing/index.tsx` as the main page component — imports all 8 sections, registers GSAP ScrollTrigger plugin, creates GSAP context scoped to container, reverts on unmount
    - _Requirements: 1.1, 1.2, 1.3, 10.6, 10.7_

- [x] 2. Checkpoint — Foundation verification
  - Ensure the app compiles with no errors, the `/landing` route renders, and all hooks export correctly. Ask the user if questions arise.

- [x] 3. Hero Section — 3D Globe and Metrics
  - [x] 3.1 Implement Globe component
    - Create `client/src/pages/Landing/components/Hero/Globe.tsx`
    - Render low-poly icosphere (detail ≤5, vertex count <1000) with wireframe overlay
    - Apply emerald emissive glow material, auto-rotate on Y axis
    - React to mouse parallax via parent camera offset
    - _Requirements: 2.2, 2.3, 2.10_

  - [x] 3.2 Implement OrbitingNodes component
    - Create `client/src/pages/Landing/components/Hero/OrbitingNodes.tsx`
    - Render AWS service nodes as instanced meshes orbiting the globe
    - Each node has unique radius, speed, and phase offset
    - Use `calculateNodePosition` algorithm from design
    - Display labels via Drei Html component
    - _Requirements: 2.4_

  - [x] 3.3 Implement ScanningRings component
    - Create `client/src/pages/Landing/components/Hero/ScanningRings.tsx`
    - Render 2-3 ring meshes around the globe with pulsing opacity animation
    - Rings rotate at different speeds on different axes
    - _Requirements: 2.5_

  - [x] 3.4 Implement ParticleField component
    - Create `client/src/pages/Landing/components/Hero/ParticleField.tsx`
    - Render up to 200 particles as instanced meshes using Float32Array for positions
    - Update positions each frame, wrap particles at bounds
    - _Requirements: 2.6, 2.7_

  - [x] 3.5 Implement MetricsCounter component
    - Create `client/src/pages/Landing/components/Hero/MetricsCounter.tsx`
    - Display 4 animated counters (resources scanned, cost saved, rules active, security checks)
    - Use `useCountUp` hook, trigger when hero is in view
    - _Requirements: 2.8, 2.9_

  - [x] 3.6 Implement HeroSection component
    - Create `client/src/pages/Landing/components/Hero/HeroSection.tsx`
    - Full-viewport section with R3F Canvas wrapped in Suspense (fallback: CSS gradient)
    - Compose Globe, OrbitingNodes, ScanningRings, ParticleField inside Canvas
    - Overlay headline text, CTA buttons, and MetricsCounter
    - Use `useMouseParallax` for camera offset
    - Handle WebGL context lost — show static fallback
    - Support `prefers-reduced-motion` — disable 3D, show static layout
    - _Requirements: 2.1, 2.10, 2.11, 11.6, 12.3, 12.5_

  - [ ]* 3.7 Write property tests for Hero utility functions
    - **Property 1: Particle Bounds Invariant** — verify all particles stay within [-BOUNDS, BOUNDS] after any sequence of updates
    - **Property 6: Orbital Position Validity** — verify calculateNodePosition returns points at correct radius
    - **Property 2: Counter Monotonicity** — verify useCountUp produces monotonically non-decreasing bounded values
    - **Property 3: Mouse Parallax Normalization** — verify output clamped to [-1, 1] for any input
    - **Validates: Requirements 2.7, 2.4, 2.9, 2.11**

- [x] 4. Checkpoint — Hero section verification
  - Ensure the 3D globe renders, nodes orbit, particles animate, and counters count up. Ask the user if questions arise.

- [x] 5. Content Sections — Discovery, Rule Engine, AI Engine, Dashboard
  - [x] 5.1 Implement DiscoverySection component
    - Create `client/src/pages/Landing/components/Discovery/DiscoverySection.tsx`
    - Render animated SVG data streams with Framer Motion path animations
    - Show AWS service icons flowing along paths with staggered delays
    - Trigger animations on scroll enter using `useScrollAnimation`
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 5.2 Implement RuleEngineSection component
    - Create `client/src/pages/Landing/components/RuleEngine/RuleEngineSection.tsx`
    - Render futuristic AI core visual (CSS/SVG animated concentric rings + glow)
    - Animate Glass_Card finding cards with stagger on scroll enter
    - Each card shows severity badge (critical/warning/info) and estimated savings
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 5.3 Implement AIEngineSection component
    - Create `client/src/pages/Landing/components/AIEngine/AIEngineSection.tsx`
    - Render AI hologram visual (CSS gradient animation with glow)
    - Use `useTypingAnimation` hook to cycle through phases: problem → analysis → recommendation → action
    - Wire GSAP scroll-scrub to progress through phases based on scroll position
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 5.4 Implement DashboardSection component
    - Create `client/src/pages/Landing/components/Dashboard/DashboardSection.tsx`
    - Render mock dashboard UI with animated chart bars/lines (CSS + Framer Motion)
    - Animate savings counter with `useCountUp` on scroll enter
    - Render animated health score radial gauge (SVG circle with stroke-dashoffset animation)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 5.5 Write property tests for animation hooks
    - **Property 4: Scroll Progress Range** — verify useScrollAnimation returns progress in [0, 1]
    - **Property 5: Typing Animation Prefix Invariant** — verify displayed text is always a prefix of full text
    - **Validates: Requirements 10.1, 5.3, 10.5**

- [x] 6. Checkpoint — Content sections verification
  - Ensure Discovery, RuleEngine, AIEngine, and Dashboard sections render with scroll-triggered animations. Ask the user if questions arise.

- [x] 7. Remaining Sections — Features, Architecture, Footer
  - [x] 7.1 Implement GlassCard component
    - Create `client/src/pages/Landing/components/Features/GlassCard.tsx`
    - Translucent background with backdrop-blur, border glow, hover scale effect
    - Independent floating animation using sinusoidal vertical offset (unique delay + amplitude per card)
    - Framer Motion whileInView entrance with stagger
    - _Requirements: 7.2, 7.3_

  - [x] 7.2 Implement FeaturesSection component
    - Create `client/src/pages/Landing/components/Features/FeaturesSection.tsx`
    - Render 8 GlassCard components in responsive grid (1 col mobile, 2 col tablet, 4 col desktop)
    - Define 8 feature cards with titles, descriptions, icons, and colors from constants
    - Staggered scroll-enter animation
    - _Requirements: 7.1, 7.4_

  - [x] 7.3 Implement ArchitectureSection component
    - Create `client/src/pages/Landing/components/Architecture/ArchitectureSection.tsx`
    - Render horizontal pipeline with labeled stages and connecting lines (SVG)
    - GSAP scroll-scrub to highlight stages sequentially
    - Animate flowing particles along connection lines when stage activates
    - Show stage descriptions on activation
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 7.4 Implement FooterSection component
    - Create `client/src/pages/Landing/components/Footer/FooterSection.tsx`
    - Render animated network dot-grid background (canvas element or SVG)
    - Display logo, navigation links, social links in responsive columns
    - Apply `rel="noopener noreferrer"` to all external links
    - Subtle parallax on scroll via `useMouseParallax`
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 7.5 Write property test for Footer external links
    - **Property 8: External Link Security Attributes** — verify all external anchor elements have `rel="noopener noreferrer"`
    - **Validates: Requirement 9.3**

- [x] 8. Checkpoint — All sections verification
  - Ensure all 8 sections render in sequence, scroll animations trigger, and the full page is navigable. Ask the user if questions arise.

- [x] 9. Integration and Polish — Scroll, Responsive, Performance
  - [x] 9.1 Wire full-page scroll animations and transitions
    - Update `client/src/pages/Landing/index.tsx` to initialize GSAP ScrollTrigger for all sections
    - Ensure section transitions are smooth and pin/scrub configs work correctly
    - Call `ScrollTrigger.refresh()` after fonts/content settle
    - _Requirements: 10.6, 10.7, 11.1_

  - [x] 9.2 Implement responsive layout and accessibility
    - Ensure all sections adapt at breakpoints 640px, 768px, 1024px, 1280px
    - Verify no horizontal overflow at 320px+ viewport widths
    - Add `prefers-reduced-motion` media query — disable parallax, particles, floating, scrub; show static content with basic fade-in
    - Add visible focus indicators on CTA buttons and links
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 9.3 Implement performance optimizations and cleanup
    - Ensure GPU-accelerated transforms only (translate3d, scale3d) for animations
    - Implement frame rate detection — if below 30 FPS, reduce particle count and disable 3D
    - Dispose all Three.js geometries and materials on Landing_Page unmount
    - Verify no raster images used — all visuals are SVG, CSS, or WebGL
    - Store low-performance detection in localStorage for future visits
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.6_

  - [ ]* 9.4 Write property test for layout overflow
    - **Property 7: No Horizontal Overflow** — verify document scrollWidth <= viewport width at 320px+
    - **Validates: Requirement 12.1**

- [x] 10. Final Checkpoint — Full integration verification
  - Ensure all tests pass, the page loads under 2.5s LCP, scroll animations are smooth, responsive layout works at all breakpoints, and reduced-motion mode functions correctly. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical breaks
- Property tests validate universal correctness properties from the design document
- All source files are TypeScript within `client/src/pages/Landing/`
- No backend changes are required for this feature
- The 3D layer is isolated to the Hero section only for performance

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["1.4"] },
    { "id": 3, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["3.6", "3.7"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4"] },
    { "id": 6, "tasks": ["5.5", "7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3", "7.4"] },
    { "id": 8, "tasks": ["7.5"] },
    { "id": 9, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 10, "tasks": ["9.4"] }
  ]
}
```

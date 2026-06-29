# IPTV Smart Proxy Enterprise — System & Product Specification (V3.0.0)

**Project Name:** IPTV Smart Proxy V3  
**Document Type:** Technical & Product Architecture Specification  
**Version:** V3.0.0-Enterprise  
**Release Date:** June 27, 2026  
**Author:** Google AI Studio Coding Agent  
**Status:** Approved for Implementation  

---

## Section 1 — Project Overview
* **Project Name:** IPTV Smart Proxy Enterprise Edition
* **Product Type:** Enterprise Streaming Middleware & Reverse Proxy Console
* **Product Category:** Telecommunications & IPTV Middleware Services
* **Core Mission:** Bridge the gap between raw, insecure upstream IPTV providers and end-user subscriber apps by introducing a secure, low-latency, and high-performance smart proxy layer.
* **Main Objective:** Enable operators to cache playlist configurations, rewrite video streams dynamically using FFmpeg, secure connection tokens, monitor subscriber sessions in real-time, and diagnose connection errors from a unified panel.
* **Business Value:** Prevents upstream provider credentials leakage, balances network traffic load, minimizes bandwidth consumption through Redis caches, and provides professional diagnostic interfaces to lower customer support overhead.
* **System Purpose:** IPTV Smart Proxy V3 acts as a server-side gateway. Instead of subscriber players querying provider servers directly, they query this proxy. The proxy validates tokens, checks availability, modifies streaming profiles if transcoding is requested, and proxies the HLS/MPEG-TS video streams back down.
* **Problems Solved:**
  1. **Security Vulnerability:** Upstream provider DNS and line keys are completely hidden. Subscribers only see the proxy's URL.
  2. **Streaming Diagnostics Deficit:** Operators can see live playback sessions, active bandwidth usage, and client platforms, allowing active stream termination and troubleshooting.
  3. **High Bandwidth / Slow Loading:** Redis caches and HLS TS segmentation speed up load times and limit direct requests to upstream playlists.

---

## Section 2 — Product Vision
* **Product Vision:** A world-class, high-fidelity administrative control console coupled with a frictionless subscriber portal and a 10-foot smart TV simulation interface.
* **Intended User Outcomes:**
  * Administrators can easily provision, configure, and monitor channels and providers.
  * Operators can execute active stream teardowns and analyze performance telemetry.
  * Subscribers can browse, preview, and load channels on their personal devices via custom M3U credentials without physical remotes or technical setups.
* **Design & Experience Goals:** Ultra-premium, consistent, clear, dark-themed cosmic interface that uses high contrast (slate grays, white typography, emerald/brand accent highlights). 
* **Enterprise Quality Expectations:** The application must feel incredibly robust, utilizing seamless state transition, zero-flicker loading, detailed error fallbacks, and real-time responsiveness.
* **What the Product Intentionally Does NOT Do:**
  * It does not store or hot-host raw video files; it is purely a streaming reverse-proxy and transcoder.
  * It does not act as a payment gateway; payment processing is handled out-of-band by third-party billing engines.

---

## Section 3 — Product Requirements
* **Functional Requirements:**
  * **Unified Multi-Interface Shell:** Toggle cleanly between Admin Panel, Viewer Portal, and TV Mode interfaces.
  * **Dynamic Multi-Language Translation:** Seamlessly switch between English and Arabic (RTL) across all interactive views.
  * **IPTV Proxy Simulation:** Emulate live connection handshakes, proxy caching, network jitter, dynamic latency, and metrics logging.
  * **Real-time Session Management:** View, search, filter, and actively terminate subscriber connections.
  * **Diagnostics & Logging:** Provide detailed debug, warning, and info server metrics with clear severities and service tags.
* **Non-Functional Requirements:**
  * **UI Load Latency:** Under 150ms for local view switching and visual updates.
  * **Bilingual Compliance:** 100% Arabic alignment, preserving correct right-to-left layout paradigms without shifting container sizes.
  * **State Consistency:** App Context acts as the single source of truth for channel, provider, session, and language states.
* **Security & Performance:**
  * Subscriber session tokens are cryptographically simulated and require secure handshakes.
  * Transcoding presets utilize CPU-optimized preset parameters to prevent server overload.

---

## Section 4 — Personas and Roles

| Persona / Role | Main Goals | Key Activities in UI | Permissions & Constraints | UI Impact |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | Core infrastructure configuration and provider onboarding | Modifies proxy core configurations, adds/deletes provider profiles, creates transcode templates | Full Read & Write access across all views | Has access to settings, system logs, provider creation forms, and cluster teardowns |
| **Support Operator** | Live connection monitoring and subscriber troubleshooting | Inspects live connection metrics, filters system logs, terminates active subscriber sessions | Read-only configuration, Write access for session teardowns and connections | Can view settings but cannot change core values; has full access to sessions table and kick actions |
| **End Subscriber** | Simple channel browsing, HLS streaming, and credentials setup | Selects channels, plays live previews, copies M3U playlists, launches TV interface | Access restricted entirely to the Viewer Portal and TV Mode | Admin-level configurations, settings, logs, and billing details are completely hidden |

---

## Section 5 — Information Architecture
The platform is structured into three primary structural branches within a single client-side application context, partitioned by viewport layouts:

```
[IPTV SMART PROXY ARCHITECTURE]
 ├── App Entry Shell (App.tsx / AppContext)
 │    ├── Bilingual Engine (English & Arabic)
 │    ├── Shared State Store (Channels, Providers, Sessions, Logs, Settings)
 │    └── Main Layout Router
 │
 ├── 1. Admin Control Panel (AdminLayout.tsx)
 │    ├── Dashboard View (System KPIs, Health gauge, quick connections)
 │    ├── Channels Management View (Transcoding links, category selector)
 │    ├── Providers View (Connection tester, prioritization, circuit breakers)
 │    ├── Sessions View (Live subscriber monitoring, thread termination)
 │    ├── Clients & Users View (Token expiration, device assignment)
 │    ├── FFmpeg Process Monitor (Transcoding metrics, preset control)
 │    ├── Systems Metrics & Logs (Real-time telemetry, log level filter)
 │    ├── Node Health View (Hardware load, service statuses)
 │    └── Settings View (Core parameters, backup configurations)
 │
 ├── 2. Client Viewer Portal (ViewerPortalView.tsx)
 │    ├── Subscriber Device Status Banner (Active platform, security token)
 │    ├── Live Sports EPG API Integration (Live matches, click-to-play)
 │    ├── Interactive Preview Player (HLS player controls, sound swipe)
 │    ├── Copyable Connection Strings (M3U file line, XML guide URL)
 │    └── Active Lineup Grid (Bilingual search, category filter, play)
 │
 └── 3. 10-Foot Smart TV Interface (TVModeView.tsx)
      ├── Standby / Power on simulation
      ├── Remote control arrow navigation focus states
      ├── Video rendering backdrop
      └── Live EPG program timeline preview
```

---

## Section 6 — Navigation System
* **Global Navigation:** The admin portal utilizes a persistent left sidebar on desktop and a responsive top drawer on mobile devices.
* **Navigation Modes:**
  * **Admin Mode:** Shows Dashboard, Channels, Providers, Sessions, Clients, FFmpeg, Metrics, Logs, Health, Settings.
  * **Viewer Portal Mode:** Swaps the sidebar with a consumer-centric interface showing Sports schedules, Playlists, and Channel selectors.
  * **TV Interface Mode:** Fullscreen black canvas, hiding all web headers and sidebars. Displays a "Return to Dashboard" escape button.
* **Active State Rules:** Current route/view triggers an emerald-green sidebar track. Transition animations utilize `motion` fade/slide effects to preserve professional pacing.

---

## Section 7 — Design Principles
* **Cosmic Twilight Dark Theme:** Crafted specifically for dark settings (IPTV command centers and dark living rooms). Colors are deep slate blacks (`#0d0e12`, `#111217`) with precise border alignments (`#1c1e26`).
* **Visual Rhythm & Negative Space:** High content density in admin tables, but high readability via strict tracking, Inter and JetBrains Mono typography, and spacious padding.
* **Humility & Professional Integrity:** No simulated tech jargon, fake telemetry scripts, or "Solar Orbit Trackers". Every UI element uses clear, human labels (e.g., "Active Connections", "Memory Cache Limit").

---

## Section 8 — Design System
* **Buttons:** Consistent rounded layouts (`rounded-lg`), transition hover states (slight opacity or color shifts), and tactile scale feedback on clicks (`active:scale-95`).
* **Inputs & Selects:** High contrast backgrounds (`bg-slate-950`), custom focus borders (`focus:border-emerald-500`), and integrated search/filter indicators.
* **Status Badges:** Explicit semantic groupings:
  * Green: `ONLINE`, `ACTIVE`, `SUCCESS`
  * Orange/Yellow: `WARNING`, `UPCOMING`, `RECONNECTING`
  * Red: `OFFLINE`, `FAILED`, `CRITICAL`
  * Blue: `INFO`, `PROCESSING`

---

## Section 9 — Color System
The color palette represents a premium dark-themed experience:

* **Background Dark (Base):** `#0d0e12`
* **Card Backdrops (Elevated):** `#111217`
* **Borders (Deliberate grid):** `#1c1e26`
* **Primary / Accent Green (Enterprise Trust):** Emerald Green (`#10b981`)
* **Secondary / Active blue:** Azure blue (`#3b82f6`)
* **Text Primary:** `#f8fafc` (Slate 50)
* **Text Secondary:** `#94a3b8` (Slate 400)
* **Danger highlights:** Rose red (`#f43f5e`)

---

## Section 10 — Typography
* **Default Font Sans:** *Inter* for general UI, tables, and settings menus. Perfect tracking, legibility, and modern line spacing.
* **Font Mono:** *JetBrains Mono* for technical telemetry lines, IP addresses, codec specifications, dates, and bitrates.
* **Bilingual Support (Arabic RTL):** RTL styles are activated using the `language === "ar"` state, aligning text alignments dynamically and flipping flex alignments cleanly.

---

## Section 11 — Spacing and Layout
* **Grid Alignments:** Responsive CSS Grid layouts combined with flex structures.
* **Admin Layout Margin:** `p-6` (24px) padding to ensure adequate negative space.
* **Responsive Breakpoints:** 
  * Mobile Portrait (`<640px`): Navigation collapses into top bar, lists stack vertically.
  * Tablet (`640px - 1024px`): Double columns, sidebars become overlay drawers.
  * Desktop (`>1024px`): Rigid dual-column structure with left panel fixed sidebar.

---

## Section 12 — Icons
* **Icon Library:** All icons are strictly imported from `lucide-react`.
* **Visual Meanings:**
  * `Tv` or `PlayCircle`: Channel, streaming, HLS feed.
  * `Server` or `Database`: Provider servers, Redis cache.
  * `Cpu` or `Settings`: Transcoding, FFmpeg process, core parameters.
  * `Activity` or `TrendingUp`: Telemetry, metrics, analytics.
  * `ShieldAlert`: Security warnings, session terminations.

---

## Section 13 — Core UI Components
1. **Interactive Modal:** Centered overlay using deep backdrops, ESC-key click-out, and bilingual title headers.
2. **Dynamic Search Bar:** Standardizes input filtering across Channels, Clients, Logs, and Sessions. Uses floating search icons adjusted for LTR/RTL languages.
3. **Metric KPI Cards:** Framed container with elevated hover states (`hover:border-slate-700`), custom icons, status badges, and large bold numerical counters.

---

## Section 14 — Dashboard
The Dashboard serves as the central administrative operational interface.
* **Data Visualizations:** 
  * System CPU & Memory usage charts.
  * Live bandwidth consumption line graph.
  * Real-time Redis cache hit rate percentage gauge.
* **Quick Controls:** Test provider server latencies directly with individual ping tests.
* **Critical Alerts Panel:** Displays urgent warnings like "Transcoder Overload" or "Provider Line offline".

---

## Section 15 — Channels Management
* **Page Purpose:** Operator view to provision and transcode IPTV channels.
* **Features:**
  * Categorization filter (Sports, Movies, News, General).
  * Bulk status switcher (Enable/Disable streams).
  * Quality transcoder mapping to dynamic FFmpeg presets.
  * Bilingual Arabic/English descriptions and metadata inputs.

---

## Section 16 — Providers Configuration
* **Page Purpose:** Setup connection pipelines to the IPTV suppliers.
* **Operations:**
  * Provider prioritizations via drag-and-drop or ranking inputs.
  * Circuit Breaker tracking (automatically blocks offline providers to avoid query queues).
  * Credentials editor (M3U url, portal keys, domain bypass).

---

## Section 17 — Sessions Tracking
* **Page Purpose:** Active subscriber monitoring interface.
* **Data Grid Columns:** Client Subscriber, Stream Channel, Device Platform, IP Node, Connection Duration, Bytes Transferred, Bitrate.
* **Force Kill Action:** Support operator can kick an active thread, terminating HLS socket links immediately to prevent credential sharing.

---

## Section 18 — Clients & Tokens
* **Page Purpose:** Managing end-user subscriber accounts.
* **Capabilities:**
  * Assign secure connection tokens.
  * Track remaining lease duration (days/hours).
  * Configure device limits (allow maximum 2 concurrent streams per token).

---

## Section 19 — Operator Users
* **Page Purpose:** Restrict access inside the admin portal.
* **Permissions Levels:**
  * **Super Admin:** Modify configurations, system teardown, add providers.
  * **Operator:** View dashboards, run diagnostics, terminate sessions.
  * **Viewer:** Read-only access to channels list and basic node telemetry.

---

## Section 20 — FFmpeg Transcode Engine
* **Purpose:** Monitor live stream conversions on the server.
* **Interactive Controls:**
  * Dynamic preset profiles selector (UltraFast, SuperFast, Medium).
  * Real-time transcode speed factor telemetry (e.g., `1.2x speed`).
  * Process logs capturing audio/video codec mappings.

---

## Section 21 — System Metrics
* **KPI Graphs:**
  * **CPU Utilization:** High-frequency line chart showing system load.
  * **Memory Slabs:** Memory allocation mapping for active video chunks.
  * **Concurrent Sockets:** Bandwidth utilization metrics.

---

## Section 22 — System Logs
* **Features:**
  * Filtering logs by Severity Level (`DEBUG`, `INFO`, `WARNING`, `ERROR`).
  * Real-time streaming log terminal.
  * CSV/JSON log bundle exporter.
  * Contextual trace ID matching to debug specific subscriber connections.

---

## Section 23 — Hardware & Service Health
* **Component Gauges:**
  * Redis Cache Memory Allocation (MB/GB).
  * SQLite / PostgreSQL connection health.
  * FFmpeg worker thread counts.
  * Node network packet drops.

---

## Section 24 — Settings Panel
* **Parameters Configured:**
  * Memory Cache refresh rate (seconds).
  * Target segment duration for HLS chunks.
  * Proxy DNS configuration IP.
  * System backup and database dump exporters.

---

## Section 25 — Client Viewer Portal
* **Subscriber UI Experience:**
  * Responsive Sports Schedule banner linking matches directly to live channel feeds.
  * Live channel selector displaying resolution, categories, and codecs.
  * One-click clipboard copying for M3U playlist lines.

---

## Section 26 — 10-Foot Smart TV Interface
* **Features:**
  * Fully navigable via Arrow keys & OK click simulations.
  * Large, easily legible fonts optimized for distance viewing.
  * Realistic TV power-on standby animations.
  * Integrated EPG schedule overlay showing current and next shows.

---

## Section 27 — IPTV Player Engine
* **Features:**
  * Simulated video buffer bars responding to volume, network jitter, and transcoding quality selectors.
  * Stream live codecs tracking (AVC, HEVC, AAC).
  * Auto-reconnect routines recovering streams within 5 seconds of network drops.

---

## Section 28 — Responsive Scaling
* **Breakpoint Adaptations:**
  * Sidebar transitions into an off-canvas slide panel.
  * Grid panels change from 4 columns on large screens to single-row lists on mobile.
  * Tables are converted into readable card lists, preserving critical diagnostic actions.

---

## Section 29 — Accessibility (a11y)
* **Paradigms:**
  * Strict tab order across interactive settings and menus.
  * Screen reader tags (ARIA labels) on mute, play, copy, and close actions.
  * Enhanced visual contrast ratio meeting WCAG 2.1 AA benchmarks.

---

## Section 30 — Motion & Transitions
* **Pacing Standards:**
  * Slide transitions for layout shifts (200ms easing).
  * Fade animations for modal backdrops.
  * Non-intrusive heartbeat/pulse states for live signal trackers.

---

## Section 31 — Dynamic Notifications
* **Severity Types:**
  * **Success Toasts:** For saved configuration files and copied URLs.
  * **Warning Alerts:** For buffer dropouts and minor transcode delays.
  * **Error Panels:** For database disconnection and offline streams.

---

## Section 32 — Modal Dialogs
* **Component Rules:**
  * Consistent layout grids with clear spacing.
  * Bold destructive buttons colored in Rose Red for dangerous operations.
  * Clean ESC button behavior matching LTR/RTL layouts.

---

## Section 33 — State Loadings
* **Paradigms:**
  * Visual skeleton layouts replacing cards during high-frequency API pings.
  * Rotating micro-spinners in buttons during active forms submissions.
  * High-contrast loading screens for cold system boot simulations.

---

## Section 34 — Error Fallbacks
* **Paradigms:**
  * Full-page 404, 500, and offline views with explicit retry handlers.
  * Micro inline messages for network timeout indicators.
  * Contextual instruction lists helping operators configure failed nodes.

---

## Section 35 — API Data Mapping
* **Endpoints Mapping:**
  * `/api/proxy/channels` -> Fetches the active list of transcoded channels.
  * `/api/proxy/providers` -> Manages connection credentials and prioritization.
  * `/api/proxy/sessions` -> Coordinates current active subscriber stream links.
  * `/api/proxy/logs` -> Streams telemetry messages.

---

## Section 36 — Coding Implementation Rules
* **Module Structure:**
  * Clean separation of concern: types belong in `/src/types.ts`, context in `/src/context/AppContext.tsx`, layout components in `/src/components/`.
  * Avoid any component state leakage outside the context for shared fields.
  * Strict typing: no usage of implicit `any`.

---

## Section 37 — Front-End Build Operations
* **Build Order:**
  1. Standardize and compile local data sources (`/src/data/sportsData.ts`).
  2. Implement context models (`/src/context/AppContext.tsx`).
  3. Formulate structural components (`AdminLayout.tsx`, `ViewerPortalView.tsx`, `TVModeView.tsx`).
  4. Perform strict compile check utilizing `npm run build`.

---

## Section 38 — UX Writing Guidelines
* **Tone standards:**
  * Clear, professional, informative.
  * Explicit command action names (e.g. "Terminate Stream", not "End It").
  * Arabic translations must use modern formal terminology (Fusha) avoiding literal machine phrasing.

---

## Section 39 — Design System Tokens
* **Spacing Scale:** `space-x-1` (4px), `space-x-2` (8px), `space-y-4` (16px), `space-y-6` (24px).
* **Radii Scale:** `rounded-lg` (8px) for buttons, `rounded-xl` (12px) for grids, `rounded-2xl` (16px) for charts/players.

---

## Section 40 — Adaptive Layouts
* **Desktop Grid:** 12-column layout templates.
* **Mobile Stack:** Multi-column dashboard statistics and settings sections change to standard vertical sequences.

---

## Section 41 — Telemetry Charts
* **Semantics:**
  * Green Area Charts reflect successful cache memory hits.
  * Dual-Line Charts visualize network bitrates vs. physical bandwidth.
  * Radial circular rings show live process CPU load.

---

## Section 42 — Security Workflows
* **Audit Logs:** System saves timestamped operator actions (e.g. "Operator [A] kicked IP 192.168.1.100").
* **Access Tokens:** Cryptographically random parameters assigned per subscriber node.

---

## Section 43 — QA Handoff Checklists
* **Validation Checkpoints:**
  * Arabic RTL visual alignment does not overlap grids.
  * Live sports synchronizations operate properly when clicked.
  * Modal forms reject invalid parameters.
  * Compilation achieves clean `tsc --noEmit` and build completion.

---

## Section 44 — Final Handoff Guide
* **Deliverable Contents:** Fully documented React client application, clean translation catalog, and complete layout system.
* **Deployment Checklist:**
  * Check environment variables.
  * Execute standard production build (`npm run build`).
  * Validate container health using `/api/health`.

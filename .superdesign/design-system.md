# Grove Studio Design System

## Product context
Grove is a media review workspace for video and photo uploads. The dashboard should feel like a cinematic studio bay: warm, tactile, and focused. Users must be gated behind an active plan or trial before accessing any uploads.

## Visual direction
- Theme: quiet studio bay, espresso base, warm amber accents.
- Atmosphere: solid fields, crisp borders, minimal ornament, spacious layout.
- Mood keywords: studio, editorial, grounded, precise, restrained.

## Color system
- Background: `#0F0A08`
- Foreground: `#F5E6D3`
- Muted: `#A0866A`
- Border: `#3A2D24`
- Accent: `#F59E0B` (hover `#F7B547`)

## Typography
- Display/Headings: Plus Jakarta Sans (400–600)
- UI/Meta: IBM Plex Mono (400–600)
- Tone: calm, editorial headings with tight tracking; mono for supporting detail.

## Layout & spacing
- Sidebar: 18rem width, sticky panel with glassy cards.
- Main content: max 5xl blocks, large vertical rhythm (48–56px).
- Cards: 22–28px radius, layered borders, subtle inner glow.

## Components
- **Plan status card**: simple badge, mono labels, no glow.
- **Onboarding card**: clean form field with solid CTA.
- **Upload bay**: drag/drop zone with icon chip, accent hover.
- **Media grid**: preview cards with solid overlay and quick open label.
- **Dock toolbar**: simple bordered bar with grouped actions.
- **Viewer modal**: full-screen overlay, custom controls, tight mono labels.

## Motion
- Page fade-in (200ms), hover border color shift, subtle scale on media previews.
- No gradients or hazy glows; keep motion minimal.

## Interaction rules
- Access gating: if no active plan/trial, hide uploads and show lock CTA.
- If trial is expired, show explicit expired copy and CTA.
- All actions feel deliberate, with restrained glow and warm highlights.

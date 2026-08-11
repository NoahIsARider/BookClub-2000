# DESIGN.md

## Vibe & Imagery
A millennium-era Windows 2000/XP desktop application. Imagine opening a book-reading collaboration app on a beige CRT monitor in a library computer room in 2001: grey window frames, blue gradient title bars, pixelated 3D buttons, Tahoma font.

## Visual Strategy
- All UI elements mimic classic Windows window controls
- Every functional panel is an independent "window" with a title bar and action buttons
- Classic outset/inset 3D borders to simulate raised/sunken surfaces
- Icons use a 16x16 pixel style

## Color Palette
- Window background: `#C0C0C0` (classic Windows grey)
- Title bar gradient: `#0A246A → #3A6EA5` (dark to light blue)
- Button face: `#D4D0C8`
- Window border highlight: `#FFFFFF` / `#DFDFDF`
- Window border shadow: `#808080` / `#404040`
- Body text: `#000000`
- Selection highlight: `#0A246A` background + `#FFFFFF` text
- Links/actions: `#0000FF` (classic blue hyperlink)
- Annotation highlight: `#FFFF00` (yellow highlighter effect)

## Typography
- Font family: Tahoma, 'MS Sans Serif', 'Microsoft YaHei', sans-serif
- Base sizes: 11px (body), 12px (headings), 13px (window titles)
- Do not rely on bold for emphasis — use underlines or color changes
- Tight line spacing, dense information layout like a classic desktop app

## Motion & Interaction
- Button click: inset 3D effect (border inversion), no transitions
- Window hover: no animation, instant response
- Annotation highlight: instant yellow background toggle
- All interactions are "instant" — no fade/slide transitions

## Design Taboos
- No large rounded corners (max 1-2px)
- No box-shadow for modern shadows
- No glassmorphism / blur effects
- No gradient backgrounds (except title bars)
- No emoji as icons (use text or pixel icons)
- No overly loose layouts with large flex gaps

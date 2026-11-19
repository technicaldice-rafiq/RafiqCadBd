# RAFIQ LAND SURVEY CAD — Starter v0.2

## Included
- Responsive mobile/desktop CAD workspace
- Grid, pan, wheel zoom, selection and basic move\n- Endpoint object snap toggle and orthographic drafting toggle\n- Autosave to local browser storage; Delete/Escape/Ctrl+S/Ctrl+Z/Ctrl+Y shortcuts\n- Selected-object property summary
- Line, polyline, rectangle, circle, arc, text and dimension tools
- Layer assignment, color and line width
- Undo/redo, local save, JSON open/save, basic DXF export
- Browser print/PDF, PWA manifest and offline cache

## Run locally
Open `index.html` in a modern browser. For install/offline features, serve over HTTPS or localhost.

## Publish with GitHub Pages
1. Create a new GitHub repository named `rafiq-land-survey-cad`.
2. Upload all files in this folder to the repository root.
3. In Settings → Pages, select Deploy from a branch, branch `main`, folder `/ (root)`.
4. Open the published Pages URL. On Android Chrome, use Install app / Add to Home screen.

## Important limitations of v0.1
- DXF export supports basic LINE, CIRCLE, LWPOLYLINE and TEXT entities only.
- DXF import, DWG read/write, full CAD snapping, true CAD selection geometry, advanced dimension styles, layout/viewport plotting, 3D engine and GPS are not implemented yet.
- The area calculation assumes drawing coordinates are in the selected unit; it is a drafting aid, not a legal survey certification.
\n\nVersion 0.2 adds endpoint snapping, orthographic mode, keyboard shortcuts, selection details and autosave. It remains an early-stage 2D drafting prototype, not a full DWG-compatible CAD system.\n
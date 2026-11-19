# RAFIQ LAND SURVEY CAD V0.3
Replace these three files in the repository root:
- app.js
- index.html
- style.css

V0.3 adds Trim, Extend, Offset, Copy, Rotate, Mirror and Add Layer.
Existing project assets such as manifest.json, sw.js and logo.png should remain unchanged.

Important limitations:
- Trim/Extend currently work on a selected LINE and use intersecting drawing segments.
- Offset is a basic polyline/rectangle offset preview-copy, not a production-grade offset engine.
- DXF export supports basic LINE, CIRCLE, LWPOLYLINE and TEXT entities only.
- DWG import/export, true 3D CAD and legal survey certification are not included.
- Save a backup of your current files before replacing them.

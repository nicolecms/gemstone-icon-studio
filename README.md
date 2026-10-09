# Gemstone Icon Studio

A birthday gemstone-themed icon customiser built with React, TypeScript, and Vite.

## Development setup

1. Install the current Node.js LTS release.
2. Clone this repository.
3. Run `npm install`.
4. Run `npm run dev` and open the local URL printed in the terminal.

## Current milestone

Establish the responsive editor shell first. The image composition engine, asset manifest, photo editor, and PNG export will be implemented in later milestones.

## Planned layer order (bottom to top)

1. Solid-colour background
2. Optional pattern overlay
3. User photo, clipped to a circle
4. Metal
5. Main A
6. Main B
7. Character
8. Ribbon
9. Jewel

The photo and decorative layers remain visible in both export modes. Transparent export omits the two background layers; background export includes the selected solid colour and optional pattern.

# Furhat DOA 3D Visualization

A browser tool that shows where a sound is coming from, in real time. It receives DOA (Direction of Arrival) data from a four-microphone array over a WebSocket and renders it as an interactive 3D scene.

Built with **React + TypeScript** for the UI, **Three.js** for the 3D scene and **Vite** as the dev server and bundler.

## Quick start

You need Node.js 18 or newer.

```bash
npm install        # install dependencies (once)
npm run mock       # terminal 1: start the mock DOA server on ws://localhost:9000
npm run dev        # terminal 2: start the app on http://localhost:8080
```

Then open <http://localhost:8080/?ws=ws://localhost:9000>.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check with TypeScript, then build to `dist/` |
| `npm run preview` | Serve the built `dist/` folder |
| `npm run typecheck` | Type-check only |
| `npm run mock` | Mock WebSocket server that sends random DOA data |

### URL parameters

| Parameter | Example | Default |
| --- | --- | --- |
| `ws` | `?ws=ws://localhost:9000` | `ws://192.168.1.217:8765` (the real DOA backend) |
| `orbStyle` | `?orbStyle=arrow` | `faces` |

## Data format

Each WebSocket message is one JSON object. Direction is normalized before rendering, and volume drives the size of the effect.

```json
{ "x": 0.82, "y": 0.05, "z": 0.56, "volume": 180.4 }
```

`strength` is still accepted in place of `volume` for backward compatibility.

## Features

- Live connection status with auto-reconnect every 2 seconds
- Latest payload and a table of recent samples (time, azimuth, volume)
- Four visualization modes, switched instantly without reloading the page:
  - `faces`: a filled orb with exploded faces that spikes towards the sound
  - `wireframe`: a lighter mesh orb
  - `arrow`: an arrow that points to the sound and grows with volume
  - `furhat`: the Furhat robot head turns towards the sound
- Live style controls (colours, opacity, explode amount, arrow length) with reset

## Architecture

```
index.html                  just <div id="root"> and the entry script
src/
  main.tsx                  mounts <App /> into the page
  App.tsx                   owns shared state (mode, styles) and lays out the page
  types.ts                  shared TypeScript types (DoaData, OrbMode, OrbRenderer, ...)
  config.ts                 defaults, URL parameters, message parsing
  styles.css
  hooks/
    useDoaSocket.ts         WebSocket connection + reconnect as a custom React hook
  components/               React UI
    ControlPanel.tsx        left panel layout
    ConnectionStatus.tsx    endpoint, status dot, message count
    LatestData.tsx          latest payload as JSON
    DataHistory.tsx         table of recent samples
    ModeSwitch.tsx          the four mode buttons
    StyleControls.tsx       colour and slider controls per mode
    controls.tsx            reusable ColorControl / SliderControl
    VisualizerStage.tsx     bridge between React and Three.js
  three/                    plain Three.js, no React here
    sceneSetup.ts           scene, camera, lights, render loop, dispose
    doaController.ts        smoothing and stale-data fade-out
    renderers/
      index.ts              mode -> renderer factory
      faces.ts, wireframe.ts, arrow.ts, furhat.ts
      orbUtils.ts           shared spike/opacity helpers
public/                     3D models and logo, served as static files
mock-ws-server.js           dependency-free mock WebSocket server (Node.js)
```

### How data flows

```
WebSocket ──> useDoaSocket ──┬──> onData ──> VisualizerStage.pushData ──> Three.js renderer.update()
                             │                  (direct call, no React re-render)
                             └──> React state (status, latest, history) ──> panel components

Panel controls ──> App state (mode, styles) ──> VisualizerStage props ──> renderer.setStyle()
```

### Design decisions

- **React owns the UI, Three.js owns the canvas.** React renders an empty `<div>`, and `VisualizerStage` lets a Three.js renderer draw into it via a ref. The render loop runs in `requestAnimationFrame`, outside React, so the 60 fps animation never waits on React re-renders.
- **One small interface between the two worlds.** Every renderer implements `OrbRenderer` (`update`, `setStyle`, `dispose`). React does not know anything about meshes or materials, and adding a fifth mode means writing one new file and one line in `renderers/index.ts`.
- **Clean mount and unmount.** Switching modes runs the `useEffect` cleanup, which stops the animation loop, disposes geometries, materials and controls, and removes the canvas. The old version reloaded the whole page for this.
- **Controlled components.** Style values live in `App` state. `StyleControls` only displays them and reports changes, so the UI and the 3D scene can never disagree.
- **Typed messages.** Incoming JSON is validated once in `parseDoaMessage` and turned into a typed `DoaData`, so the rest of the code can trust its shape.

## Limitations

- Full real-time testing needs the real DOA backend. The mock server sends random directions in 4 s bursts with 3 s pauses.
- The visual response depends on the scale of incoming `volume` values (`VOLUME_SCALE = 0.001`).
- There are no automated tests yet.

## Context

Part of a sound localization project using a four-microphone array and Furhat. This frontend receives DOA output and presents it as interactive visual feedback for testing, demos and analysis.

A Chinese walkthrough of the React structure is in [`docs/REACT_GUIDE_zh.md`](docs/REACT_GUIDE_zh.md).

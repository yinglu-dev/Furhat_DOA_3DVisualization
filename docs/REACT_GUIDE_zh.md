# React 版本结构说明（中文学习指南）

这份文档用最简单的方式解释这个项目在 React + TypeScript 改写后是怎么组织的，目标是让你能在面试里自己讲清楚。

## 1. 先用一句话理解 React

React 是一个写界面的库。你不再用 `document.getElementById(...)` 找到元素再手动改它的文字和样式，而是写一个函数（叫“组件”），告诉 React：“数据是这样的时候，界面应该长这样”。数据一变，React 自动帮你更新页面。

旧版 `app.js` 里有大量这种代码：

```js
statusEl.dataset.state = state;
statusEl.textContent = text;
```

新版里只需要写：

```tsx
<div className="status" data-state={status}>{STATUS_TEXT[status]}</div>
```

`status` 变了，React 就会自动改这一行。

## 2. 几个核心概念（只需要记住这五个）

| 概念 | 意思 | 本项目里的例子 |
| --- | --- | --- |
| **组件 Component** | 一个返回界面的函数，可以像 HTML 标签一样复用 | `ModeSwitch`、`StyleControls`、`DataHistory` |
| **Props** | 父组件传给子组件的参数，子组件只读 | `App` 把 `mode` 传给 `ModeSwitch` |
| **State** | 组件自己记住的、会变化的数据，用 `useState` 创建 | `App` 里的 `mode` 和 `styles` |
| **useEffect** | “界面渲染完以后要做的额外事情”，比如连 WebSocket、创建 3D 场景，并且可以返回一个清理函数 | `useDoaSocket` 连接 WebSocket；`VisualizerStage` 创建 Three.js 场景 |
| **useRef** | 一个不会触发重新渲染的“盒子”，常用来拿到真实 DOM 元素 | `mountRef` 指向 Three.js 画布要放进去的 `<div>` |

还有一个：**自定义 Hook**。名字以 `use` 开头、内部用了 `useState`/`useEffect` 的函数，用来把一段逻辑打包复用。`useDoaSocket` 就是一个自定义 Hook。

## 3. TypeScript 带来了什么

TypeScript = JavaScript + 类型。比如 `types.ts` 里：

```ts
export interface DoaData { x: number; y: number; z: number; volume?: number; }
export type OrbMode = "faces" | "wireframe" | "arrow" | "furhat";
```

好处：如果你在哪里写错成 `orbMode = "face"`，或者把字符串传给了需要数字的地方，`npm run build` 直接报错，不用等到浏览器里才发现。`volume?` 的问号表示这个字段可以没有。

## 4. 文件结构

```
src/
  main.tsx          入口：把 <App /> 放进 index.html 的 <div id="root">
  App.tsx           最顶层组件：保存共享状态，摆放所有子组件
  types.ts          所有类型定义
  config.ts         默认值、读取 URL 参数、解析 WebSocket 消息
  hooks/
    useDoaSocket.ts WebSocket 连接 + 自动重连（自定义 Hook）
  components/       React 界面组件（左侧面板 + 3D 舞台容器）
  three/            纯 Three.js 代码，这里面没有 React
    sceneSetup.ts   场景、相机、灯光、动画循环、销毁
    doaController.ts 方向和音量的平滑处理
    renderers/      四种模式，每种一个文件
```

一个好记的分法：**`components/` 管界面，`three/` 管 3D，`hooks/` 管数据连接，`App.tsx` 把它们拼起来。**

## 5. 页面是怎么拼起来的

```
App                       ← 保存 mode、styles 两个 state
├─ ControlPanel           ← 左侧面板外壳（logo）
│  ├─ ConnectionStatus    ← 地址、状态圆点、收到多少条消息
│  ├─ LatestData          ← 最新一条数据的 JSON
│  ├─ ModeSwitch          ← 四个模式按钮
│  ├─ StyleControls       ← 颜色、透明度、滑块
│  └─ DataHistory         ← 最近 8 条数据的表格
└─ VisualizerStage        ← 右侧 3D 区域（React 和 Three.js 的桥）
```

数据是**从上往下**流的：`App` 有 state，通过 props 传给子组件。子组件想改数据时，调用父组件传下来的函数，比如 `ModeSwitch` 的 `onChange={setMode}`。这叫“单向数据流”。

## 6. 最关键的一点：React 和 Three.js 怎么配合

这是面试最值得讲的部分。

**问题：** React 每次 state 变化都会重新执行组件函数。如果把每一帧动画或者每条 DOA 数据都放进 React state，会有很多不必要的重新渲染，3D 动画可能会卡。

**做法：**

1. React 只渲染一个空的 `<div>`，用 `useRef` 拿到它。
2. 在 `useEffect` 里调用 `RENDERERS[mode](div)`，Three.js 把 canvas 放进这个 div，自己用 `requestAnimationFrame` 跑动画循环。
3. `useEffect` 返回的清理函数会调用 `renderer.dispose()`：停止动画、释放显存、删除 canvas。所以**切换模式时**，React 会先清理旧场景，再创建新场景，不用刷新整个页面（旧版是靠刷新页面切换的）。
4. 每条 WebSocket 数据直接调用 `renderer.update(data)` 交给 3D 场景，不经过 React 渲染；同时只把需要显示在面板上的东西（最新数据、历史表格）放进 state。

React 和 Three.js 之间只通过一个很小的接口沟通（`types.ts` 里的 `OrbRenderer`）：

```ts
interface OrbRenderer {
  update(data: DoaData): void;   // 喂新数据
  setStyle(style): void;         // 改颜色/透明度
  dispose(): void;               // 销毁
}
```

想加第五种模式，只需要新写一个 renderer 文件，再在 `renderers/index.ts` 加一行。

## 7. 一条 DOA 数据的完整旅程

1. Node.js 模拟服务器（或真实后端）发出 `{"x":0.8,"y":0.1,"z":0.5,"volume":180}`。
2. `useDoaSocket` 收到消息，用 `parseDoaMessage` 检查格式，得到一个有类型的 `DoaData`。
3. 调用 `onData(data)` → `VisualizerStage.pushData` → `renderer.update(data)`，3D 场景更新目标方向。
4. 同时更新 state：消息计数 +1，历史表格加一行，`LatestData` 显示新 JSON。
5. 每一帧，`doaController` 把当前方向慢慢插值到目标方向（平滑），超过 1.2 秒没新数据，音量慢慢降到 0。

## 8. 怎么运行

```bash
npm install
npm run mock     # 终端 1：模拟数据服务器 ws://localhost:9000
npm run dev      # 终端 2：打开 http://localhost:8080/?ws=ws://localhost:9000
```

改任何 `.tsx` 文件保存后，浏览器会自动刷新（Vite 的热更新）。

## 9. 面试时可以这样讲（参考）

> 这是我做的一个声源定位可视化工具。后端用四麦克风阵列算出声音方向，通过 WebSocket 推到前端。最初我用原生 JavaScript 写，后来用 React + TypeScript 重构了。
>
> 我的划分是：React 负责所有界面，比如连接状态、实时数据表格、模式切换和样式控制；Three.js 负责 3D 渲染。两者之间我定义了一个很小的 `OrbRenderer` 接口，React 不需要知道任何网格或材质的细节。
>
> 一个关键决定是：高频的 DOA 数据直接交给 Three.js 的动画循环，不走 React 的重新渲染，这样 60 帧动画不会被界面更新拖慢。切换模式时用 `useEffect` 的清理函数释放 WebGL 资源，旧版需要刷新整个页面，现在是即时切换。
>
> 这和游戏引擎的编辑器工具很像：中间是渲染视口，周围是属性面板和数据面板，面板改参数，视口实时反映。

**可能被追问的问题：**

- *为什么不用 react-three-fiber？* 原有的 Three.js 代码已经可以用，保持它是纯 Three.js 可以让渲染逻辑和 UI 框架解耦，迁移成本也最低。如果场景变复杂、需要很多可交互的 3D 对象，可以考虑 react-three-fiber。
- *useEffect 里为什么要 return 一个函数？* 那是清理函数，组件卸载或依赖变化时执行，用来关闭 WebSocket、停止动画、释放显存，防止内存泄漏。
- *为什么 onData 用 ref 保存？* 这样回调变化时不会导致 WebSocket 断开重连，只有 URL 变化才重连。
- *开发时为什么控制台会出现一次 WebSocket 关闭的提示？* React 的 `StrictMode` 在开发模式会故意挂载、卸载、再挂载一次组件，用来检查清理函数写得对不对。生产构建不会这样。

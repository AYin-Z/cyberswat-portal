/// <reference types="vite/client" />

// 注：不再声明 `declare module '*.vue'` —— vue-tsc/Volar 原生解析 SFC 类型，
// 旧样板（DefineComponent<{}, {}, any>）会覆盖真实组件类型并触发 any 规则。

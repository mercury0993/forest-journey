# Voice Input — 设计文档

> 2026-06-14

## 概述

为评估流程的文本输入添加语音输入能力，使用浏览器原生 Web Speech API（SpeechRecognition），零外部依赖。

## 范围

SceneAnimal 组件的 step 2（textarea "它正在做什么？"）和 step 3（input "它看到你了吗？"）。step 1（动物名称）和 step 4（感受选择）不用语音。

## 技术方案

### VoiceInput 组件

新建 `components/shared/VoiceInput.tsx`：

```
Props:
  onTranscript: (text: string) => void  // 识别结果回调
  disabled?: boolean
```

内部：
- 使用 `SpeechRecognition || webkitSpeechRecognition`，语言 `zh-CN`
- 状态：`idle | listening | error`
- `onPointerDown` → `recognition.start()`
- `onPointerUp / onPointerLeave` → `recognition.stop()`，回调 `onTranscript(transcript)`
- 识别中实时 `onresult` 更新 interim transcript
- 浏览器不支持时返回 `null`（父组件检测后不渲染按钮）

### 集成点

SceneAnimal.tsx 的 step 2 和 step 3：
- textarea/input 容器改为 flex 布局，输入框 flex-1，右侧放 VoiceInput 按钮
- transcript 追加到现有文本（不覆盖）：
  - step 2: `setFollowUp1(prev => (prev ? prev + transcript : transcript))`
  - step 3: `setFollowUp2(prev => (prev ? prev + "，" + transcript : transcript))`

### 视觉设计

**空闲态：** 麦克风 SVG 图标（16x16），白色 30% 透明度，hover 变亮

**录音态：**
- 图标变红色（`#ef4444`），脉冲动画（scale 1 → 1.3 → 1 循环）
- 实时识别文字浮动在按钮上方（绝对定位），白底半透明气泡

**不支持态：** 组件返回 null，文本框占满宽度，无任何可见变化

### 错误处理

| 场景 | 处理 |
|---|---|
| 浏览器不支持 SpeechRecognition | VoiceInput 返回 null，静默降级 |
| 用户拒绝麦克风权限 | `onerror` 捕获 `not-allowed`，alert-style 提示 |
| 识别结果为空字符串 | 不调用 onTranscript |
| 快速连续点击 | recognition.start() 前检查状态，已在 listening 则忽略 |
| 移动端键盘弹起 | 不处理（自动行为） |

## 文件变更

- **新建** `components/shared/VoiceInput.tsx`
- **修改** `components/assessment/SceneAnimal.tsx`（step 2、step 3 集成 VoiceInput）

## 验证标准

- TypeScript 0 错误
- 17/17 测试通过
- Chrome/Edge 长按录音正常，Safari/Firefox 静默降级
- 识别文字正确追加到文本框

# B 端管理后台 — 子系统 1：管理员认证 + 后台布局

> 2026-06-15

## 概述

为森林之旅增加管理后台，第一个子系统实现管理员识别、登录入口、后台布局框架。后续子系统的页面在此布局内填充。

## 管理员识别

**方案：** Supabase `user.user_metadata.is_admin`

- 在 Supabase Dashboard → Authentication → Users → 编辑用户 → `user_metadata` 添加 `{ "is_admin": true }`
- 新建 `lib/admin.ts`：
  ```
  isAdmin(user: User | null): boolean  // 读取 user.user_metadata.is_admin
  ```
- 后续可通过 admin 管理页批量标记（远期）

## 登录入口

- **直接访问 `/admin`：** 未登录 → 顶部 toast 提示"请先登录"；已登录但非 admin → 404 重定向首页；admin → 显示后台
- **C 端自动入口：** `ForestLayout` / 导航中，若 `isAdmin(user)` 为 true，显示"管理后台"链接

## 路由结构

```
app/(admin)/
├── layout.tsx          # 后台布局（侧边栏 + 顶栏 + 内容区）
├── page.tsx            # Dashboard 仪表盘（空状态占位）
├── invite-codes/       # 测评码管理（子系统 2 占位）
│   └── page.tsx        # 占位页
├── team-dashboard/     # 团队看板（子系统 3 占位）
│   └── page.tsx
├── role-models/        # 岗位模型（子系统 4 占位）
│   └── page.tsx
└── export/             # 报告导出（子系统 5 占位）
    └── page.tsx
```

## 后台布局（AdminLayout）

**侧边栏（200px 宽，深色）：**
- Logo/标题："森林之旅 · 管理"
- 导航项（图标 + 文字）：
  - 📊 数据仪表盘 → `/admin`
  - 🎫 测评码管理 → `/admin/invite-codes`
  - 👥 团队看板 → `/admin/team-dashboard`
  - 🎯 岗位模型 → `/admin/role-models`
  - 📤 报告导出 → `/admin/export`
- 底部：返回首页链接 + 退出按钮
- 当前页高亮

**顶栏：**
- 左侧：当前页面标题
- 右侧：管理员头像/用户名 + 退出按钮

**内容区：**
- 深色背景，与 C 端森林调性一致
- 占位页面显示"即将上线"空状态

## 权限守卫

- `(admin)/layout.tsx` 中 `useEffect` 检查 `isAdmin(user)`
- 非 admin → `router.replace("/")` + toast
- 无需 middleware 拦截（不影响 C 端路由）

## 文件变更

- **新建** `lib/admin.ts` — isAdmin 工具函数
- **新建** `app/(admin)/layout.tsx` — 后台布局 + 权限守卫
- **新建** `app/(admin)/page.tsx` — 仪表盘占位
- **新建** `app/(admin)/invite-codes/page.tsx` — 占位
- **新建** `app/(admin)/team-dashboard/page.tsx` — 占位
- **新建** `app/(admin)/role-models/page.tsx` — 占位
- **新建** `app/(admin)/export/page.tsx` — 占位
- **修改** `context/UserContext.tsx` — 暴露 isAdmin 状态
- **修改** `components/layout/ForestLayout.tsx` 或导航组件 — 管理员显示后台入口

## 验证标准

- TypeScript 0 错误
- 17/17 测试通过
- `/admin` 未登录重定向，非 admin 404，admin 正常显示
- 侧边栏导航切换正常，高亮正确
- C 端导航：admin 用户能看到"管理后台"入口

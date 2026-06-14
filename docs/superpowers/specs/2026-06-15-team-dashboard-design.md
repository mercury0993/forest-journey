# B 端管理后台 — 子系统 3：团队看板

> 2026-06-15

## 概述

管理员查看所有通过邀请码注册的团队成员的测评汇总数据：概览面板、成员列表、批次分组。

## 数据补丁

新增 `invite_code_users` 表，追踪用户-邀请码映射：

```prisma
model InviteCodeUser {
  id           String   @id @default(cuid())
  inviteCodeId String   @map("invite_code_id")
  userId       String   @map("user_id") @db.Uuid
  createdAt    DateTime @default(now()) @map("created_at")

  @@map("invite_code_users")
}
```

claim-code API 核销成功后写入此表。

## 数据查询

后台 API `app/api/admin/team/route.ts`：
- 查管理员创建的所有邀请码 → 通过 invite_code_users 找到所有 userId → 查这些 userId 的 reports
- 返回聚合数据供前端渲染

## 团队看板页面

`app/admin/team-dashboard/page.tsx` — 三个标签页切换：

### 概览面板
- 统计卡片：总人数、测评完成数
- 原型分布：6 种动物原型计数，水平条形图
- 四维平均分：复用 RadarChart，所有成员四维取均值
- 最近测评：时间线列表（邮箱 + 原型 + 时间）

### 成员列表
- 表格：邮箱 | 原型 | 共情 | 规则 | 韧性 | 角色 | 测评时间 | 批次
- 支持按原型筛选（下拉选择）
- 按列排序（点击列头）

### 批次分组
- 卡片网格，每张卡片对应一个邀请码
- 显示：标签、人数、成员原型列表
- 点击可展开查看该批次成员

## 文件变更

- **修改** `prisma/schema.prisma` — 新增 InviteCodeUser 模型 + SQL 迁移
- **修改** `app/api/auth/claim-code/route.ts` — 写入 InviteCodeUser
- **新建** `app/api/admin/team/route.ts` — 团队聚合数据 API
- **修改** `app/admin/team-dashboard/page.tsx` — 完整看板页面

## 验证标准

- TypeScript 0 错误 + 构建成功 + 17/17 测试通过
- 概览面板正确显示统计数据、原型分布、四维平均分
- 成员列表表格数据正确，排序筛选工作正常
- 批次分组卡片数据正确

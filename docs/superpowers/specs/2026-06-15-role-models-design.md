# B 端管理后台 — 子系统 4：岗位模型

> 2026-06-15

## 概述

管理员定义岗位理想四维画像，查看团队候选人匹配度排名，辅助招聘决策。

## 数据库

```prisma
model RoleModel {
  id          String   @id @default(cuid())
  name        String
  empathy     Int      // 0-100
  rule        Int
  resilience  Int
  role        Int
  createdBy   String   @map("created_by") @db.Uuid
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("role_models")
}
```

## 管理页面

`app/admin/role-models/page.tsx`：

**创建表单（顶部折叠）：**
- 岗位名称输入框
- 4 个滑块（共情/规则/韧性/角色），范围 0-100，显示当前值
- 实时雷达图预览
- 保存按钮

**岗位列表（主体）：**
- 卡片网格，每张卡片显示：
  - 岗位名称
  - 小雷达图（四维值）
  - 编辑 / 删除 / 匹配候选人 按钮

**候选人匹配（展开面板）：**
- 雷达图叠加（岗位理想线 vs 候选人）
- 列表按 Euclidean distance 排序
- 每行：原型名 + 四维分 + 匹配度（100 - distance%，距离越小越匹配）

## API

`app/api/admin/role-models/route.ts`：
- GET: 返回当前管理员的所有岗位模型
- POST: `{ name, empathy, rule, resilience, role }` → 创建
- DELETE: `?id=` → 删除

匹配逻辑在前端计算（多一个 API 没必要）。

## 文件变更

- **修改** `prisma/schema.prisma` — 新增 RoleModel 模型
- **新建** `prisma/migrations/...add_role_models/migration.sql`
- **新建** `app/api/admin/role-models/route.ts` — CRUD API
- **修改** `app/admin/role-models/page.tsx` — 管理页面

## 验证标准

- TypeScript 0 错误 + 构建成功 + 17/17 测试通过
- 可创建岗位模型，列表实时刷新
- 候选人匹配排序正确
- 雷达图叠加对比可读

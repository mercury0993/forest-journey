# B 端管理后台 — 子系统 2：测评码管理

> 2026-06-15

## 概述

管理员生成邀请码，用户注册时选填，自动关联分组，管理员查看每组用户的测评结果。

## 数据库

新增 `invite_codes` 表：

```prisma
model InviteCode {
  id        String   @id @default(cuid())
  code      String   @unique
  label     String?
  maxUses   Int      @default(1)
  usedCount Int      @default(0)  @map("used_count")
  isActive  Boolean  @default(true) @map("is_active")
  createdBy String   @map("created_by") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")

  @@map("invite_codes")
}
```

码格式：`FJ-` 前缀 + 6 位随机大写字母数字，如 `FJ-A3K7M9`。

## 管理员功能

**测评码管理页 `app/admin/invite-codes/page.tsx`：**
- 顶部：批量生成表单（标签、数量 1-100、生成按钮）
- 主体：码列表表格（码、标签、已用/上限、状态、操作）
- 行操作：停用/启用切换
- 点击码 → 跳转详情页

**码详情页 `app/admin/invite-codes/[id]/page.tsx`：**
- 显示码信息（标签、使用次数、创建时间）
- 使用者列表：邮箱 + 测评结果摘要（动物原型、四维分数）+ 测评时间

## API

**生成/查询码 `app/api/admin/invite-codes/route.ts`：**
- GET: 返回该管理员创建的所有码列表
- POST: `{ label, count }` → 批量生成

**核销码 `app/api/auth/claim-code/route.ts`：**
- POST: `{ code, userId }` → 增加 usedCount，验证码有效性

## 用户端

**AuthModal 注册表单：**
- 密码字段下方加"邀请码（选填）"输入框
- 注册成功后，若填写了码，调用 claim-code API
- 邀请码存入 `user_metadata.invite_code`

## 权限

- 以上 API 和页面均需 admin 权限
- claim-code API 公开可调用（注册时）

## 文件变更

- **修改** `prisma/schema.prisma` — 新增 InviteCode 模型
- **修改** `app/admin/invite-codes/page.tsx` — 码管理主页面
- **新建** `app/admin/invite-codes/[id]/page.tsx` — 码详情页
- **新建** `app/api/admin/invite-codes/route.ts` — 管理 API
- **新建** `app/api/auth/claim-code/route.ts` — 核销 API
- **修改** `components/auth/AuthModal.tsx` — 注册加邀请码
- **新建** `lib/invite-code.ts` — 码生成/验证工具函数

## 验证标准

- TypeScript 0 错误 + 17/17 测试通过 + 构建成功
- 管理员可批量生成码，表格实时刷新
- 用户注册时填码，注册后数据正确关联
- 码详情页显示正确用户列表

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getTeamMembers } from "@/lib/invite-code";
import { isAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await getTeamMembers(user.id);

  const header = ["原型", "共情", "规则", "韧性", "角色", "测评时间", "批次"];
  const rows = data.reports.map((r: Record<string, unknown>) => [
    r.roleTitle,
    (r.dimensions as { empathy: number }).empathy,
    (r.dimensions as { rule: number }).rule,
    (r.dimensions as { resilience: number }).resilience,
    (r.dimensions as { role: number }).role,
    new Date(r.createdAt as string).toLocaleDateString("zh-CN"),
    (r as { batchLabel?: string }).batchLabel || "-",
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => {
      const str = String(cell);
      // 防 CSV 公式注入：以 = + - @ 开头的值加单引号前缀
      const safe = /^[=+\-@]/.test(str) ? "'" + str : str;
      return `"${safe}"`;
    }).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="team-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

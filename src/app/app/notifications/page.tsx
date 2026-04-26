import { Card } from "@/components/ui/card";

export default function NotificationsPage() {
  return (
    <div className="space-y-4 pb-6">
      <h1 className="editorial-heading text-[28px] font-semibold tracking-tight text-[var(--foreground)]">通知中心</h1>
      <Card className="space-y-2 rounded-[24px]">
        <p className="text-sm text-[var(--foreground)]">这里会显示产品摘要生成、AI 建议更新和官方消息。</p>
        <p className="text-sm text-[var(--text-muted)]">暂时没有新的提醒。</p>
      </Card>
    </div>
  );
}

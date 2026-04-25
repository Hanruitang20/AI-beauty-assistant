import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AppHomePage() {
  return (
    <Card className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-rose-950">你的工作区已准备好</h1>
      <p className="text-sm text-rose-700/80">
        建议先完成初始设置，快速建立个人档案，再开始整理你的产品库。
      </p>
      <Link href="/app/onboarding">
        <Button>前往开始设置</Button>
      </Link>
    </Card>
  );
}

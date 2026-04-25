import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-rose-950">开始设置你的 BeautyShelf AI</h1>
        <p className="max-w-2xl text-sm leading-6 text-rose-700/80">
          你可以直接填写个人档案，也可以先做一个轻量测评，再一键应用到档案里。
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-rose-900">直接填写我的档案</h2>
            <p className="mt-2 text-sm text-rose-700/80">
              适合已经了解自己肤质、偏好和护肤目标的你。
            </p>
          </div>
          <Link href="/app/profile/edit">
            <Button className="w-full">去填写档案</Button>
          </Link>
        </Card>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-rose-900">先做快速肤质与习惯测评</h2>
            <p className="mt-2 text-sm text-rose-700/80">
              回答几个简单问题，快速拿到可用的初始档案。
            </p>
          </div>
          <Link href="/app/assessment">
            <Button variant="secondary" className="w-full">
              开始快速测评
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

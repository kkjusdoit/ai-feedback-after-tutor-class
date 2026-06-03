"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = () => {
    if (phone.length < 11) return;
    setCodeSent(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm grain-overlay relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal/[0.04] blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber/[0.06] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[400px] px-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-teal flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h1 className="font-heading text-[22px] font-bold text-foreground">AI课后反馈助手</h1>
          <p className="text-[14px] text-muted-foreground mt-2">智能生成专业、真实的课后反馈</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 shadow-lg shadow-black/[0.04] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">手机号</Label>
              <Input
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value.slice(0, 11))}
                className="h-10 text-[14px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px] text-muted-foreground">验证码</Label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.slice(0, 6))}
                  className="h-10 text-[14px] flex-1"
                />
                <Button
                  variant="outline"
                  className="h-10 px-4 text-[13px] shrink-0"
                  disabled={phone.length < 11 || countdown > 0}
                  onClick={handleSendCode}
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </Button>
              </div>
            </div>

            <Button
              className="w-full h-10 text-[14px] font-medium bg-teal hover:bg-teal-dark shadow-sm"
              onClick={handleLogin}
            >
              登录
            </Button>

            <p className="text-[12px] text-center text-muted-foreground">
              登录即表示同意{" "}
              <span className="text-teal cursor-pointer hover:underline">用户协议</span>{" "}
              和{" "}
              <span className="text-teal cursor-pointer hover:underline">隐私政策</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

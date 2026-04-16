import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string; value: string; change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode; accent?: string; sublabel?: string;
}

export function StatCard({ title, value, change, changeType="neutral", icon, accent, sublabel }: StatCardProps) {
  return (
    <div className="rounded-2xl p-5 pos-shadow border border-border bg-white animate-fade-up overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-6 -translate-y-6 translate-x-6"
        style={{ background: accent || "hsl(var(--primary))", filter:"blur(18px)" }} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="text-3xl font-black mt-1.5 text-foreground font-mono">{value}</p>
          {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
          {change && (
            <div className={cn("flex items-center gap-1 mt-1.5 text-[11px] font-semibold",
              changeType==="positive" && "text-emerald-600",
              changeType==="negative" && "text-red-500",
              changeType==="neutral"  && "text-muted-foreground")}>
              {changeType==="positive" && <TrendingUp  className="w-3 h-3" />}
              {changeType==="negative" && <TrendingDown className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent ? `${accent}18` : "hsl(var(--primary) / 0.12)", color: accent || "hsl(var(--primary))" }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

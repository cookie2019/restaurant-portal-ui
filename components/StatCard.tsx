import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "default" | "green" | "amber" | "blue" | "purple";
  sub?: string;
}

const COLOR_MAP = {
  default: { icon: "text-[#8888a0]", bg: "bg-white/5" },
  green: { icon: "text-green-400", bg: "bg-green-400/10" },
  amber: { icon: "text-amber-400", bg: "bg-amber-400/10" },
  blue: { icon: "text-blue-400", bg: "bg-blue-400/10" },
  purple: { icon: "text-[#6c63ff]", bg: "bg-[#6c63ff]/10" },
};

export function StatCard({ label, value, icon: Icon, color = "default", sub }: Props) {
  const colors = COLOR_MAP[color];
  return (
    <div className="rounded-xl border border-[#2a2a32] bg-[#111114] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-[#8888a0] mb-1">{label}</p>
          <p className="text-2xl font-semibold text-[#f0f0f5]">{value}</p>
          {sub && <p className="text-[12px] text-[#55556a] mt-0.5">{sub}</p>}
        </div>
        <div className={cn("p-2 rounded-lg", colors.bg)}>
          <Icon className={cn("w-4 h-4", colors.icon)} />
        </div>
      </div>
    </div>
  );
}

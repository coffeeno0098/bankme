import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface EmptyDashboardStateProps {
  onAddTransaction: () => void;
}

export function EmptyDashboardState({ onAddTransaction }: EmptyDashboardStateProps) {
  return (
    <div className="bg-card rounded-xl p-12 text-center space-y-5">
      <div className="space-y-2">
        <h2 className="font-display text-display-sm">ยังไม่มีรายการ</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          เริ่มเพิ่มรายรับหรือรายจ่ายแรกของคุณเลย!
        </p>
      </div>
      <Button onClick={onAddTransaction} size="lg" className="rounded-lg h-11 px-6 font-semibold text-sm">
        <PlusCircle className="mr-2 h-4 w-4" />
        เพิ่มรายการแรก
      </Button>
    </div>
  );
}

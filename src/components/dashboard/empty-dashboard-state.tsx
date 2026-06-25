import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface EmptyDashboardStateProps {
  onAddTransaction: () => void;
}

export function EmptyDashboardState({ onAddTransaction }: EmptyDashboardStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-center">ยังไม่มีรายการ</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-8">
        <p className="text-center text-muted-foreground">
          เริ่มเพิ่มรายรับหรือรายจ่ายแรกของคุณเลย!
        </p>
        <Button onClick={onAddTransaction} size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          เพิ่มรายการแรก
        </Button>
      </CardContent>
    </Card>
  );
}

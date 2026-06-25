import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatTHB } from "@/lib/format";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface TransactionRow {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_at: string;
  category_name: string | null;
}

interface TransactionTableProps {
  transactions: TransactionRow[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">ยังไม่มีรายการในเดือนนี้</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">วันที่</TableHead>
            <TableHead>ประเภท</TableHead>
            <TableHead>หมวดหมู่</TableHead>
            <TableHead>รายละเอียด</TableHead>
            <TableHead className="text-right">จำนวนเงิน</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-xs text-muted-foreground">
                {format(new Date(tx.transaction_at), "d MMM yy", { locale: th })}
              </TableCell>
              <TableCell>
                <Badge variant={tx.type === "income" ? "default" : "destructive"}>
                  {tx.type === "income" ? "รายรับ" : "รายจ่าย"}
                </Badge>
              </TableCell>
              <TableCell>
                {tx.type === "expense" ? tx.category_name ?? "-" : "-"}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm">
                {tx.description || "-"}
              </TableCell>
              <TableCell className="text-right font-medium">
                <span className={tx.type === "income" ? "text-emerald-600" : "text-red-600"}>
                  {tx.type === "expense" ? "-" : ""}
                  {formatTHB(tx.amount)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

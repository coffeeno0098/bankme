"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transactionSchema, type TransactionInput } from "@/lib/validation/transaction";
import { createTransaction } from "@/app/(app)/actions/transactions";
import { Loader2 } from "lucide-react";
import type { Category } from "@/lib/database.types";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

export function TransactionDialog({ open, onOpenChange, categories }: TransactionDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      transaction_at: new Date().toISOString().slice(0, 16),
      description: "",
      category_id: null,
    },
  });

  const transactionType = watch("type");

  async function onSubmit(data: TransactionInput) {
    setSubmitting(true);
    try {
      await createTransaction({
        type: data.type,
        amount: data.amount,
        description: data.description || null,
        transaction_at: new Date(data.transaction_at).toISOString(),
        category_id: data.type === "expense" ? data.category_id : null,
      });
      toast.success(
        data.type === "income" ? "เพิ่มรายรับสำเร็จ!" : "เพิ่มรายจ่ายสำเร็จ!"
      );
      reset();
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>เพิ่มรายการ</DialogTitle>
          <DialogDescription>เพิ่มรายรับหรือรายจ่ายของคุณ</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>ประเภท</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={transactionType === "expense" ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => {
                  setValue("type", "expense");
                  setValue("category_id", null);
                }}
              >
                รายจ่าย
              </Button>
              <Button
                type="button"
                variant={transactionType === "income" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setValue("type", "income");
                  setValue("category_id", null);
                }}
              >
                รายรับ
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="transaction_at">วันที่และเวลา</Label>
            <Input
              id="transaction_at"
              type="datetime-local"
              {...register("transaction_at")}
            />
            {errors.transaction_at && (
              <p className="text-sm text-red-500">{errors.transaction_at.message}</p>
            )}
          </div>

          {/* Category (expense only) */}
          {transactionType === "expense" && (
            <div className="space-y-2">
              <Label>หมวดหมู่</Label>
              <Select
                onValueChange={(value) => {
                  if (value) setValue("category_id", value as string);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-500">{errors.category_id.message}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">หมายเหตุ (ไม่จำเป็น)</Label>
            <Input
              id="description"
              placeholder="เช่น ข้าวเที่ยง, ค่าน้ำมัน"
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

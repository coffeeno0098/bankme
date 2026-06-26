"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatTHB } from "@/lib/format";
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
import { createTransaction, updateTransaction } from "@/app/(app)/actions/transactions";
import { Loader2 } from "lucide-react";
import type { Category } from "@/lib/database.types";

const EXCHANGE_RATES: Record<string, number> = {
  THB: 1.0,
  USD: 34.5,
  EUR: 37.5,
  JPY: 0.22,
  GBP: 44.0,
};

type TransactionFormValues = Omit<TransactionInput, "currency" | "exchange_rate" | "attachment_path"> & {
  currency?: string;
  exchange_rate?: number;
  attachment_path?: string | null;
};

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  transaction?: {
    id: string;
    type: "income" | "expense";
    amount: number;
    description: string | null;
    transaction_at: string;
    category_id: string | null;
    currency?: string;
    exchange_rate?: number;
    attachment_path?: string | null;
  } | null;
}

export function TransactionDialog({
  open,
  onOpenChange,
  categories,
  transaction,
}: TransactionDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      transaction_at: new Date().toISOString().slice(0, 16),
      description: "",
      category_id: null,
      currency: "THB",
      exchange_rate: 1.0,
      attachment_path: null,
    },
  });

  const isEdit = !!transaction;

  useEffect(() => {
    if (open) {
      setFile(null);
      if (transaction) {
        reset({
          type: transaction.type,
          amount: transaction.amount,
          transaction_at: new Date(transaction.transaction_at)
            .toISOString()
            .slice(0, 16),
          description: transaction.description || "",
          category_id: transaction.category_id,
          currency: transaction.currency || "THB",
          exchange_rate: transaction.exchange_rate || 1.0,
          attachment_path: transaction.attachment_path || null,
        });
      } else {
        reset({
          type: "expense",
          amount: 0,
          transaction_at: new Date().toISOString().slice(0, 16),
          description: "",
          category_id: null,
          currency: "THB",
          exchange_rate: 1.0,
          attachment_path: null,
        });
      }
    }
  }, [open, transaction, reset]);

  const selectedCurrency = watch("currency");
  const transactionType = watch("type");
  const watchAmount = watch("amount");
  const watchExchangeRate = watch("exchange_rate");
  const categoryId = watch("category_id");

  useEffect(() => {
    if (selectedCurrency) {
      setValue("exchange_rate", EXCHANGE_RATES[selectedCurrency] || 1.0);
    }
  }, [selectedCurrency, setValue]);

  async function onSubmit(data: TransactionFormValues) {
    setSubmitting(true);
    try {
      let attachmentPath = data.attachment_path || null;
      
      if (file) {
        const supabase = createClient();
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(fileName, file);
          
        if (uploadError) {
          throw new Error("อัปโหลดใบเสร็จล้มเหลว: " + uploadError.message);
        }
        attachmentPath = fileName;
      }

      if (isEdit && transaction) {
        const res = await updateTransaction({
          id: transaction.id,
          type: data.type,
          amount: data.amount,
          description: data.description || null,
          transaction_at: new Date(data.transaction_at).toISOString(),
          category_id: data.type === "expense" ? data.category_id : null,
          currency: data.currency,
          exchange_rate: data.exchange_rate,
          attachment_path: attachmentPath,
        });
        if (!res.success) {
          throw new Error(res.error);
        }
        toast.success("แก้ไขรายการสำเร็จ!");
      } else {
        const res = await createTransaction({
          type: data.type,
          amount: data.amount,
          description: data.description || null,
          transaction_at: new Date(data.transaction_at).toISOString(),
          category_id: data.type === "expense" ? data.category_id : null,
          currency: data.currency,
          exchange_rate: data.exchange_rate,
          attachment_path: attachmentPath,
        });
        if (!res.success) {
          throw new Error(res.error);
        }
        toast.success(
          data.type === "income" ? "เพิ่มรายรับสำเร็จ!" : "เพิ่มรายจ่ายสำเร็จ!"
        );
      }
      setFile(null);
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
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">{isEdit ? "แก้ไขรายการ" : "เพิ่มรายการ"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "แก้ไขรายละเอียดธุรกรรมของคุณ" : "เพิ่มรายรับหรือรายจ่ายของคุณ"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Type — Cal.com pill-group toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">ประเภท</Label>
            <div className="pill-group w-full">
              <button
                type="button"
                className="pill-group-item flex-1 text-center"
                data-active={transactionType === "expense" ? "true" : undefined}
                onClick={() => {
                  setValue("type", "expense");
                  setValue("category_id", null);
                }}
              >
                รายจ่าย
              </button>
              <button
                type="button"
                className="pill-group-item flex-1 text-center"
                data-active={transactionType === "income" ? "true" : undefined}
                onClick={() => {
                  setValue("type", "income");
                  setValue("category_id", null);
                }}
              >
                รายรับ
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">จำนวนเงิน (บาท)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="h-10 rounded-lg"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Currency (สกุลเงิน) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">สกุลเงิน</Label>
              <Select
                value={selectedCurrency || "THB"}
                onValueChange={(value) => {
                  setValue("currency", value || "THB");
                }}
              >
                <SelectTrigger className="w-full h-10 rounded-lg">
                  <SelectValue placeholder="THB" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THB">THB (฿)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchange_rate" className="text-sm font-medium">อัตราแลกเปลี่ยน (ต่อ THB)</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.000001"
                min="0"
                disabled={selectedCurrency === "THB"}
                className="h-10 rounded-lg"
                {...register("exchange_rate", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Converted preview (if foreign currency) */}
          {selectedCurrency !== "THB" && watchAmount > 0 && (
            <div className="text-xs text-muted-foreground bg-muted/40 px-4 py-2.5 rounded-lg flex justify-between items-center border border-dashed border-border">
              <span>จำนวนเงินหลังแปลงค่า:</span>
              <span className="font-number text-sm text-emerald-600 dark:text-emerald-400">
                {formatTHB(watchAmount * (watchExchangeRate || 1.0))}
              </span>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="transaction_at" className="text-sm font-medium">วันที่และเวลา</Label>
            <Input
              id="transaction_at"
              type="datetime-local"
              className="h-10 rounded-lg"
              {...register("transaction_at")}
            />
            {errors.transaction_at && (
              <p className="text-sm text-red-500">{errors.transaction_at.message}</p>
            )}
          </div>

          {/* Category (expense only) */}
          {transactionType === "expense" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">หมวดหมู่</Label>
              <Select
                value={categoryId ?? undefined}
                onValueChange={(value) => {
                  const currentValue = categoryId;
                  const newValue = value || null;
                  if (newValue !== currentValue) {
                    setValue("category_id", newValue);
                  }
                }}
              >
                <SelectTrigger className="h-10 rounded-lg">
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
            <Label htmlFor="description" className="text-sm font-medium">หมายเหตุ (ไม่จำเป็น)</Label>
            <Input
              id="description"
              placeholder="เช่น ข้าวเที่ยง, ค่าน้ำมัน"
              className="h-10 rounded-lg"
              {...register("description")}
            />
          </div>

          {/* Attachment (Receipt Upload) */}
          <div className="space-y-2">
            <Label htmlFor="attachment" className="text-sm font-medium">แนบรูปใบเสร็จ (ไม่จำเป็น)</Label>
            <Input
              id="attachment"
              type="file"
              accept="image/*"
              className="cursor-pointer h-10 rounded-lg file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            {/* Show link to current receipt if editing */}
            {transaction && transaction.attachment_path && !file && (
              <p className="text-xs text-muted-foreground mt-1">
                มีใบเสร็จเดิมแนบอยู่:{" "}
                <a
                  href={createClient().storage.from("receipts").getPublicUrl(transaction.attachment_path).data.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-primary hover:text-primary/80 font-medium"
                >
                  คลิกลิงก์เพื่อดูรูปภาพ
                </a>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full rounded-lg h-10 font-semibold text-sm">
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

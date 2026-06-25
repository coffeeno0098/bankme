"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categorySchema, type CategoryInput } from "@/lib/validation/category";
import { createCategory, renameCategory, softDeleteCategory } from "@/app/(app)/actions/categories";
import { Pencil, Trash2, Check, X, PlusCircle } from "lucide-react";
import type { Category } from "@/lib/database.types";

interface CategoryTableProps {
  categories: Category[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [adding, setAdding] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  });

  async function onAdd(data: CategoryInput) {
    try {
      await createCategory(data.name);
      toast.success("เพิ่มหมวดหมู่สำเร็จ");
      reset();
      setAdding(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  }

  async function handleRename(id: string) {
    if (!editValue.trim()) return;
    try {
      await renameCategory(id, editValue);
      toast.success("เปลี่ยนชื่อหมวดหมู่สำเร็จ");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`ต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`)) return;
    try {
      await softDeleteCategory(id);
      toast.success("ลบหมวดหมู่สำเร็จ");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">หมวดหมู่รายจ่าย</h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}>
          <PlusCircle className="mr-2 h-4 w-4" />
          เพิ่มหมวดหมู่
        </Button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={handleSubmit(onAdd)} className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="ชื่อหมวดหมู่ใหม่"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <Button type="submit" size="sm">เพิ่ม</Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAdding(false);
              reset();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </form>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อหมวดหมู่</TableHead>
              <TableHead className="w-[120px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                  ยังไม่มีหมวดหมู่ — เพิ่มหมวดหมู่แรกของคุณ!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    {editingId === cat.id ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="max-w-[300px]"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(cat.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      cat.name
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {editingId === cat.id ? (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRename(cat.id)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditValue(cat.name);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(cat.id, cat.name)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

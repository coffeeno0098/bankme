import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "กรุณากรอกชื่อหมวดหมู่")
    .refine((val) => val.trim().length > 0, "ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

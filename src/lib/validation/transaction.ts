import { z } from "zod";

export const transactionTypeEnum = z.enum(["income", "expense"]);

export const transactionSchema = z
  .object({
    type: transactionTypeEnum,
    amount: z.number().positive("จำนวนต้องมากกว่า 0"),
    transaction_at: z.string().datetime().or(z.date()),
    description: z.string().optional().or(z.literal("")),
    category_id: z.string().uuid().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "expense" && !data.category_id) {
        return false;
      }
      return true;
    },
    { message: "รายจ่ายต้องเลือกหมวดหมู่", path: ["category_id"] }
  )
  .refine(
    (data) => {
      if (data.type === "income" && data.category_id) {
        return false;
      }
      return true;
    },
    { message: "รายรับไม่ต้องมีหมวดหมู่", path: ["category_id"] }
  );

export type TransactionInput = z.infer<typeof transactionSchema>;

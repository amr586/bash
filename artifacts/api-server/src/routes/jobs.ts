import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { db, jobApplicationsTable } from "@workspace/db";

const router: IRouter = Router();

const jobApplySchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(255),
  qualifications: z.string().trim().min(10).max(5000),
  cvUrl: z.string().trim().max(1000).nullable().optional(),
});

router.post("/jobs/apply", async (req: Request, res: Response) => {
  const parsed = jobApplySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة.", details: parsed.error.flatten() });
    return;
  }

  await db.insert(jobApplicationsTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    qualifications: parsed.data.qualifications,
    cvUrl: parsed.data.cvUrl ?? null,
  });

  res.status(201).json({ message: "تم استلام طلبك بنجاح. هيتم التواصل معاك قريباً." });
});

export default router;

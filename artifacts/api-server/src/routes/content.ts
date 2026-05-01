import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { db, jobListingsTable, blogPostsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router: IRouter = Router();

function isAdmin(req: Request): boolean {
  if (!req.isAuthenticated() || !req.user) return false;
  const u = req.user as { isAdmin?: boolean; role?: string };
  return u.isAdmin === true || u.role === "super_admin" || u.role === "admin";
}

// ─── JOB LISTINGS ──────────────────────────────────────────────

const jobSchema = z.object({
  titleAr: z.string().trim().min(1).max(255),
  titleEn: z.string().trim().max(255).default(""),
  descriptionAr: z.string().trim().max(5000).default(""),
  descriptionEn: z.string().trim().max(5000).default(""),
  requirementsAr: z.string().trim().max(5000).default(""),
  requirementsEn: z.string().trim().max(5000).default(""),
  location: z.string().trim().max(255).default("التجمع الخامس، القاهرة الجديدة"),
  isActive: z.boolean().default(true),
});

// Public — active jobs only
router.get("/job-listings", async (_req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.isActive, true))
    .orderBy(desc(jobListingsTable.createdAt));
  res.json({ jobs: rows });
});

// Admin — all jobs
router.get("/admin/job-listings", async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const rows = await db.select().from(jobListingsTable).orderBy(desc(jobListingsTable.createdAt));
  res.json({ jobs: rows });
});

// Admin — create
router.post("/admin/job-listings", async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const parsed = jobSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data", issues: parsed.error.issues }); return; }
  const [row] = await db.insert(jobListingsTable).values(parsed.data).returning();
  res.status(201).json({ job: row });
});

// Admin — update
router.put("/admin/job-listings/:id", async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const parsed = jobSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data", issues: parsed.error.issues }); return; }
  const [row] = await db
    .update(jobListingsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(jobListingsTable.id, req.params.id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ job: row });
});

// Admin — delete
router.delete("/admin/job-listings/:id", async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(jobListingsTable).where(eq(jobListingsTable.id, req.params.id));
  res.json({ success: true });
});

// ─── BLOG POSTS ──────────────────────────────────────────────

const bodyBlockSchema = z.object({
  heading: z.string().max(500).optional(),
  text: z.string().max(10000),
  image: z.string().max(1000).optional(),
});

const blogSchema = z.object({
  slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9-]+$/),
  titleAr: z.string().trim().min(1).max(500),
  titleEn: z.string().trim().max(500).default(""),
  excerptAr: z.string().trim().max(2000).default(""),
  excerptEn: z.string().trim().max(2000).default(""),
  coverImageUrl: z.string().trim().max(1000).default(""),
  bodyAr: z.array(bodyBlockSchema).default([]),
  bodyEn: z.array(bodyBlockSchema).default([]),
  dateLabel: z.string().trim().max(100).default(""),
  isPublished: z.boolean().default(false),
});

// Public — published posts
router.get("/blog-posts", async (_req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.isPublished, true))
    .orderBy(desc(blogPostsTable.publishedAt));
  res.json({ posts: rows });
});

// Public — single post by slug
router.get("/blog-posts/:slug", async (req: Request, res: Response) => {
  const [row] = await db
    .select()
    .from(blogPostsTable)
    .where(and(eq(blogPostsTable.slug, req.params.slug), eq(blogPostsTable.isPublished, true)))
    .limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ post: row });
});

// Admin — all posts (including drafts)
router.get("/admin/blog-posts", async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const rows = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.createdAt));
  res.json({ posts: rows });
});

// Admin — create
router.post("/admin/blog-posts", async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const parsed = blogSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data", issues: parsed.error.issues }); return; }
  const values = {
    ...parsed.data,
    publishedAt: parsed.data.isPublished ? new Date() : null,
  };
  try {
    const [row] = await db.insert(blogPostsTable).values(values as typeof blogPostsTable.$inferInsert).returning();
    res.status(201).json({ post: row });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique")) {
      res.status(409).json({ error: "هذا الـ slug مستخدم بالفعل، اختر slug مختلف." });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// Admin — update
router.put("/admin/blog-posts/:id", async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  const parsed = blogSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data", issues: parsed.error.issues }); return; }
  const extra: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.isPublished === true) extra.publishedAt = new Date();
  if (parsed.data.isPublished === false) extra.publishedAt = null;
  try {
    const [row] = await db
      .update(blogPostsTable)
      .set({ ...parsed.data, ...extra } as Partial<typeof blogPostsTable.$inferInsert>)
      .where(eq(blogPostsTable.id, req.params.id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ post: row });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique")) {
      res.status(409).json({ error: "هذا الـ slug مستخدم بالفعل، اختر slug مختلف." });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// Admin — delete
router.delete("/admin/blog-posts/:id", async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, req.params.id));
  res.json({ success: true });
});

export default router;

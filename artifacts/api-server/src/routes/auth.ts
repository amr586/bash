import * as oidc from "openid-client";
import { z } from "zod";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetCurrentAuthUserResponse,
  ExchangeMobileAuthorizationCodeBody,
  ExchangeMobileAuthorizationCodeResponse,
  LogoutMobileSessionResponse,
} from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../lib/password";
import { createChallenge, consumeChallenge } from "../lib/otp";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  createSession,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL,
  ISSUER_URL,
  type SessionData,
} from "../lib/auth";

const OIDC_COOKIE_TTL = 10 * 60 * 1000;

const router: IRouter = Router();

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host =
    req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

const REMEMBER_TTL = 30 * 24 * 60 * 60 * 1000;

function setSessionCookie(res: Response, sid: string, ttl: number = SESSION_TTL) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ttl,
  });
}

function setOidcCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}

function getSafeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/";
  }
  return value;
}

async function upsertUser(claims: Record<string, unknown>) {
  // First user becomes super admin automatically.
  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(usersTable);
  const isFirstUser = existingCount === 0;

  const userData = {
    id: claims.sub as string,
    email: (claims.email as string) || null,
    firstName: (claims.first_name as string) || null,
    lastName: (claims.last_name as string) || null,
    profileImageUrl: (claims.profile_image_url || claims.picture) as
      | string
      | null,
  };

  const [user] = await db
    .insert(usersTable)
    .values({
      ...userData,
      isAdmin: isFirstUser,
    })
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        // Only update OIDC-provided fields; preserve phone/isAdmin set in app.
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

const STRONG_PW =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])[\S]{8,200}$/;
const STRONG_PW_MSG =
  "كلمة السر لازم 8 أحرف على الأقل وفيها حرف كبير ورقم ورمز.";

const signupSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().toLowerCase().email().max(255),
  phone: z.string().trim().min(3).max(30),
  password: z
    .string()
    .min(8, STRONG_PW_MSG)
    .max(200)
    .regex(STRONG_PW, STRONG_PW_MSG),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(200),
  remember: z.boolean().optional(),
});

const verifyOtpSchema = z.object({
  challengeId: z.string().trim().min(8).max(64),
  code: z.string().trim().regex(/^\d{6}$/, "كود من 6 أرقام."),
});

async function startLocalSession(
  res: Response,
  user: typeof usersTable.$inferSelect,
  remember = false,
) {
  const ttl = remember ? REMEMBER_TTL : SESSION_TTL;
  const sid = await createSession(
    {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
      access_token: "local",
    },
    ttl,
  );
  setSessionCookie(res, sid, ttl);
}

router.post("/auth/signup", async (req: Request, res: Response) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    res.status(400).json({
      error:
        first?.message ?? "بيانات غير صحيحة. راجع الحقول وحاول تاني.",
    });
    return;
  }
  const data = parsed.data;
  const [existing] = await db
    .select({ id: usersTable.id, hasPassword: usersTable.passwordHash })
    .from(usersTable)
    .where(eq(usersTable.email, data.email));
  if (existing) {
    res.status(409).json({
      error: "الإيميل ده مستخدم قبل كده. سجّل دخول بدل إنشاء حساب.",
    });
    return;
  }

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(usersTable);
  const isFirstUser = existingCount === 0;

  const passwordHash = await hashPassword(data.password);
  const [created] = await db
    .insert(usersTable)
    .values({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName ?? null,
      phone: data.phone,
      passwordHash,
      isAdmin: isFirstUser,
      role: isFirstUser ? "super_admin" : "user",
    })
    .returning();

  const challenge = createChallenge({ kind: "signup", userId: created.id });
  res.status(201).json({
    needsOtp: true,
    challengeId: challenge.challengeId,
    devOtp: challenge.code,
    expiresAt: challenge.expiresAt,
    target: data.phone,
  });
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات غير صحيحة." });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "الإيميل أو كلمة المرور غير صحيحة." });
    return;
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "الإيميل أو كلمة المرور غير صحيحة." });
    return;
  }
  if (user.isDisabled) {
    res
      .status(403)
      .json({ error: "هذا الحساب معطّل. تواصل مع الإدارة." });
    return;
  }

  const challenge = createChallenge({
    kind: "login",
    userId: user.id,
    remember: parsed.data.remember === true,
  });
  res.json({
    needsOtp: true,
    challengeId: challenge.challengeId,
    devOtp: challenge.code,
    expiresAt: challenge.expiresAt,
    target: user.phone ?? user.email,
  });
});

router.post("/auth/verify-otp", async (req: Request, res: Response) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "كود غير صحيح." });
    return;
  }
  const result = consumeChallenge(parsed.data.challengeId, parsed.data.code);
  if ("error" in result) {
    const map = {
      not_found: "انتهت صلاحية الجلسة. ابدأ من الأول.",
      expired: "الكود انتهت صلاحيته. اطلب كود جديد.",
      invalid_code: "الكود غلط. حاول تاني.",
    } as const;
    res.status(400).json({ error: map[result.error] });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, result.userId));
  if (!user) {
    res.status(404).json({ error: "الحساب مش موجود." });
    return;
  }
  await startLocalSession(res, user, result.remember);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      phone: user.phone,
      isAdmin: user.isAdmin,
      role: user.role,
    },
  });
});

router.post("/auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.json({ success: true });
});

router.get("/login", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;

  const returnTo = getSafeReturnTo(req.query.returnTo);

  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

  const redirectTo = oidc.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: "openid email profile offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "login consent",
    state,
    nonce,
  });

  setOidcCookie(res, "code_verifier", codeVerifier);
  setOidcCookie(res, "nonce", nonce);
  setOidcCookie(res, "state", state);
  setOidcCookie(res, "return_to", returnTo);

  res.redirect(redirectTo.href);
});

// Query params are not validated because the OIDC provider may include
// parameters not expressed in the schema.
router.get("/callback", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;

  const codeVerifier = req.cookies?.code_verifier;
  const nonce = req.cookies?.nonce;
  const expectedState = req.cookies?.state;

  if (!codeVerifier || !expectedState) {
    res.redirect("/api/login");
    return;
  }

  const currentUrl = new URL(
    `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
  );

  let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
  try {
    tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });
  } catch {
    res.redirect("/api/login");
    return;
  }

  const returnTo = getSafeReturnTo(req.cookies?.return_to);

  res.clearCookie("code_verifier", { path: "/" });
  res.clearCookie("nonce", { path: "/" });
  res.clearCookie("state", { path: "/" });
  res.clearCookie("return_to", { path: "/" });

  const claims = tokens.claims();
  if (!claims) {
    res.redirect("/api/login");
    return;
  }

  const dbUser = await upsertUser(
    claims as unknown as Record<string, unknown>,
  );

  const now = Math.floor(Date.now() / 1000);
  const sessionData: SessionData = {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      profileImageUrl: dbUser.profileImageUrl,
      phone: dbUser.phone,
      isAdmin: dbUser.isAdmin,
    },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.redirect(returnTo);
});

router.get("/logout", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const origin = getOrigin(req);

  const sid = getSessionId(req);
  await clearSession(res, sid);

  const endSessionUrl = oidc.buildEndSessionUrl(config, {
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: origin,
  });

  res.redirect(endSessionUrl.href);
});

router.post(
  "/mobile-auth/token-exchange",
  async (req: Request, res: Response) => {
    const parsed = ExchangeMobileAuthorizationCodeBody.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Missing or invalid required parameters" });
      return;
    }

    const { code, code_verifier, redirect_uri, state, nonce } = parsed.data;

    try {
      const config = await getOidcConfig();

      const callbackUrl = new URL(redirect_uri);
      callbackUrl.searchParams.set("code", code);
      callbackUrl.searchParams.set("state", state);
      callbackUrl.searchParams.set("iss", ISSUER_URL);

      const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
        pkceCodeVerifier: code_verifier,
        expectedNonce: nonce ?? undefined,
        expectedState: state,
        idTokenExpected: true,
      });

      const claims = tokens.claims();
      if (!claims) {
        res.status(401).json({ error: "No claims in ID token" });
        return;
      }

      const dbUser = await upsertUser(
        claims as unknown as Record<string, unknown>,
      );

      const now = Math.floor(Date.now() / 1000);
      const sessionData: SessionData = {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          profileImageUrl: dbUser.profileImageUrl,
          phone: dbUser.phone,
          isAdmin: dbUser.isAdmin,
        },
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
      };

      const sid = await createSession(sessionData);
      res.json(ExchangeMobileAuthorizationCodeResponse.parse({ token: sid }));
    } catch (err) {
      req.log.error({ err }, "Mobile token exchange error");
      res.status(500).json({ error: "Token exchange failed" });
    }
  },
);

router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) {
    await deleteSession(sid);
  }
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

export default router;

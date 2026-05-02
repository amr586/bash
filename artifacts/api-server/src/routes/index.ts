import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import propertiesRouter from "./properties";
import favoritesRouter from "./favorites";
import contactRouter from "./contact";
import notificationsRouter from "./notifications";
import bashakAiRouter from "./bashak-ai";
import storageRouter from "./storage";
import siteSettingsRouter from "./site-settings";
import jobsRouter from "./jobs";
import contentRouter from "./content";
import uploadsRouter from "./uploads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(propertiesRouter);
router.use(favoritesRouter);
router.use(contactRouter);
router.use(notificationsRouter);
router.use(bashakAiRouter);
router.use(storageRouter);
router.use(siteSettingsRouter);
router.use(jobsRouter);
router.use(contentRouter);
router.use(uploadsRouter);

export default router;

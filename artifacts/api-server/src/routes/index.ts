import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import propertiesRouter from "./properties";
import contactRouter from "./contact";
import notificationsRouter from "./notifications";
import bashakAiRouter from "./bashak-ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(propertiesRouter);
router.use(contactRouter);
router.use(notificationsRouter);
router.use(bashakAiRouter);

export default router;

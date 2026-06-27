import { Router, type IRouter } from "express";
import healthRouter from "./health";
import manuscriptsRouter from "./manuscripts";
import jobsRouter from "./jobs";
import dashboardRouter from "./dashboard";
import paymentsRouter from "./payments";
import subscriptionRouter from "./subscription";
import storageRouter from "./storage";
import accountRouter from "./account";
import userTemplatesRouter from "./userTemplates";
import adminRouter from "./admin";
import plansRouter from "./plans";

const router: IRouter = Router();

router.use(healthRouter);
router.use(manuscriptsRouter);
router.use(jobsRouter);
router.use(dashboardRouter);
router.use(paymentsRouter);
router.use(subscriptionRouter);
router.use(storageRouter);
router.use(accountRouter);
router.use(userTemplatesRouter);
router.use(adminRouter);
router.use(plansRouter);

export default router;

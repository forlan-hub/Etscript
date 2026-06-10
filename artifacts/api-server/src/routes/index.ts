import { Router, type IRouter } from "express";
import healthRouter from "./health";
import manuscriptsRouter from "./manuscripts";
import jobsRouter from "./jobs";
import dashboardRouter from "./dashboard";
import paymentsRouter from "./payments";
import subscriptionRouter from "./subscription";

const router: IRouter = Router();

router.use(healthRouter);
router.use(manuscriptsRouter);
router.use(jobsRouter);
router.use(dashboardRouter);
router.use(paymentsRouter);
router.use(subscriptionRouter);

export default router;

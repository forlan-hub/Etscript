import { Router, type IRouter } from "express";
import healthRouter from "./health";
import manuscriptsRouter from "./manuscripts";
import jobsRouter from "./jobs";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(manuscriptsRouter);
router.use(jobsRouter);
router.use(dashboardRouter);

export default router;

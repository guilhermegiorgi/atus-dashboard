import { Router, type IRouter } from "express";
import healthRouter from "./health";
import atusProxyRouter from "./atus-proxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(atusProxyRouter);

export default router;

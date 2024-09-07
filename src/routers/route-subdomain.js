import express from "express";
import controller from "../controllers/controller-subdomain.js";

const router = express.Router();

router.get("/", controller.index);

export default router;

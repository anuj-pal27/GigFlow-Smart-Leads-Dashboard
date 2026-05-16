import { Router } from "express";
import {
  createLead,
  deleteLead,
  exportLeadsCsv,
  getLeadById,
  getLeads,
  updateLead
} from "../controllers/leadController";
import { authorize } from "../middleware/authorize";
import { protect } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createLeadSchema, updateLeadSchema } from "../validators/leadValidators";

const router = Router();

router.use(protect);

router.get("/", getLeads);
router.get("/export/csv", exportLeadsCsv);
router.get("/:id", getLeadById);
router.post("/", authorize("admin", "sales"), validateBody(createLeadSchema), createLead);
router.patch("/:id", authorize("admin", "sales"), validateBody(updateLeadSchema), updateLead);
router.delete("/:id", authorize("admin"), deleteLead);

export default router;

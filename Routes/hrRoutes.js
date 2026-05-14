const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const hrController = require("../controllers/hrController");

router.get("/dashboard", auth, hrController.getDashboard);
router.post("/match", auth, hrController.findMatchingCandidates);
router.post("/match-candidates", auth, hrController.findMatchingCandidates);
router.get("/candidates/:id", auth, hrController.getCandidateById);
router.post("/shortlist", auth, hrController.shortlistCandidate);
router.get("/applications", auth, hrController.getApplications);
router.patch("/applications/:id", auth, hrController.updateApplication);
router.get("/interviews", auth, hrController.listInterviews);
router.post("/interviews", auth, hrController.createInterview);
router.get("/messages", auth, hrController.listMessages);
router.post("/messages", auth, hrController.sendMessage);
router.get("/offers", auth, hrController.listOffers);
router.post("/offers", auth, hrController.createOffer);
router.get("/analytics", auth, hrController.getAnalytics);
router.get("/company-profile", auth, hrController.getCompanyProfile);
router.put("/company-profile", auth, hrController.updateCompanyProfile);
router.get("/reports/export", auth, hrController.exportReport);

module.exports = router;

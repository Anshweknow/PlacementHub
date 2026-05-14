const express = require("express");
const auth = require("../middleware/authMiddleware");
const hrController = require("../controllers/hrController");

const createHrResourceRouter = (resource) => {
  const router = express.Router();

  if (resource === "applications") {
    router.get("/", auth, hrController.getApplications);
    router.patch("/:id", auth, hrController.updateApplication);
  }

  if (resource === "interviews") {
    router.get("/", auth, hrController.listInterviews);
    router.post("/", auth, hrController.createInterview);
  }

  if (resource === "messages") {
    router.get("/", auth, hrController.listMessages);
    router.post("/", auth, hrController.sendMessage);
  }

  if (resource === "offers") {
    router.get("/", auth, hrController.listOffers);
    router.post("/", auth, hrController.createOffer);
  }

  if (resource === "analytics") {
    router.get("/", auth, hrController.getAnalytics);
  }

  if (resource === "company-profile") {
    router.get("/", auth, hrController.getCompanyProfile);
    router.put("/", auth, hrController.updateCompanyProfile);
  }

  return router;
};

module.exports = createHrResourceRouter;

const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");
const { authenticateToken, adminAuth, userAuth } = require("../middleware/auth")

// Apply authenticateToken middleware to all leads-related routes
router.use(authenticateToken);

// POST /leads - Create a new lead
router.post('/',adminAuth, leadController.createLead);

// GET /leads - Get all leads
router.get('/', leadController.getAllLeads);

// DELETE /leads/:id - Delete a lead by ID
router.delete('/lead/:id',adminAuth, leadController.deleteLeadById);

// DELETE /leads/multiple - Delete multiple leads by IDs
router.delete('/multiple', leadController.deleteMultipleLeads);

router.put('/lead/:id',adminAuth, leadController.updateLead);
// router.delete("/:id", adminAuth, leadController.deleteLeadById);

// Route to fetch leads by tag
router.get('/tag', leadController.getLeadsByTag);

// Route to search leads by tag
router.get('/search', leadController.getSearchByTag);

// GET /leads/platform - Get leads by platform
router.get("/platform", leadController.getLeadsByPlatform);

// Define route for getting leads by platform and tag
// router.get("/platformtag", leadController.getLeadsByPlatformAndTag); // Get leads by platform and tag
router.get('/leads/search', leadController.getLeadsByPlatformAndTag);


router.get('/technology', leadController.getTechnology);


module.exports = router
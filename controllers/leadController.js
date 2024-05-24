const LeadData = require("../model/LeadData");
const RemoteLeadData = require("../model/RemoteLeadData");
const mongoose = require('mongoose');


// Create a new lead
exports.createLead = async (req, res) => {
    try {
        const leadData = new LeadData(req.body);
        const savedData = await leadData.save();
        res.status(200).json({savedData, message: 'Data submitted successfully!'});
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// Get all leads
exports.getAllLeads = async (req, res) => {
    try {
        // const leads = await LeadData.find();
        const leads = await LeadData.find().sort({ createdAt: -1});
        res.status(200).json(leads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Delete a lead by ID
exports.deleteLeadById = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedLead = await LeadData.findByIdAndDelete(id);
        if (!deletedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateLead = async (req, res) => {
    try {
        const leadId = req.params.id; // Assuming the lead ID is passed in the request parameters
        const updatedData = req.body; // Updated lead data
        
        // Find the lead by ID and update its data
        const leadData = await LeadData.findByIdAndUpdate(leadId, updatedData, { new: true });

        // Check if the lead exists
        if (!leadData) {
            return res.status(404).json({ message: "Lead not found" });
        }

        // Respond with the updated lead data
        res.status(200).json({leadData, message: 'Lead updated successfully'});
    } catch (err) {
        // Handle errors
        res.status(400).json({ message: err.message });
    }
};

// Fetch leads by tag
exports.getLeadsByTag = async (req, res) => {
    let selectedTags;
    // Check if tags are provided in the request body
    if (req.query.tags && typeof req.query.tags === 'string') {
        // Split the string by comma and trim extra whitespace
        selectedTags = req.query.tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(req.query.tags)) {
        selectedTags = req.query.tags;
    } else {
        return res.status(400).json({ message: "Tags parameter must contain at least one tag" });
    }

    try {
        if (selectedTags.length === 0) {
            return res.status(400).json({ message: "Tags parameter must contain at least one tag" });
        }

        // Construct a regex pattern to match any of the selected tags
        const regexPattern = selectedTags.map(tag => `\\b${tag}\\b`).join('|');
        const regex = new RegExp(regexPattern, 'i');

        // Find leads that contain any of the selected tags
        const leads = await LeadData.find({ tags: { $regex: regex } }).sort({ createdAt: -1 });

        if (leads.length === 0) {
            return res.status(404).json({ message: `No leads found for the tag "${selectedTags.join(', ')}"` });
        }

        res.status(200).json(leads);
    } catch (err) {
        console.error("Error fetching leads by tag:", err);
        res.status(500).json({ message: "An error occurred while fetching leads" });
    }
};



//Fetch leads by Platforms

exports.getLeadsByPlatform = async (req, res) => {
    let selectedPlatforms;
    console.log(platform);
    // Check if platforms are provided in the request body
    if (req.body.platforms && typeof req.body.platforms === 'string') {
        // Split the string by comma and trim extra whitespace
        selectedPlatforms = req.body.platforms.split(',').map(platform => platform.trim());
    } else if (Array.isArray(req.body.platforms)) {
        selectedPlatforms = req.body.platforms;
    } else {
        return res.status(400).json({ message: "Platforms parameter is required as a non-empty array or comma-separated string" });
    }

    try {
        if (selectedPlatforms.length === 0) {
            return res.status(400).json({ message: "Platforms parameter is required as a non-empty array" });
        }

        // Find leads that contain the specified platforms
        const leads = await LeadData.find({ platform: { $in: selectedPlatforms } }).sort({ createdAt: -1});

        if (leads.length === 0) {
            return res.status(404).json({ message: "No leads found for the specified platform(s)" });
        }

        res.status(200).json({ leads });
    } catch (err) {
        console.error("Error retrieving leads by platform:", err);
        res.status(500).json({ message: "An error occurred while retrieving leads" });
    }
};



//Fetch leads by Platforms and Tags

exports.getLeadsByPlatformAndTag = async (req, res) => {
    let selectedPlatforms = [];
    let selectedTags = [];

    // Parse platforms from the request
    if (req.body.platforms) {
        selectedPlatforms = typeof req.body.platforms === 'string' ? 
                            req.body.platforms.split(',').map(platform => platform.trim()) : 
                            req.body.platforms;
    }

    // Parse tags from the request
    if (req.body.tags) {
        selectedTags = typeof req.body.tags === 'string' ? 
                       req.body.tags.split(',').map(tag => tag.trim()) : 
                       req.body.tags;
    }

    // Check if at least one of the filters is provided
    if (selectedPlatforms.length === 0 && selectedTags.length === 0) {
        return res.status(400).json({ message: "At least one of the platforms or tags parameters is required." });
    }

    try {
        // Construct a query object based on provided filters
        let query = {};
        if (selectedPlatforms.length > 0) {
            // Using case-insensitive search for platforms
            query.platforms = { $in: selectedPlatforms.map(platform => new RegExp(platform, 'i')) };
        }
        if (selectedTags.length > 0) {
            // Using case-insensitive search for tags, removing word boundaries for broader matching
            const regexPattern = selectedTags.map(tag => `${tag}`).join('|');
            query.tags = { $regex: new RegExp(regexPattern, 'i') };
        }

        // Find leads based on the constructed query
        const leads = await LeadData.find(query);

        if (leads.length === 0) {
            return res.status(404).json({ message: "No leads found matching the criteria." });
        }

        res.status(200).json(leads);
    } catch (err) {
        console.error("Error fetching leads by platform and tag:", err);
        res.status(500).json({ message: "An error occurred while fetching leads" });
    }
};



// search reference in only tags 

exports.getSearchByTag = async (req, res) => {
    let selectedtags;
    // Check if tags are provided in the request body
    if (req.body.tags && typeof req.body.tags === 'string') {
        // Split the string by comma and trim extra whitespace
        selectedtags = req.body.tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(req.body.tags)) {
        selectedtags = req.body.tags;
    } else {
        return res.status(400).json({ message: "Tags parameter is required as a non-empty array or comma-separated string" });
    }

    try {
        if (selectedtags.length === 0) {
            return res.status(400).json({ message: "Tags parameter is required as a non-empty array" });
        }

        // Construct a regex pattern to match any part of the tag names
        const regexPattern = selectedtags.map(tag => `${tag}`).join('|');
        const regex = new RegExp(regexPattern, 'i');

        // Find leads that contain any tag matching the regex pattern
        const leads = await LeadData.find({ tags: { $regex: regex } }).sort({ createdAt: -1});
        console.log(leads)
        if (leads.length === 0) {
            return res.status(404).json({ message: `No leads found for the provided tag(s)` });
        }

        // // Extract unique tags from the found leads
        // const tagsInLeads = leads.reduce((acc, lead) => {
        //     if (Array.isArray(lead.tags)) {
        //         lead.tags.forEach(tag => {
        //             if (!acc.includes(tag)) {
        //                 acc.push(tag);
        //             }
        //         });
        //     }
        //     return acc;
        // }, );
        const tagsArray =  leads.map(lead => lead.tags)
        const tagsSplit = tagsArray.map(tags => tags.split('\n'));

        console.log(tagsSplit);
        res.status(200).json({ tags:tagsSplit  });

    } catch (err) {
        console.error("Error fetching tags by query:", err);
        res.status(500).json({ message: "An error occurred while fetching tags" });
    }
};



exports.getTechnology = async (req, res) => {
    try {
        // Extract the technology parameter from the query or body
        const technology = (req.query.Technology || req.body.technology || "").toLowerCase();

        console.log("Extracted technology:", technology); // Debugging log

        // Check if the technology parameter is empty after fallback
        if (!technology) {
            return res.status(400).json({ message: "Technology parameter is required" });
        }

        // Define an array of valid technologies
        const validTechnologies = ["blockchain", "web", "app"];

        // Check if the provided technology is valid (case-insensitive)
        if (!validTechnologies.includes(technology)) {
            return res.status(400).json({ message: "Invalid technology provided" });
        }

        // Find leads matching any of the specified technologies (case-insensitive)
        const leads = await LeadData.find({ Technology: new RegExp(technology, 'i') }).sort({ createdAt: -1 });

        if (leads.length === 0) {
            return res.status(404).json({ message: `No leads found for the provided technology` });
        }

        res.status(200).json(leads);
    } catch (err) {
        console.error("Error fetching leads by technology:", err);
        res.status(500).json({ message: "An error occurred while fetching leads" });
    }
};

// Delete multiple leads by IDs
exports.deleteMultipleLeads = async (req, res) => {
    const { ids } = req.body;

    try {
        // Check if IDs array is provided
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "IDs array is required and must not be empty" });
        }

        // Validate each ID
        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

        // Check if there are invalid IDs
        if (validIds.length !== ids.length) {
            return res.status(400).json({ message: "Selected at least one lead" });
        }

        // Delete leads with the provided IDs
        const deletionResult = await LeadData.deleteMany({ _id: { $in: validIds } });

        // Check if any leads were deleted
        if (deletionResult.deletedCount === 0) {
            return res.status(404).json({ message: "No leads found with the provided IDs" });
        }

        res.status(200).json({ message: `Deleted ${deletionResult.deletedCount} leads successfully` });
    } catch (err) {
        console.error("Error deleting multiple leads:", err);
        res.status(500).json({ message: "An error occurred while deleting leads" });
    }
};

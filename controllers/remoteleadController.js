const RemoteLeadData = require("../model/RemoteLeadData");

// Create a new remote lead
exports.createRemoteLead = async (req, res) => {
    try {
        const remoteleadData = new RemoteLeadData(req.body);
        const savedData = await remoteleadData.save(); // Corrected variable name
        res.status(201).json(savedData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Get all remote leads
exports.getAllRemoteLeads = async (req, res) => {
    try {
        const remoteleads = await RemoteLeadData.find().sort({ createdAt: -1 });
        res.status(200).json(remoteleads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a remote lead by ID
exports.deleteRemoteLeadById = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedRemoteLead = await RemoteLeadData.findByIdAndDelete(id);
        if (!deletedRemoteLead) {
            return res.status(404).json({ message: 'Remote lead not found' });
        }
        res.status(200).json({ message: 'Remote lead deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateRemoteLead = async (req, res) => {
    try {
        const leadId = req.params.id; // Assuming the lead ID is passed in the request parameters
        const updatedData = req.body; // Updated lead data
        
        // Find the remote lead by ID and update its data
        const remoteLead = await RemoteLeadData.findByIdAndUpdate(leadId, updatedData, { new: true });

        // Check if the remote lead exists
        if (!remoteLead) {
            return res.status(404).json({ message: "Remote lead not found" });
        }

        // Respond with the updated remote lead data
        res.status(200).json({remoteLead, message: 'Lead updated successfully'});
    } catch (err) {
        // Handle errors
        res.status(400).json({ message: err.message });
    }
};

// Fetch remote leads by tag
exports.getRemoteLeadsByTag = async (req, res) => {
    let selectedtags;
    if (req.query.tags && typeof req.query.tags === 'string') {
        selectedtags = req.query.tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(req.query.tags)) {
        selectedtags = req.query.tags;
    } else {
        return res.status(400).json({ message: "Tags parameter must contain at least one tag" });
    }

    try {
        if (selectedtags.length === 0) {
            return res.status(400).json({ message: "Tags parameter must contain at least one tag" });
        }

        const regexPattern = selectedtags.map(tag => `\\b${tag}\\b`).join('|');
        const regex = new RegExp(regexPattern, 'i');

        const remoteleads = await RemoteLeadData.find({ Tags: { $regex: regex } }).sort({ createdAt: -1 });

        if (remoteleads.length === 0) {
            return res.status(404).json({ message: `No remoteleads found for the tag "${selectedtags.join(', ')}"` });
        }

        res.status(200).json(remoteleads); // Corrected return variable
    } catch (err) {
        console.error("Error fetching remote leads by tag:", err);
        res.status(500).json({ message: "An error occurred while fetching remote leads" });
    }
};

// Fetch remote leads by platform
exports.getRemoteLeadsByPlatform = async (req, res) => {
    let selectedPlatforms = [];

    if (req.body.Platforms && typeof req.body.Platforms === 'string') {
        selectedPlatforms = req.body.Platforms.split(',').map(platform => platform.trim());
    } else if (Array.isArray(req.body.Platforms)) {
        selectedPlatforms = req.body.Platforms;
    } else {
        return res.status(400).json({ message: "Platforms parameter is required as a non-empty array or comma-separated string" });
    }

    if (selectedPlatforms.length === 0) {
        return res.status(400).json({ message: "Platforms parameter is required as a non-empty array" });
    }

    try {
        const query = { Platforms: { $in: selectedPlatforms.map(platform => new RegExp(platform, 'i')) } };
        const remoteLeads = await RemoteLeadData.find(query).sort({ createdAt: -1 });

        if (remoteLeads.length === 0) {
            return res.status(404).json({ message: "No remote leads found for the specified platform(s)" });
        }

        res.status(200).json(remoteLeads);
    } catch (err) {
        console.error("Error retrieving remote leads by platform:", err);
        res.status(500).json({ message: "An error occurred while retrieving remote leads" });
    }
};


// Fetch remote leads by platform and tag
exports.getRemoteLeadsByPlatformAndTag = async (req, res) => {
    let selectedPlatforms = [];
    let selectedTags = [];

    if (req.body.Platforms) {
        selectedPlatforms = typeof req.body.Platforms === 'string' ?
                            req.body.Platforms.split(',').map(platform => platform.trim()) :
                            req.body.Platforms;
    }

    if (req.body.Tags) {
        selectedTags = typeof req.body.Tags === 'string' ? 
                       req.body.Tags.split(',').map(tag => tag.trim()) :
                       req.body.Tags;
    }

    if (selectedPlatforms.length === 0 && selectedTags.length === 0) {
        return res.status(400).json({ message: "At least one of the platforms or tags parameters is required." });
    }

    try {
        let query = {};
        if (selectedPlatforms.length > 0) {
            query.Platforms = { $in: selectedPlatforms.map(platform => new RegExp(platform, 'i')) };
        }
        if (selectedTags.length > 0) {
            query.Tags = { $in: selectedTags.map(tag => new RegExp(tag, 'i')) };
        }

        const remoteLeads = await RemoteLeadData.find(query).sort({ createdAt: -1 });

        if (remoteLeads.length === 0) {
            return res.status(404).json({ message: "No remote leads found matching the criteria." });
        }

        res.status(200).json(remoteLeads);
    } catch (err) {
        console.error("Error fetching remote leads by platform and tag:", err);
        res.status(500).json({ message: "An error occurred while fetching remote leads." });
    }
};


// Search remote leads by tag
exports.getRemoteLeadSearchByTag = async (req, res) => {
    let selectedtags;
    if (req.body.Tags && typeof req.body.Tags === 'string') {
        selectedtags = req.body.Tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(req.body.Tags)) {
        selectedtags = req.body.Tags;
    } else {
        return res.status(400).json({ message: "Tags parameter is required as a non-empty array or comma-separated string" });
    }

    try {
        if (selectedtags.length === 0) {
            return res.status(400).json({ message: "Tags parameter is required as a non-empty array" });
        }

        const regexPattern = selectedtags.map(tag => tag).join('|');
        const regex = new RegExp(regexPattern, 'i');

        const remoteleads = await RemoteLeadData.find({ Tags: { $regex: regex } }).sort({ createdAt: -1 });

        if (remoteleads.length === 0) {
            return res.status(404).json({ message: `No remoteleads found for the provided tag(s)` });
        }

        const tagsArray = remoteleads.map(remoteLead => remoteLead.Tags);
        const tagsSplit = tagsArray.map(tags => tags.split('\n'));

        res.status(200).json({ Tags: tagsSplit });
    } catch (err) {
        console.error("Error fetching remoteleads by tag:", err);
        res.status(500).json({ message: "An error occurred while fetching remoteleads." });
    }
};
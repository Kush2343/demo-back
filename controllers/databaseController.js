const LeadData = require("../model/LeadData");
const csv = require("csvtojson");

const importUser = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ status: 400, success: false, message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const response = await csv().fromFile(filePath);

        const userData = response.map(item => ({
            title: item.title,
            description: item.description,
            tags: item.tags,
            level: item.level,
            platforms: item.platforms,
            Technology: item.Technology,
            duration: item.duration,
            project_budget: item.project_budget,
            link: item.link,
            Hourly_Rate_budget: item.Hourly_Rate_budget,
        }));

        await LeadData.insertMany(userData);

        res.json({ status: 200, success: true, message: "Data imported successfully" });
    } catch (error) {
        res.json({ status: 400, success: false, message: error.message });
    }
};

const deleteAllLeadData = async (req, res) => {
    try {
        await LeadData.deleteMany({});
        res.send({ status: 200, success: true, message: "All lead data deleted successfully" });
    } catch (error) {
        res.send({ status: 400, success: false, message: error.message });
    }
};

module.exports = {
    importUser,
    deleteAllLeadData // Export the new method
};

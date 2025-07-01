const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');

router.post('/recommend', async (req, res) => {
    try {
        const { user_profile, preferences } = req.body;
        
        let options = {
            scriptPath: path.join(__dirname, '../ml'),
            args: [JSON.stringify({ user_profile, preferences })]
        };
        
        PythonShell.run('predict_fashion.py', options, function (err, results) {
            if (err) throw err;
            const recommendations = JSON.parse(results[0]);
            res.json(recommendations);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');
const mongoose = require('mongoose');

// Add a test endpoint to check MongoDB connection
router.get('/test-db', async (req, res) => {
    try {
        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        const outfitsCollection = collections.find(c => c.name === 'outfits');
        
        if (!outfitsCollection) {
            return res.json({ 
                status: 'warning',
                message: 'Outfits collection not found',
                collections: collections.map(c => c.name)
            });
        }
        
        // Get sample data from outfits collection
        const outfitsCount = await mongoose.connection.db.collection('outfits').countDocuments();
        const sampleOutfit = await mongoose.connection.db.collection('outfits').findOne();
        
        res.json({ 
            status: 'success',
            message: 'Database connected',
            outfitsCount,
            collections: collections.map(c => c.name),
            sampleOutfit: sampleOutfit ? 'Found' : 'Not Found',
            sampleOutfitData: sampleOutfit
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
});

// Add a test endpoint for Python script
router.get('/test-python', async (req, res) => {
    try {
        const testData = {
            user_profile: {
                gender: 'female'
            },
            preferences: {
                weather: {
                    temp: 20,
                    description: 'Clear'
                },
                activity: 'casual',
                formality: 'casual'
            }
        };

        let options = {
            scriptPath: path.join(__dirname, '../ml'),
            args: [JSON.stringify(testData)],
            pythonPath: 'python'
        };

        PythonShell.run('predict_fashion.py', options, function (err, results) {
            if (err) {
                console.error('Python script error:', err);
                return res.status(500).json({ 
                    error: 'Python script error',
                    details: err.message,
                    stack: err.stack
                });
            }
            res.json({ 
                status: 'success',
                results: results
            });
        });
    } catch (error) {
        console.error('Python test error:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
});

// Modify the existing recommend endpoint to add more logging
router.post('/recommend', async (req, res) => {
    try {
        console.log('Received recommendation request:', req.body);
        
        const { user_profile, preferences } = req.body;
        
        if (!user_profile || !preferences) {
            return res.status(400).json({ error: 'Missing user_profile or preferences' });
        }

        const options = {
            scriptPath: path.join(__dirname, '../ml'),
            args: [JSON.stringify({ user_profile, preferences })],
            pythonPath: 'python',
            stderrParser: (line) => console.error('Python stderr:', line)
        };
        
        console.log('Executing Python script with options:', options);

        PythonShell.run('predict_fashion.py', options)
            .then(results => {
                console.log('Python script results:', results);
                
                if (!results || results.length === 0) {
                    return res.status(500).json({ error: 'No output from recommendation engine' });
                }

                try {
                    const recommendations = JSON.parse(results[results.length - 1]);
                    if (Array.isArray(recommendations)) {
                        console.log(`Sending ${recommendations.length} recommendations`);
                        res.json(recommendations);
                    } else {
                        throw new Error('Invalid recommendations format');
                    }
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    res.status(500).json({ error: 'Failed to parse recommendations' });
                }
            })
            .catch(err => {
                console.error('Python script error:', err);
                res.status(500).json({ error: 'Failed to run recommendation engine' });
            });
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

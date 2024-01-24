var express = require('express');
var router = express.Router();
var fs = require('fs').promises; // Using the promises version of fs

var fetch = require('../fetch');

var { GRAPH_ME_ENDPOINT,GRAPH_USER_CALENDAR_ENDPOINT,GRAPH_CALENDAR_ENDPOINT} = require('../authConfig');

// Custom middleware to check auth state
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // Redirect to the sign-in route
    }
    next();
}

router.get('/id',
    isAuthenticated,
    async function (req, res, next) {
        res.render('id', { idTokenClaims: req.session.account.idTokenClaims });
    }
);

router.get('/profile',
    isAuthenticated,
    async function (req, res, next) {
        try {
            let data;

            // Check if data is already stored in a file
            try {
                const storedData = await fs.readFile('graphData.json', 'utf-8');
                data = JSON.parse(storedData);
            } catch (err) {
                // Fetch data from the Graph API if not available in the file
                data = await fetchGraphData(GRAPH_ME_ENDPOINT, req.session.accessToken);

                // Store the fetched data in a file
                await fs.writeFile('graphData.json', JSON.stringify(data));
            }

            // Update the graphData.json file every 10 seconds
            setInterval(async () => {
                try {
                    const updatedData = await fetchGraphData(GRAPH_ME_ENDPOINT, req.session.accessToken);
                    await fs.writeFile('graphData.json', JSON.stringify(updatedData));
                } catch (error) {
                    console.error('Error updating graphData.json:', error);
                }
            }, 10000);

            res.json({ data });
        } catch (error) {
            next(error);
        }
    }
);
router.get('/calendar',
    isAuthenticated,
    async function (req, res, next) {
        try {
            let calendarData;

            // Check if data is already stored in a file
            try {
                const storedCalendarData = await fs.readFile('calendarData.json', 'utf-8');
                calendarData = JSON.parse(storedCalendarData);

                console.log("Calendar Data:",calendarData);
            } catch (err) {
                // Fetch calendar data from the Graph API if not available in the file
                calendarData = await fetchGraphData(GRAPH_USER_CALENDAR_ENDPOINT, req.session.accessToken);

                // Store the fetched calendar data in a file
                await fs.writeFile('calendarData.json', JSON.stringify(calendarData));
            }

            // Update the calendarData.json file every 10 seconds
            setInterval(async () => {
                try {
                    const updatedCalendarData = await fetchGraphData(GRAPH_USER_CALENDAR_ENDPOINT, req.session.accessToken);
                    await fs.writeFile('calendarData.json', JSON.stringify(updatedCalendarData));
                } catch (error) {
                    console.error('Error updating calendarData.json:', error);
                }
            }, 10000);

            res.json({ calendarData });
        } catch (error) {
            next(error);
        }
    }
);
router.get('/calendars',
    isAuthenticated,
    async function (req, res, next) {
        try {
            let calendarList;

            // Fetch calendar data from the Graph API
            try {
                calendarList = await fetchGraphData(GRAPH_CALENDAR_ENDPOINT, req.session.accessToken);
             
            } catch (err) {
                console.error("Error fetching calendar list:", err);
                return res.status(500).json({ error: 'Error fetching calendar list' });
            }

            res.render('profile',{ calendarList });
        } catch (error) {
            next(error);
        }
    }
);
async function fetchGraphData(endpoint, accessToken) {
    try {
        const response = await fetch(endpoint, accessToken);
        // const data = await response.json();
        return response;
    } catch (error) {
        throw error;
    }
}

module.exports = router;

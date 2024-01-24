var express = require('express');
var router = express.Router();
var fs = require('fs').promises; // Using the promises version of fs

var fetch = require('../fetch');

var { GRAPH_ME_ENDPOINT, GRAPH_API_ENDPOINT, GRAPH_CALENDAR_ENDPOINT} = require('../authConfig');

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

// Assuming the fetchGraphData function is available, similar to the one you provided earlier

// Assuming the fetchGraphData function is available, similar to the one you provided earlier

router.get('/calendars',
    isAuthenticated,
    async function (req, res, next) {
        try {
            let calendarList;

            // Fetch calendar data from the Graph API
            try {
                calendarList = await fetchGraphData(GRAPH_CALENDAR_ENDPOINT, req.session.accessToken);
                console.log("Calendar List ::", calendarList);
            } catch (err) {
                console.error("Error fetching calendar list:", err);
                return res.status(500).json({ error: 'Error fetching calendar list' });
            }

            // Extract calendar IDs and names from the calendarList
            // let calendarData = calendarList.value.map(calendar => ({
            //     id: calendar.id,
            //     name: calendar.name
            // }));
            let calendarData = calendarList.value;
            console.log(calendarData);
            // Separate arrays for IDs and names
            let calendarIds = calendarData.map(calendar => calendar.id);
            let calendarNames = calendarData.map(calendar => calendar.name);

            // Render the 'profile' view with calendarIds and calendarNames
            res.render('profile', { calendarData });

        } catch (error) {
            next(error);
        }
    }
);

// router.get('/calendar',
//     isAuthenticated,
//     async function (req, res, next) {
//         try {
//             let calendarData;
//             const userCalendarId = "AAMkADM3ZjhjOWM1LWFlZGYtNDM1My04OGJiLTM2ZGU5MzdiMTQ4MQBGAAAAAAAmkyi5JO6wTZRT_jQSzYz_BwAb6QCpVNuOR72EFrACM6uuAAAAAAEGAAAb6QCpVNuOR72EFrACM6uuAAAAAGsRAAA=";
//             // console.log(`Here is my userCalendar Id ${userCalendarId}`);
//             // Fetch calendar data from the Graph API
//             try {
//                 calendarData = await fetchGraphData(`https://graph.microsoft.com/v1.0/me/calendars/${userCalendarId}/events`, req.session.accessToken);
//                 console.log(`Here is my calendar data ${calendarData}`);
//             } catch (err) {
//                 console.error("Error fetching calendar list:", err);
//                 return res.status(500).json({ error: 'Error fetching calendar list' });
//             }

//             res.json({calendarData})
//             // Extract calendar IDs from the calendarList
//             // const calendarIds = calendarList.value.map(calendar => calendar.id);

            

//             // res.json({calendarIds});
//             // Redirect to the '/calendar' route with calendarIds as query parameters
//             // res.redirect(`/users/calendar?ids=${calendarIds[0]}`);
//             // res.redirect(`/users/calendar?ids=${calendarIds[0]}`);

//         } catch (error) {
//             next(error);
//         }
//     }
// );
router.get('/calendar',
    isAuthenticated,
    async function (req, res, next) {
        try {
            // Retrieve calendar IDs from query parameters
            const calendarIds = req.query.ids ? req.query.ids.split(',') : [];
            console.log("calendarIds data###################",calendarIds);

            // Fetch calendar data for each calendar ID
            const calendarDataPromises = calendarIds.map(async (calendarId) => {
                try {
                    // const userCalendarId = "AAMkADM3ZjhjOWM1LWFlZGYtNDM1My04OGJiLTM2ZGU5MzdiMTQ4MQBGAAAAAAAmkyi5JO6wTZRT_jQSzYz_BwAb6QCpVNuOR72EFrACM6uuAAAAAAEGAAAb6QCpVNuOR72EFrACM6uuAAAAAGsRAAA=";
                    const calendarData = await fetchGraphData(`https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`, req.session.accessToken);

                    console.log("Calendar Data%%%%%%%%%%%%%",calendarData);
                    await fs.writeFile(`calendarData_${calendarId}.json`, JSON.stringify(calendarData));
                    return calendarData;  // Return the fetched calendar data
                } catch (error) {
                    console.error(`Error updating calendarData_${calendarId}.json:`, error);
                    return null;
                }
            });

            // Wait for all promises to resolve
            const calendarDataArray = await Promise.all(calendarDataPromises);
            // const calData = calendarDataArray[0];
            res.json({calendarDataArray})
            console.log("*******************",calendarDataArray[0]);
            // res.render('calendar', { calendarDataArray });
            // Filter out any null values (in case of errors during fetching)
            const validCalendarData = calendarDataArray.filter(data => data !== null);
            res.json({validCalendarData})
            console.log("*******************",validCalendarData);
            // console.log(validCalendarData);
            // res.render('profile', { calendarData: validCalendarData });
            // const calData = validCalendarData[0];
            // res.render('profile', { calData: calData });
            // res.json({calData})
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

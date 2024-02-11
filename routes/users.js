var express = require("express");
var router = express.Router();
var fs = require("fs").promises; // Using the promises version of fs
const authProvider = require('../auth/AuthProvider');
// const { REDIRECT_URI, POST_LOGOUT_REDIRECT_URI } = require('../authConfig');
var fetch = require("../fetch");


var {
  GRAPH_ME_ENDPOINT,
  POST_LOGOUT_REDIRECT_URI,
  GRAPH_CALENDAR_ENDPOINT,
  LOCAL_IP
} = require("../authConfig");

// Custom middleware to check auth state
function isAuthenticated(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect("/auth/signin"); // Redirect to the sign-in route
  }
  next();
}

router.get("/id", isAuthenticated, async function (req, res, next) {
  res.render("id", { idTokenClaims: req.session.account.idTokenClaims });
});

router.get("/profile", isAuthenticated, async function (req, res, next) {
  try {
    let data;

    // Check if data is already stored in a file
    try {
      const storedData = await fs.readFile("calendarFiles/graphData.json", "utf-8");
      data = JSON.parse(storedData);
    } catch (err) {
      // Fetch data from the Graph API if not available in the file
      data = await fetchGraphData(GRAPH_ME_ENDPOINT, req.session.accessToken);

      // Store the fetched data in a file
      await fs.writeFile("calendarFiles/graphData.json", JSON.stringify(data));
    }

    // Update the graphData.json file every 10 seconds
    // setInterval(async () => {
    //   try {
    //     const updatedData = await fetchGraphData(
    //       GRAPH_ME_ENDPOINT,
    //       req.session.accessToken
    //     );
    //     await fs.writeFile("calendarFiles/graphData.json", JSON.stringify(updatedData));
    //   } catch (error) {
    //     console.error("Error updating graphData.json:", error);
    //   }
    // }, 10000);

    res.json({ data });
  } catch (error) {
    next(error);
  }
});
router.get("/calendars", isAuthenticated, async function (req, res, next) {
  try {
    let calendarList;
    
    // Fetch calendar data from the Graph API
    try {
      calendarList = await fetchGraphData(
        GRAPH_CALENDAR_ENDPOINT,
        req.session.accessToken
      );
      // console.log("Calendar List ::", calendarList);
    } catch (err) {
      console.error("Error fetching calendar list:", err);
      if(res.status(500)){
        res.redirect('/users/calendars');
      }
      return res.status(500).json({ error: "Error fetching calendar list" });
    }

    // Extract calendar IDs and names from the calendarList

    let calendarData = calendarList.value;
    // console.log(calendarData);
    // Separate arrays for IDs and names
    let calendarIds = calendarData.map((calendar) => calendar.id);
    let calendarNames = calendarData.map((calendar) => calendar.name);

    // Render the 'profile' view with calendarIds and calendarNames
    res.render("profile", { calendarData, LOCAL_IP });
  } catch (error) {
    next(error);
  }
});
async function fetchCalendarData(calendarId, accessToken) {
  try {
      const calendarData = await fs.readFile(`calendarFiles/calendarData_${calendarId}.json`, "utf-8");
      return JSON.parse(calendarData);
  } catch (error) {
      console.error(`Error reading calendarData_${calendarId}.json:`, error);
      const data = await fetchGraphData(
          `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`,
          accessToken
      );
      await fs.writeFile(`calendarFiles/calendarData_${calendarId}.json`, JSON.stringify(data));
      return data;
  }
}

async function updateCalendarData(cids, accessToken) {
  try {
        
      for (let calendarId of cids) {
          console.log("Hey this loop is continuously working", calendarId);
          const updatedData = await fetchGraphData(
              `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`,
              accessToken
          );
          await fs.writeFile(`calendarFiles/calendarData_${calendarId}.json`, JSON.stringify(updatedData));
      }
  } catch (error) {
      console.error("Error updating calendar data:", error);
  }
}
function isCalendarIdPresent(calendarId, calendarIds) {
  return calendarIds.includes(calendarId);
}
let globalCalId = new Set();

let globalIntervalId = -1;
// Assuming the fetchGraphData function is available, similar to the one you provided earlier
let intervalId ='';
router.get("/calendar", isAuthenticated, async function (req, res, next) {

  try {
    const calId = req.query.ids;
    console.log(calId);
    const calendarIds = req.query.ids ? req.query.ids.split(",") : [];
    if (!globalCalId.has(calId)) {
        globalCalId.add(calId);
    }
    console.log("Global Cal Id's",globalCalId);
    console.log("My calendar Id's",calendarIds[1]);
    console.log("My calendar Id's type", typeof calendarIds);
  // Check if calId is present in calendarIds array
  
          const calendarDataArray = await Promise.all(calendarIds.map(async (calendarId) => {
              return fetchCalendarData(calendarId, req.session.accessToken);
          }));
        if (globalCalId.size === 1) {
          globalIntervalId = setInterval(async () => {
            // console.log("Calendar Id's Are",calendarIds);
            
              await updateCalendarData(globalCalId, req.session.accessToken);
          }, 10000);
        }
          
          res.redirect('/users/calendars');
   
  } catch (error) {
      next(error);
  }
});

router.get("/stopInterval", isAuthenticated, async function (req, res, next) {
  // Assuming you have some condition to check if the interval should be stopped
  console.log("Inside Stop Interval");
  res.redirect('/users/calendars');
  globalCalId.delete(req.query.ids)
  if (globalCalId.length === 0 && globalIntervalId !== -1) {
     clearInterval(globalIntervalId)
  }
});
router.get('/signout', (req, res, next) => {
  // Clear all intervals
  console.log("All interval are clear");
  clearInterval(globalIntervalId);

  // Redirect to /users/signout after logout
  authProvider.logout({
    postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI
  })(req, res, next);
});
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
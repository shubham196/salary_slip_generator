var express = require("express");
var router = express.Router();
var fs = require("fs").promises; // Using the promises version of fs

var fetch = require("../fetch");

var {
  GRAPH_ME_ENDPOINT,
  GRAPH_API_ENDPOINT,
  GRAPH_CALENDAR_ENDPOINT,
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

// Assuming the fetchGraphData function is available, similar to the one you provided earlier

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
      return res.status(500).json({ error: "Error fetching calendar list" });
    }

    // Extract calendar IDs and names from the calendarList

    let calendarData = calendarList.value;
    // console.log(calendarData);
    // Separate arrays for IDs and names
    let calendarIds = calendarData.map((calendar) => calendar.id);
    let calendarNames = calendarData.map((calendar) => calendar.name);
  
    // Render the 'profile' view with calendarIds and calendarNames
    res.render("profile", { calendarData });
  } catch (error) {
    next(error);
  }
});

let intervalId='null'; // Declare the interval ID variable

router.get("/calendar", isAuthenticated, async function (req, res, next) {

  // req.query.ids = null;
    try {
     
      // console.log("%%%%%%%%%%ID%%%%%%%%%",req.query.ids);
      
      console.log("True",req.query.ids);
      // Retrieve calendar IDs from query parameters
      const calendarIds = req.query.ids ? req.query.ids.split(",") : [];
  
      // Fetch calendar data for each calendar ID
      const calendarDataPromises = calendarIds.map(async (calendarId) => {
        try {
          const calendarData = await fs.readFile(`calendarFiles/calendarData_${calendarId}.json`, "utf-8");
          return JSON.parse(calendarData);
        } catch (error) {
          console.error(`Error reading calendarData_${calendarId}.json:`, error);
  
          // Fetch calendar data using fetchGraphData function
          const data = await fetchGraphData(
            `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`,
            req.session.accessToken
          );
  
          // Write fetched data to file
          await fs.writeFile(`calendarFiles/calendarData_${calendarId}.json`, JSON.stringify(data));
  
          return data; // Return the fetched calendar data
        }
      });
  
      // Wait for all promises to resolve
      const calendarDataArray = await Promise.all(calendarDataPromises);
      // clearInterval(intervalId);
      console.log("Interval Id in Before IF",intervalId);
     
      // Set up an interval to update the calendar data every 10 seconds
      intervalId =  setInterval(async () => {
        try {
          for (const calendarId of calendarIds) {
            const updatedData = await fetchGraphData(
              `https://graph.microsoft.com/v1.0/me/calendars/${calendarId}/events`,
              req.session.accessToken
            );
            await fs.writeFile(`calendarFiles/calendarData_${calendarId}.json`, JSON.stringify(updatedData));
          }
        } catch (error) {
          console.error("Error updating calendar data:", error);
        }
      }, 10000, calendarIds); 
      
      // res.json({ data: calendarDataArray });
      res.redirect('/users/calendars')
      console.log("Interval Id After IF",intervalId);
   
   
    
        // res.json({ data: calendarDataArray });
  }
    

     catch (error) {
      next(error);
    }
  });
  
  router.post("/stopUpdateInterval", isAuthenticated, async function (req, res, next) {
    // Assuming you have some condition to check if the interval should be stopped
    if (req.query.ids !== 'null') {
        clearInterval(intervalId); // Stop the interval
        res.json({ message: "Update interval stopped" });
    } else {
        res.json({ message: "Update interval not stopped" });
    }
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
// import ToggleMessage from "./ToggleMessage";
// import { render } from "enzyme";
const CalendarComponent = (props) => {
  // const [gapiInited, setGapiInited] = useState(false);
  const [events, setEvents] = useState([]);
  const [organizerNamesString, setOrganizerNamesString] = useState('');
  const [organizerNames, setOrganizerNames] = useState('');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const calendarLink = params.get("calendarLink");
  // let Url = props.link;
  // const ipAddress = props.IpUrl;
  const icsFileUrl = calendarLink;

  console.log("icsFileUrl", calendarLink);
  const MINUTE_MS = 10000;
  const MINUTE_MS1 = 5000;


  useEffect(() => {
    // document.getElementById("content").innerText = "Loading...";
    
    const intervalId = setInterval(() => {
      listUpcomingEvents();
    }, MINUTE_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [icsFileUrl]);

  
  const listUpcomingEvents = async () => {
    try {
      console.log("###Calling API###");
      const response = await axios.get(icsFileUrl);
      const currentSystemTime = new Date();

      if (response && response.data) {
        const events = response.data.value;

        console.log("Events:",events);
        const organizerNames = events.map((event) => event.organizer.emailAddress.address);
        const organizerNamesString = organizerNames[0];
        console.log("Organizer Names:", organizerNamesString);
        // document.getElementById("content1").innerText = `Organizer Calendar Name: ${organizerNamesString}`;
        
        // Set events only if the necessary data is available
        const upcomingEvents = events.filter(
          (event) => new Date(event.end.dateTime) > currentSystemTime
        );
        upcomingEvents.sort((a, b) => {
          const dateA = new Date(a.end.dateTime);
          const dateB = new Date(b.end.dateTime);

          return dateA - dateB;
        });
        console.log("upcomingEvents", upcomingEvents.length);
        console.log("upcomingEvents:::::", upcomingEvents);
        // new Date(event.end) > currentSystemTime

        if (!events || events.length === 0 || upcomingEvents.length === 0) {
          document.getElementById("content").innerText = "Available";
          document.querySelector(".playback-view").style.backgroundColor ="green";
          document.querySelector(".overlay-image").style.borderColor = "green";
          return;
        }
       
        setEvents(response.data.value);

        const firstEvent = upcomingEvents[0];
        console.log("My First Event", firstEvent);
        // Get the current system time

        if (upcomingEvents.length > 0) {
          // Define constants for event duration thresholds
          const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds
          const threeDays = 3 * oneDay; // 3 days in milliseconds

          // Format and display event information with status
          let output = "";
          if (!firstEvent == 0) {
            // console.log("What is event:", event);
            const startTime = new Date(
              firstEvent.start.dateTime || firstEvent.start.date
            );
            const endTime = new Date(
              firstEvent.end.dateTime || firstEvent.end.date
            );
            const eventDuration = endTime - startTime;
            console.log("Start Time", startTime);
            if (currentSystemTime >= startTime && currentSystemTime < endTime) {
              if (eventDuration <= oneDay) {
                // output += `${event.summary} (Status: Busy, Start: ${startTime}, End: ${endTime})\n`;
                output += `Busy`;

                document.querySelector(".playback-view").style.backgroundColor =
                  "red";
                document.querySelector(".overlay-image").style.borderColor =
                  "red";
              } else if (eventDuration > oneDay && eventDuration <= threeDays) {
                // output += `${event.summary} (Status: Out of Office, Start: ${startTime}, End: ${endTime})\n`;
                output += `Out of Office`;
                document.querySelector(".playback-view").style.backgroundColor =
                  "orange";
                document.querySelector(".overlay-image").style.borderColor =
                  "orange";
              } else if (eventDuration > threeDays) {
                // output += `${event.summary} (Status: Vacation, Start: ${startTime}, End: ${endTime})\n`;
                output += `Vacation`;

                document.querySelector(".playback-view").style.backgroundColor =
                  "rgb(27, 113, 124)";

                document.querySelector(".overlay-image").style.borderColor =
                  "rgb(27, 113, 124)";
              }
            } else {
              // Check if the event is in the future
              if (currentSystemTime < startTime) {
                // output += `${event.summary} (Status: Available, Start: ${startTime}, End: ${endTime})\n`;
                console.log("Event is coming soon..");
                output += `Available`;
                document.querySelector(".playback-view").style.backgroundColor =
                  "green";
                document.querySelector(".overlay-image").style.borderColor =
                  "green";
              }
              document.getElementById("content").innerText = output;
            }
          }
          // Add a check for events without any specific status

          document.getElementById("content").innerText = output;
          // ... rest of the code remains unchanged
        }
      } else {
        // Handle the case where the response or its properties are undefined
          console.error("Invalid response structure:", response);
          document.getElementById("content").innerText = "Invalid response";

        // document.getElementById('content').innerText = output;
        // You may want to display an error message or handle this case differently
      }
    } catch (err) {
      // Handle other errors
      // if (err.response && err.response.status === 404) {
      //   // If 404 error, wait for a while and then retry
      //   console.log("Waiting for a valid response...");

      //   setTimeout(() => {
      //     listUpcomingEvents();
      //   }, 10000);
        
      // } else {
      //   document.getElementById("content1").innerText = "Calendar Id is invalid or other error occurred";
      //   console.error("Error fetching events:", err);
      // }
    }
  };

  return (
    <div>
      {/* Render your React components here */}
      {/* <button onClick={handleAuthClick}>Authorize</button>
      <button onClick={handleSignoutClick}>Signout</button> */}
      <div id="content1">
      {/* <ToggleMessage 
          organizerNamesString={organizerNamesString} 
      /> */}
       </div>
       <div id="content" style={{ fontSize: '40px' }}></div>
     
    </div>
  );


};
export default CalendarComponent;

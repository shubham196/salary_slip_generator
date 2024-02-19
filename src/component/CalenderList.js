import React from 'react';
import { Link } from 'react-router-dom';

export default function CalendarList() {
  return (
    <div className="container">
      <div className='calendar-container'>
        <h1>HI, I AM A CALENDAR LIST</h1>
        <Link
            to={"http://localhost:3000/auth/calendarList"}
            className="button button-sign-in bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-10 rounded inline-block mb-4"
          >
        Calendar List
      </Link>
      </div>
    </div>
  );
}

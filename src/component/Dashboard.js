import React, { useState } from 'react';
import { BrowserRouter, Routes,  Route } from 'react-router-dom';
import SalarySlip from './SalarySlip';

export default function Dashboard() {
  return (
<div className="container">
    <div className='dashboard-container'>
        <SalarySlip/>
      </div>
    </div>
  )
}

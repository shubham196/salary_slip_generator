import React from 'react';
import "../assets/salaryslip.css";
function SalarySlip() {


  return (
    <>
      <div className='heading'>
        <h1>Diginage Private Limited</h1>
        <h2>Salary Slip of June 2024</h2>
      </div>
      <div className='emp-details'>
        <table className='employee-details-table'>
          <tbody>
            <tr>
              <td>Name:</td>
              <td>Department:</td>
            </tr>
            <tr>
              <td>Designation:</td>
              <td>Bank Name:</td>
            </tr>
            <tr>
              <td>Location:</td>
              <td>Bank Account No.:</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className='calc-details'>
        <div className='earnings'>
          <table>
            <thead>
              <tr>
                <th colSpan="3">Earnings</th>
              </tr>
              <tr>
                <th>Sr. No.</th>
                <th>Salary Head</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Basic</td>
                <td>1000</td>
              </tr>
              <tr>
                <td>1</td>
                <td>Basic</td>
                <td>1000</td>
              </tr>
              
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2">SALARY (GROSS)/PM</td>
                <td>1000</td>
              </tr>
            </tfoot>
          </table>
          <div className='reimbursement-details'>
            <table>
            <thead>
              <tr>
                <th colSpan="3">Reimbursement</th>
              </tr>
            </thead>
              <tbody className='reimbursement-tbody'>
                <tr>
                  <td>SALARY (CTC)/PM</td>
                  <td id='reimbursement'>2000</td>
                </tr>
                <tr>
                  <td>NET SALARY</td>
                  <td>3000</td>
                </tr>
                <tr>
                  <td>TOTAL NUMBER OF DAYS</td>
                  <td>30</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className='deduction-details'>
          <table>
            <thead>
              <tr>
                <th colSpan="3">Deductions</th>
              </tr>
              <tr>
                <th>Sr. No.</th>
                <th>Salary Head</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Professional Tax</td>
                <td>1000</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2">Total Deductions</td>
                <td>1000</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}

export default SalarySlip;

/**
 * Leave Export & Report Utilities
 * Enterprise HRMS Admin Leave Management Dashboard
 */

import { LeaveRequest } from '../types/leave.types';

export const exportLeaveToExcel = (
  requests: LeaveRequest[],
  fileNamePrefix: string = 'Leave_Requests_Report'
): void => {
  const headers = [
    'Leave ID',
    'Employee ID',
    'Employee Name',
    'Department',
    'Designation',
    'Company Email',
    'Mobile Number',
    'Leave Type',
    'Start Date',
    'End Date',
    'Total Days',
    'Applied Date',
    'Status',
    'Approved/Rejected By',
    'Decision Date',
    'Reason for Leave',
    'Rejection Reason / Notes',
    'Admin Override Applied',
  ];

  const rows = requests.map((r) => [
    `"${r.id}"`,
    `"${r.employeeId}"`,
    `"${r.employeeName}"`,
    `"${r.department}"`,
    `"${r.designation}"`,
    `"${r.companyEmail}"`,
    `"${r.mobileNumber}"`,
    `"${r.leaveType}"`,
    `"${r.startDate}"`,
    `"${r.endDate}"`,
    r.totalDays,
    `"${r.appliedDate}"`,
    `"${r.status}"`,
    `"${r.approvedBy || r.rejectedBy || '-'}"`,
    `"${r.approvedAt || r.rejectedAt || '-'}"`,
    `"${(r.reason || '').replace(/"/g, '""')}"`,
    `"${(r.rejectionReason || r.overrideReason || '').replace(/"/g, '""')}"`,
    `"${r.isOverridden ? 'YES' : 'NO'}"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${fileNamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportLeaveToPDF = (
  reportTitle: string,
  requests: LeaveRequest[]
): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the printable PDF report.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const totalDays = requests.reduce((sum, r) => sum + r.totalDays, 0);
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;
  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} - Godavari Wave Technologies</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 24px;
            color: #1e293b;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1E3A8A;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 20px;
            font-weight: 800;
            color: #1E3A8A;
            letter-spacing: -0.5px;
          }
          .logo span {
            color: #2563EB;
          }
          .title {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
          }
          .meta {
            font-size: 11px;
            color: #64748b;
          }
          .summary-bar {
            display: flex;
            gap: 16px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
          }
          .summary-item {
            flex: 1;
          }
          .summary-label {
            font-size: 10px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
          }
          .summary-val {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 700;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #cbd5e1;
            text-transform: uppercase;
            font-size: 9px;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 9px;
          }
          .badge-approved { background: #dcfce7; color: #15803d; }
          .badge-pending { background: #fef3c7; color: #b45309; }
          .badge-rejected { background: #ffe4e6; color: #be123c; }
          .footer {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Godavari Wave <span>Technologies</span></div>
            <div class="meta">Enterprise Employee Management System</div>
          </div>
          <div style="text-align: right;">
            <div class="title">${reportTitle}</div>
            <div class="meta">Generated: ${dateStr} by Admin User</div>
          </div>
        </div>

        <div class="summary-bar">
          <div class="summary-item">
            <div class="summary-label">Total Records</div>
            <div class="summary-val">${requests.length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Leave Days</div>
            <div class="summary-val">${totalDays}d</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Approved</div>
            <div class="summary-val" style="color: #16a34a;">${approvedCount}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Pending</div>
            <div class="summary-val" style="color: #d97706;">${pendingCount}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Rejected</div>
            <div class="summary-val" style="color: #dc2626;">${rejectedCount}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Status</th>
              <th>Approved/Rejected By</th>
            </tr>
          </thead>
          <tbody>
            ${requests
              .map(
                (r) => `
              <tr>
                <td style="font-family: monospace; font-weight: 600;">${r.id}</td>
                <td><strong>${r.employeeName}</strong><br/><span style="font-size: 9px; color: #64748b;">${r.employeeId}</span></td>
                <td>${r.department}</td>
                <td>${r.designation}</td>
                <td>${r.leaveType}</td>
                <td>${r.startDate} to ${r.endDate}</td>
                <td style="text-align: center; font-weight: 700;">${r.totalDays}d</td>
                <td>
                  <span class="badge ${
                    r.status === 'Approved'
                      ? 'badge-approved'
                      : r.status === 'Pending'
                      ? 'badge-pending'
                      : 'badge-rejected'
                  }">
                    ${r.status}
                  </span>
                </td>
                <td>${r.approvedBy || r.rejectedBy || '-'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <span>Official Corporate Confidential Report • Godavari Wave Technologies Pvt Ltd.</span>
          <span>Page 1 of 1</span>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

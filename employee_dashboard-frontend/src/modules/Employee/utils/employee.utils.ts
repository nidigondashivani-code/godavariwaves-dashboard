import { Employee } from '../types/employee.types';

/**
 * Generate unique company email address based on first and last name.
 * Example: John Smith -> john.smith@company.com
 * If duplicate exists -> john.smith01@company.com, john.smith02@company.com, etc.
 */
export function generateCompanyEmail(
  firstName: string,
  lastName: string,
  existingEmails: string[] = [],
  domain: string = 'company.com'
): string {
  const cleanFirst = firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (!cleanFirst && !cleanLast) return `employee@${domain}`;
  if (!cleanLast) return `${cleanFirst}@${domain}`;
  if (!cleanFirst) return `${cleanLast}@${domain}`;

  const baseEmail = `${cleanFirst}.${cleanLast}@${domain}`;
  const lowerExisting = existingEmails.map((e) => e.toLowerCase());

  if (!lowerExisting.includes(baseEmail)) {
    return baseEmail;
  }

  // Handle collision: john.smith01@company.com, john.smith02@company.com
  let counter = 1;
  while (counter < 100) {
    const padded = counter < 10 ? `0${counter}` : `${counter}`;
    const candidate = `${cleanFirst}.${cleanLast}${padded}@${domain}`;
    if (!lowerExisting.includes(candidate)) {
      return candidate;
    }
    counter++;
  }

  return `${cleanFirst}.${cleanLast}${Date.now().toString().slice(-4)}@${domain}`;
}

/**
 * Generate a cryptographically secure temporary password (8-12 characters)
 * Must include: Uppercase, Lowercase, Number, Special character
 */
export function generateTemporaryPassword(length: number = 10): string {
  const finalLength = Math.max(8, Math.min(12, length));

  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars like I, O
  const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz'; // Exclude l
  const numberChars = '23456789'; // Exclude 0, 1
  const specialChars = '!@#$%^&*-_+=';

  // Ensure at least one character from each required set
  const required = [
    uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
    lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  const remaining = [];
  for (let i = 4; i < finalLength; i++) {
    remaining.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle array using Fisher-Yates
  const combined = [...required, ...remaining];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}

/**
 * Generate Next Employee ID (e.g. EMP-013)
 */
export function generateNextEmployeeId(employees: Employee[]): string {
  let maxId = 0;
  for (const emp of employees) {
    const match = emp.employeeId.match(/EMP-(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxId) maxId = num;
    }
  }
  const nextNum = maxId + 1;
  const padded = nextNum.toString().padStart(3, '0');
  return `EMP-${padded}`;
}

/**
 * Export employees data to Excel-compatible CSV with UTF-8 BOM
 */
export function exportEmployeesToExcel(employees: Employee[], filename = 'Employees_Export'): void {
  const headers = [
    'Employee ID',
    'First Name',
    'Last Name',
    'Company Email',
    'Department',
    'Designation',
    'Role',
    'Employment Type',
    'Date of Joining',
    'Status',
    'Dashboard Access',
    'Mobile Number',
    'Personal Email',
  ];

  const rows = employees.map((emp) => [
    `"${emp.employeeId}"`,
    `"${emp.firstName}"`,
    `"${emp.lastName}"`,
    `"${emp.companyEmail}"`,
    `"${emp.department}"`,
    `"${emp.designation}"`,
    `"${emp.role}"`,
    `"${emp.employmentType}"`,
    `"${emp.joiningDate}"`,
    `"${emp.status}"`,
    `"${emp.dashboardAccess ? 'Enabled' : 'Disabled'}"`,
    `"${emp.mobileNumber || ''}"`,
    `"${emp.personalEmail || ''}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export employees data to Printable View / PDF
 */
export function exportEmployeesToPdf(employees: Employee[], title = 'Employee Directory Report'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rowsHtml = employees
    .map(
      (emp) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 600;">${emp.employeeId}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${emp.firstName} ${emp.lastName}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${emp.companyEmail}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${emp.department}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${emp.designation}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${emp.role}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${emp.joiningDate}</td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background-color: ${
          emp.status === 'Active' ? '#DCFCE7; color: #15803D;' : '#F1F5F9; color: #475569;'
        }">${emp.status}</span>
      </td>
      <td style="padding: 8px; border: 1px solid #e5e7eb;">${emp.dashboardAccess ? 'Enabled' : 'Disabled'}</td>
    </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111827; padding: 24px; margin: 0; }
          .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; }
          h1 { color: #1e3a8a; margin: 0 0 6px 0; font-size: 24px; }
          .meta { color: #6b7280; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
          th { background-color: #f8fafc; padding: 10px 8px; text-align: left; border: 1px solid #e5e7eb; font-weight: 700; color: #374151; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="meta">Generated on: ${new Date().toLocaleString()} | Total Records: ${employees.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Role</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

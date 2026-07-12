# KIDTRAK Early Childhood Daycare Management System – User Manual

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Key Features](#key-features)
5. [Technical Stack](#technical-stack)
6. [Installation & Setup](#installation--setup)
7. [Detailed User Guides](#detailed-user-guides)
8. [Common Tasks & Troubleshooting](#common-tasks--troubleshooting)

---

## System Overview

**KIDTRAK** is a comprehensive **Early Childhood Daycare Management System** designed to streamline student enrollment, assessment tracking, and reporting for daycare centers, teachers, and parents. 

### What This System Does
- **Digital Learning Tracking**: Record and monitor student development across multiple assessment domains
- **Parent Enrollment Management**: Simplify student enrollment with secure document uploads and admin approvals
- **Teacher Assessment Tools**: Create and manage ECCD (Early Childhood Care & Development) and ITED assessments
- **Automated Reporting**: Generate PDF reports and analytics for parents and administrators
- **Role-Based Access Control**: Three distinct user roles with specific dashboards and features
- **Real-Time Messaging**: Built-in messaging system for communication between admins, teachers, and parents

---

## Getting Started

### Prerequisites
- **PHP**: 8.2 or higher
- **Node.js**: 18 or higher
- **npm** or **yarn**
- **MySQL**: 5.7+ or 8.0+
- **Composer**: For PHP package management

### System Requirements
- 2GB RAM minimum
- 500MB free disk space
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## User Roles & Permissions

### 1. **Administrator**
**What they can do:**
- Manage all daycare centers and staff
- Approve/reject teacher and student enrollments
- Create and manage assessment domains (competencies)
- View system-wide analytics and reports
- Export compliance reports and master rosters
- Manage user accounts and permissions
- Archive/restore students and staff records

**Dashboard Access:** `/admin/dashboard`
- View total learners, active learners, and pending enrollments
- Track assessment completion rates
- Monitor staff activity
- View recent user activity

### 2. **Teacher (CDW)**
**What they can do:**
- View assigned students in their classroom/section
- Create and submit student assessments (ECCD/ITED forms)
- Track class performance metrics
- Generate student reports and consolidated class analytics
- Archive/restore student records
- Bulk import students
- Export class data and student lists
- View messaging inbox

**Dashboard Access:** `/teacher/dashboard`
- Quick stats on students and assessment progress
- List of students by section
- Pending assessments tracker

### 3. **Parent/Guardian**
**What they can do:**
- Enroll children in daycare centers
- Upload required enrollment documents (birth certificate, immunizations, etc.)
- View child's assessment results
- Download and print report cards
- View messaging from teachers/admins
- Access consolidated learning progress reports

**Dashboard Access:** `/parent/dashboard`
- View enrolled children
- Access assessment reports
- Download PDF reports

---

## Key Features

### A. **Student Enrollment & Management**
1. **Parent Registration**: Parents create accounts with name, email, phone
2. **Child Enrollment**: Parents select daycare, fill child demographics
3. **Document Upload**: Secure upload of birth certificate, vaccination records, etc.
4. **Admin Approval**: Admins verify documents and approve enrollment
5. **Student Tracking**: Track active/archived students by daycare and section

**Key Fields Tracked:**
- Date of birth (auto-calculates age)
- Address, contact information
- Guardian relationships (links to multiple parents)
- Enrollment status (Active/Inactive/Archived)
- Assigned section/classroom

---

### B. **Assessment System**
The system supports two assessment types:

**1. ECCD (Early Childhood Care & Development)**
- Measures 5 developmental domains (e.g., cognitive, social-emotional, physical)
- Scores entered per domain (0-100 scale)
- Overall score calculated automatically
- Status: Draft → In Progress → Completed → Flagged

**2. ITED**
- Similar structure with different domain set
- Used for older children transitioning to formal education

**Assessment Workflow:**
1. Teacher creates new assessment for student(s)
2. Opens form and enters domain scores
3. System calculates overall average
4. Teacher marks as "Completed"
5. Parents notified automatically
6. Parents can download and print report

---

### C. **Reporting & Analytics**
- **Student Profile Report**: Individual child's progress across all assessments
- **Class Consolidated Report**: Teacher's entire class performance at a glance
- **Domain Analysis**: Deep dive into specific developmental areas
- **Parent Report Card PDF**: Professional PDF with child's assessment scores
- **Master Roster**: Admin export of all students with key demographics
- **Compliance Audit Report**: Track enrollment documentation status

---

### D. **Messaging System**
- **Send Messages**: Between admins, teachers, and parents
- **Mark as Read**: Track message status
- **Delete Messages**: Remove old messages
- **Inbox**: Central location for all communication

---

## Technical Stack

### Backend (PHP/Laravel)
- **Framework**: Laravel 12
- **Database**: MySQL 5.7+ / 8.0+
- **Authentication**: Laravel Fortify (secure login/register)
- **PDF Generation**: Laravel DomPDF (report generation)
- **Data Export**: Maatwebsite Excel (CSV exports)
- **Real-time**: Laravel Reverb (WebSocket support)
- **Activity Logging**: Spatie Activity Log (audit trail)
- **Queue System**: Database-backed queue for emails

### Frontend (TypeScript + React)
- **Framework**: React 19
- **Build Tool**: Vite 6
- **Page Routing**: Inertia.js (SSR capable)
- **UI Components**: Radix UI + shadcn
- **Styling**: Tailwind CSS 4 with animations
- **Charts**: Recharts (analytics visualization)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)
- **Form Handling**: React Hook Form + Zod validation

### Development Tools
- **Testing**: Pest (PHP), ESLint (JavaScript)
- **Code Quality**: Laravel Pint, Prettier, TypeScript strict mode
- **Container Support**: Docker/Docker Compose ready

---

## Installation & Setup

### 1. **Clone the Repository**
```bash
git clone https://github.com/Rakanya-dev/laravel-project.git
cd laravel-project
```

### 2. **Install Dependencies**
```bash
# PHP dependencies
composer install

# JavaScript dependencies
npm install
```

### 3. **Environment Setup**
```bash
# Copy example env file
cp .env.example .env

# Generate app key (this creates a unique encryption key)
php artisan key:generate
```

### 4. **Configure MySQL Database**

Edit `.env` file and set your MySQL credentials:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1          # Your MySQL server (localhost for local dev)
DB_PORT=3306               # MySQL default port
DB_DATABASE=laravel        # Name of your database
DB_USERNAME=root           # MySQL username
DB_PASSWORD=               # MySQL password (leave empty if none)
```

**Create the database:**
```bash
# Option A: Using MySQL CLI
mysql -u root -p
CREATE DATABASE laravel;
EXIT;

# Option B: Database will be created automatically by Laravel (if user has permissions)
```

### 5. **Database Setup**
```bash
# Run migrations (creates all tables)
php artisan migrate

# Seed with sample data (optional - adds test users/daycares)
php artisan db:seed
```

### 6. **Build Frontend Assets**
```bash
# Development build (includes hot reload)
npm run dev

# Production build (minified, optimized)
npm run build
```

### 7. **Run the Development Server**

**Option A: Concurrently (Recommended)**
```bash
npm run start
```
This automatically runs 4 processes:
- PHP artisan serve (backend on port 8000)
- npm run dev (Vite dev server on port 5173)
- php artisan queue:listen (background job processing)
- Laravel Reverb (optional WebSocket server)

**Option B: Individually**
```bash
# Terminal 1: Backend
php artisan serve

# Terminal 2: Frontend
npm run dev

# Terminal 3: Queue worker (optional)
php artisan queue:listen --tries=1
```

### 8. **Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Database GUI** (optional): PhpMyAdmin or your MySQL client

---

## Detailed User Guides

### **For Administrators**

#### Accessing Admin Dashboard
1. Log in with admin credentials
2. You're automatically routed to `/admin/dashboard`
3. View key metrics: total learners, active staff, pending enrollments

#### Managing Daycares
1. Go to **Admin > Daycare Management**
2. **Create New Daycare**: Click "Add Daycare", fill form
   - Name, address, capacity, principal name
   - Associate teachers to sections
3. **Edit Daycare**: Click daycare name, modify details
4. **Delete Daycare**: Click delete icon (cannot undo!)
5. **View Sections**: Manage classrooms within each daycare

#### Managing Teachers
1. Go to **Admin > Users Management**
2. **Approve Teachers**: Review pending teacher registrations
   - Check credentials and assign to daycare
   - Click "Approve" or "Reject"
3. **Assign Teachers to Sections**: Edit teacher profile
   - Select daycare and section
4. **Export Teacher List**: Click "Print Teachers" for PDF
5. **Bulk Operations**: Select multiple users
   - Bulk delete, bulk archive, bulk restore
6. **View Staff Activity**: See recent logins and actions

#### Approving Student Enrollments
1. Go to **Admin > Student Management**
2. View **Pending Enrollments** count on dashboard
3. Review enrollment requests:
   - Check uploaded documents (birth certificate, vaccinations)
   - Verify parent information is complete
   - Click "Approve Enrollment" or "Request Resubmission"
4. Approved students appear in teacher rosters
5. Parents receive email notification

#### Managing Enrollment Links
1. When parents link multiple guardians:
   - View pending "Guardian Link Requests"
   - Review relationship (mother, father, other)
   - Click "Approve" or "Reject"
2. Only approved guardians can access student records

#### Generating Reports
1. Go to **Admin > Reports**
2. **Master Roster CSV**: 
   - Export all students with demographics
   - Includes: name, DOB, daycare, enrollment status
3. **Compliance Audit CSV**: 
   - Check document completion status
   - Identify missing vaccination records
4. **Consolidated Report PDF**: 
   - System-wide analytics
   - Assessment completion rates by daycare
5. Download or print as needed

#### Managing Assessment Domains
1. Go to **Admin > Domain Management**
2. Create custom assessment categories:
   - Name (e.g., "Cognitive Development")
   - Set sort order (affects form display)
   - Enable/disable by specific daycare
   - Activate/deactivate domains
3. These domains appear in teacher assessment forms
4. Changes affect only future assessments

---

### **For Teachers**

#### Accessing Teacher Dashboard
1. Log in with teacher credentials
2. Routed to `/teacher/dashboard`
3. View: assigned students, class metrics, pending assessments
4. Quick links to My Students and Assessments

#### Managing Your Students
1. Go to **Teacher > My Students**
2. **View Students**: See all students in your assigned section
   - Includes active and archived students
   - Shows enrollment date and status
3. **Add New Student**:
   - Click "Add Student"
   - Fill demographics (first name, last name, DOB, parents)
   - Assign to section
   - Click "Save Student"
4. **Edit Student**: Click student name to update information
5. **Archive Student**: 
   - Right-click menu > "Archive"
   - Student hidden but data retained
6. **Restore Student**: 
   - View archived students
   - Click "Restore" to reactivate
7. **Bulk Import**: 
   - Upload CSV file with multiple students
   - Use template: **Teacher > Student Import Template**
   - CSV Columns: `first_name`, `last_name`, `date_of_birth`, `section_id`
8. **Delete Student**: Permanently removes record (use with caution)

#### Creating & Submitting Assessments

**Single Assessment:**
1. Go to **Teacher > Assessments Management**
2. Click "Create Assessment"
3. Select single student and assessment type (ECCD/ITED)
4. Click "Next"
5. Open assessment form (appears in two tabs: ITED / ECCD)
6. Enter score for each domain (0-100)
7. Add optional teacher comments
8. System auto-calculates overall score
9. Click "Save as Draft" (to continue later) or "Mark Complete" (final)

**Bulk Assessment (Multiple Students):**
1. Go to **Teacher > Assessments Management**
2. Click "Create Assessment"
3. Select multiple students (checkbox)
4. Click "Next"
5. System opens bulk form
6. Fill assessments for all students at once
7. Click "Save All"

#### Viewing & Editing Assessments
1. Go to **Teacher > Assessments Management**
2. View list of all assessments (by student, date, status)
3. **Edit Draft**: Click assessment > modify scores > "Save"
4. **View Completed**: Click to view scores (read-only unless reopened)
5. **Mark as Completed**: Click "Complete" (final submission)
6. **Delete**: Click delete icon (removes assessment)

#### Viewing Reports
1. Go to **Teacher > Reports**
2. **Student Profile Report**: 
   - Select student name
   - See all past assessments
   - Track progress over time
   - View trend charts
3. **Class Consolidated Report**: 
   - View all students' domain averages
   - Identify class strengths/weaknesses
4. **Domain Analysis**: 
   - Select one domain (e.g., Cognitive)
   - Compare all students in that skill
   - Identify students needing intervention

#### Exporting & Printing
1. From **My Students** page: 
   - Click "Export" button for CSV download
   - Includes all student demographics
2. Individual Student Report: 
   - Click "Print Report" icon
   - Browser print dialog opens (save as PDF or physical print)
3. Class Roster: 
   - Click "Print Roster" for full class list PDF
4. All exports are timestamped and include assessment data

#### Using Import Template
1. Go to **Teacher > Students**
2. Click "Download Import Template"
3. Opens CSV file with headers:
   - `first_name`, `last_name`, `date_of_birth`, `section_id`
4. Fill in your student data
5. Go back to **Teacher > Students**
6. Click "Import Students"
7. Select your CSV file
8. System validates and imports all students

---

### **For Parents**

#### First-Time Setup

**Step 1: Register Account**
1. Go to login page
2. Click "Don't have an account? Register"
3. Fill registration form:
   - First Name, Middle Name (optional), Last Name
   - Email (must be unique)
   - Phone (Philippine format: 63XXXXXXXXXX)
   - Password (must be strong)
   - Confirm Password
4. Click "Register"
5. Account created immediately (active)

**Step 2: Verify Email**
1. Check your email inbox
2. Click verification link sent by system
3. Email verified and ready to enroll children

#### Enrolling Your Child

**Step 1: Start Enrollment**
1. Log into your parent account
2. Go to **Parent Dashboard**
3. Click "Enroll Your Child"

**Step 2: Select Daycare**
1. View available daycares with:
   - Daycare name and location
   - Description and capacity info
2. Click "Enroll" next to your preferred daycare

**Step 3: Fill Child Information**
1. Enter child's details:
   - First Name, Last Name (required)
   - Date of Birth (required - used to calculate age)
   - Gender (Male/Female)
   - Address
   - Health Info: Allergies, medical conditions
2. Click "Next"

**Step 4: Upload Documents**
1. Upload required enrollment documents:
   - Birth Certificate (PDF/JPG/PNG)
   - Vaccination Records (PDF/JPG/PNG)
   - Medical Clearance (if required by daycare)
2. Each file max 10MB
3. Click "Upload" for each document

**Step 5: Review & Submit**
1. Review all entered information
2. Check all documents uploaded
3. Read and accept terms
4. Click "Submit for Approval"
5. System sends submission confirmation

**Step 6: Wait for Approval**
- Admin reviews documents (1-3 business days)
- You'll receive email when approved or if resubmission needed
- Once approved, child appears in teacher roster

#### Linking Multiple Guardians
1. Go to **Parent Dashboard**
2. Click "Link Another Guardian"
3. Select child
4. Enter guardian's email
5. Specify relationship (Mother, Father, Grandparent, etc.)
6. Click "Send Link Request"
7. Other guardian receives email to accept link
8. Once accepted, both guardians can view child's records

#### Viewing Child's Progress

**Step 1: My Dashboard**
1. See all enrolled children listed
2. Click child's name to open profile
3. View enrollment date and daycare name

**Step 2: View Assessments**
1. From child profile, click "View Assessments"
2. See list of completed assessments with:
   - Assessment date
   - Overall score
   - Domain breakdown
   - Teacher name and comments
3. Click assessment to expand details

**Step 3: Download Report Card**
1. From assessment, click "Download PDF"
2. Professional report generated with:
   - Child's photo and basic info
   - Assessment scores
   - Domain analysis
   - Teacher observations
3. File saved to Downloads folder
4. Report named: `LastName_ECCD_Consolidated_Report.pdf`

**Step 4: Print Report**
1. From assessment, click "Print"
2. Browser print dialog opens
3. Select printer or "Save as PDF"
4. Print or save for records

#### Viewing Consolidated Progress
1. Go to **Parent > Reports**
2. Click "Consolidated Report"
3. See child's progress across ALL assessments:
   - Timeline of all assessments
   - Trend charts showing improvement
   - Domain-by-domain analysis
   - Teacher comments

#### Communicating with Teachers

**Send Message:**
1. Go to **Messages** icon in header
2. Click "New Message"
3. Select recipient (specific teacher or admin)
4. Type your message
5. Click "Send"

**Read Messages:**
1. Go to **Messages**
2. Click message to expand and read full content
3. View timestamp and sender

**Delete Messages:**
1. From message list, click trash/delete icon
2. Message removed from inbox

#### Managing Your Account

**Update Profile:**
1. Go to **Settings > Profile**
2. Update:
   - Name, email, phone
   - Residential address
3. Click "Save Changes"

**Upload Profile Photo:**
1. Go to **Settings > Profile**
2. Click "Upload Photo"
3. Select image (JPEG, PNG, WebP - max 2MB)
4. Click "Upload"
5. Photo appears on profile

**Change Password:**
1. Go to **Settings > Password**
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click "Update Password"
6. Log out and log back in with new password

**Delete Account:**
1. Go to **Settings > Profile**
2. Click "Delete Account" at bottom
3. Enter password to confirm
4. Account and all data permanently deleted
   - **Cannot be undone!**

---

## Common Tasks & Troubleshooting

### Setup Issues

#### "Error: SQLSTATE HY000 (2002) - Connection refused"
**Problem:** Cannot connect to MySQL database
**Solution:**
- Ensure MySQL is running: `sudo service mysql start` (Linux) or check Services (Windows)
- Verify `.env` file has correct `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`
- Test connection: `mysql -u root -p -h 127.0.0.1`
- Default MySQL port is 3306

#### "Error: No such file or directory - .env"
**Problem:** Environment file missing
**Solution:**
```bash
cp .env.example .env
php artisan key:generate
```

#### "Error: Class 'PDO' not found"
**Problem:** PHP MySQL extension not installed
**Solution:**
- Linux: `sudo apt-get install php-mysql`
- macOS: `brew install php@8.2` with MySQL support
- Windows: Uncomment `extension=pdo_mysql` in `php.ini`

### Login & Access Issues

#### "Invalid credentials" on login
**Problem:** Email/password incorrect
**Solution:**
- Double-check email and password spelling
- Use "Forgot Password" to reset if needed
- Ensure email is verified (check inbox for verification link)

#### "Your account is pending approval"
**Problem:** Admin hasn't approved teacher/user yet
**Solution:**
- Contact your administrator
- Admin must go to **Admin > Users Management** and click "Approve"

#### "Unauthorized role"
**Problem:** User logged in but doesn't have proper role assigned
**Solution:**
- Admin must verify user's role in database
- Possible roles: `admin`, `teacher`, `parent`
- Verify in **Admin > Users Management**

#### "Your email is not verified"
**Problem:** Parent/user hasn't confirmed email
**Solution:**
- Check inbox for verification email
- Click verification link
- If email not received, request resend on login page

### Teacher Issues

#### "My students aren't showing up"
**Problem:** Teacher sees empty student list
**Solution:**
- Verify teacher is assigned to a daycare (Admin must assign)
- Check if students are in your assigned section
- Try refreshing page (Ctrl+R)
- Check if students are archived (show archived: toggle)

#### "Can't create assessment"
**Problem:** Assessment creation button disabled
**Solution:**
- Ensure you're assigned to a daycare
- Select at least one student
- Ensure assessment domain exists (Admin creates these)
- Check MySQL connection

#### "Assessment scores not saving"
**Problem:** Entered scores disappear when refreshing
**Solution:**
- Ensure you clicked "Save" or "Mark Complete"
- Check browser console for errors (F12)
- Try different browser
- Clear browser cache

#### "PDF Report generation fails"
**Problem:** Error when trying to print/download PDF
**Solution:**
- Check internet connection (fonts are loaded from CDN)
- Verify student DOB is in valid format (YYYY-MM-DD)
- Ensure all assessment data is complete
- Try using Firefox instead of Chrome

### Parent Issues

#### "Can't upload enrollment documents"
**Problem:** File upload fails or button does nothing
**Solution:**
- Check file size (max 10MB per file)
- Use supported format: PDF, JPG, PNG
- Check internet connection
- Try different browser
- Ensure sufficient disk space on server

#### "Can't find child's report"
**Problem:** No assessments visible for child
**Solution:**
- Teacher must create and complete assessment first
- Wait 1-2 weeks for teacher to enter assessments
- Check assessment status is "Completed" (not Draft/In Progress)
- Refresh page and check notifications

#### "Enrollment stuck in pending"
**Problem:** Admin approval taking too long
**Solution:**
- Contact your daycare directly
- Admin may be requesting additional documents
- Check email for resubmission requests
- Follow up after 5 business days

#### "Can't link another guardian"
**Problem:** Guardian link request fails
**Solution:**
- Verify guardian email is correct
- Ensure guardian has registered account
- Check email for link acceptance request
- Guardian must click link to accept

### Admin Issues

#### "Can't upload teacher list"
**Problem:** CSV import fails
**Solution:**
- Verify CSV has required columns: `first_name`, `last_name`, `email`, `phone`
- Phone format must be: `63XXXXXXXXXX` (Philippine numbers only)
- Check for duplicate emails (each email must be unique)
- Ensure file is UTF-8 encoded
- Download template for correct format

#### "Pending enrollments not showing"
**Problem:** Admin sees 0 pending enrollments
**Solution:**
- Parents must submit enrollment requests first
- Refresh page (Ctrl+R)
- Check if all enrollments already approved
- Look for "Guardian Link Requests" tab

#### "Database migration errors"
**Problem:** Error running `php artisan migrate`
**Solution:**
```bash
# Check migration status
php artisan migrate:status

# Reset migrations (wipes all data!)
php artisan migrate:refresh

# Rollback one step
php artisan migrate:rollback
```

### Database Issues

#### "Lost MySQL connection during operation"
**Problem:** MySQL server disconnected mid-operation
**Solution:**
- Restart MySQL: `sudo service mysql restart`
- Check MySQL max_connections setting
- Increase if needed: `SET GLOBAL max_connections=1000;`
- Check disk space: `df -h`

#### "Database too large / slow queries"
**Problem:** System running slowly, large database
**Solution:**
```bash
# Archive old assessments (optional)
# Create backup first!

# Optimize tables
php artisan tinker
>>> DB::statement('OPTIMIZE TABLE users');
>>> DB::statement('OPTIMIZE TABLE assessments');
```

#### "Can't restore database backup"
**Problem:** Backup restoration fails
**Solution:**
```bash
# Create fresh database
DROP DATABASE laravel;
CREATE DATABASE laravel;

# Import backup
mysql -u root -p laravel < backup.sql

# Run migrations
php artisan migrate
```

### Performance Optimization Tips

#### Frontend is slow
- Clear browser cache (Ctrl+Shift+Del)
- Run `npm run build` for production-optimized assets
- Check network tab in DevTools (F12) for slow requests

#### Database queries are slow
- Enable query logging in `.env`: `DB_QUERY_LOG=true`
- Check `storage/logs/` for slow queries
- Add indexes on frequently searched columns
- Archive old assessment data

#### Large file uploads failing
- Increase PHP limits in `.php.ini`:
  ```
  upload_max_filesize = 50M
  post_max_size = 50M
  ```
- Restart PHP: `sudo service php8.2-fpm restart`

---

## Support & Resources

- **GitHub Repository**: https://github.com/Rakanya-dev/laravel-project
- **Report Issues**: Create GitHub issue with error details and steps to reproduce

---

**Last Updated:** July 2026  
**System Version:** Laravel 12 + React 19 with TypeScript  
**Database:** MySQL 5.7+  

---

## Quick Command Reference

```bash
# Start development server
npm run start

# Build for production
npm run build

# Run database migrations
php artisan migrate

# Seed sample data
php artisan db:seed

# Generate PDF test
php artisan tinker

# Check application health
php artisan health

# View application logs
tail -f storage/logs/laravel.log
```

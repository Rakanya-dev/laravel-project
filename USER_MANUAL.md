# CENTRALIZED ASSESSMENT RECORD SYSTEM FOR GMA CHILD DEVELOPMENT CENTER – User Manual

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

The **Centralized Assessment Record System for GMA Child Development Center** is a comprehensive platform designed to streamline student enrollment, assessment tracking, and reporting for daycare centers, teachers, and parents. 

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

**Access Menu:**
- **Dashboard** - System overview and key metrics
- **Staff & Users** - Manage teachers and staff accounts
- **Daycare Centers** - Create and manage daycare locations and sections
- **Student Management** - Approve enrollments, manage student records
- **Assessment Domains** - Create and configure assessment categories
- **Reports** - Generate compliance reports and analytics
- **Messages** - Communication with teachers and parents

**What they can do:**
- View system-wide dashboards with total learners, active staff, pending enrollments
- Manage all daycare centers and staff assignments
- Approve/reject teacher and student enrollments
- Create and manage assessment domains (competencies)
- View system-wide analytics and reports
- Export compliance reports and master rosters
- Manage user accounts and permissions
- Archive/restore students and staff records
- Send and receive messages with all users

**Dashboard Metrics:**
- Total learners and active learners
- Pending enrollment count
- Assessment completion rates
- Active staff count
- Recent user activity feed

---

### 2. **Teacher (CDW)**

**Access Menu:**
- **Dashboard** - Class overview and quick stats
- **My Students** - Student roster and management
- **Assessments** - Create and manage ECCD/ITED assessments
- **Messages** - Communicate with admins and parents

**What they can do:**
- View assigned students in their classroom/section
- Create and submit student assessments (ECCD/ITED forms)
- Track class performance metrics
- Generate student reports and consolidated class analytics
- Archive/restore student records
- Export class data and student lists
- Send and receive messages with parents and admins
- View class statistics and assessment progress

**Dashboard Features:**
- Quick stats on students and assessment progress
- List of students by section
- Pending assessments tracker
- Class average scores
- Student roster with basic info

**Note:** Teachers cannot import students - all student records are created by parents during enrollment and approved by administrators.

---

### 3. **Parent/Guardian**

**Access Menu:**
- **Dashboard Overview** - View enrolled children and quick stats
- **Academics** 
  - Assessment History - View all child assessments
  - Report Cards - Download and print reports
- **Messages** - Communicate with teachers

**What they can do:**
- Enroll children in daycare centers
- Upload required enrollment documents (birth certificate, immunizations, etc.)
- View child's assessment results and progress
- Download and print report cards
- View messaging from teachers/admins
- Access consolidated learning progress reports
- Manage multiple children's records
- Track assessment history over time

**Dashboard Features:**
- View all enrolled children
- Quick access to assessment history
- Latest report cards
- Pending notifications
- Child pending enrollment status for each child

---

## Key Features

### A. **Student Enrollment & Management**
1. **Parent Registration**: Parents create accounts with name, email, phone
2. **Child Enrollment**: Parents select daycare, fill child demographics
3. **Document Upload**: Secure upload of birth certificate, vaccination records, etc.
4. **Admin Approval**: Admins verify documents and approve enrollment
5. **Student Tracking**: Track active/approved students by daycare and section

**Key Fields Tracked:**
- First Name, Last Name
- Date of birth (auto-calculates age)
- Gender
- Address, contact information
- Guardian relationships (links to multiple parents)
- Enrollment status (Pending/Active/Inactive/Archived)
- Assigned section/classroom

**Enrollment Status Meanings:**
- **Pending**: Parent submitted enrollment, awaiting admin approval
- **Active**: Child is enrolled and attending classes
- **Inactive**: Child is not currently enrolled
- **Archived**: Historical record, no longer active

**Note:** Health information (allergies, medical conditions) is NOT stored in the system. Parents should communicate any health concerns directly with the daycare staff.

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
7. System maintains complete assessment history

---

### C. **Reporting & Analytics**
- **Student Profile Report**: Individual child's progress across all assessments
- **Class Consolidated Report**: Teacher's entire class performance at a glance
- **Domain Analysis**: Deep dive into specific developmental areas
- **Parent Report Card PDF**: Professional PDF with child's assessment scores
- **Assessment History**: Complete timeline of child's assessments
- **Master Roster**: Admin export of all students with key demographics
- **Compliance Audit Report**: Track enrollment documentation status

---

### D. **Messaging System**
- **Send Messages**: Between admins, teachers, and parents
- **Mark as Read**: Track message status
- **Inbox**: Central location for all communication
- **Role-based filtering**: See only relevant conversations

**Note:** Messages cannot be deleted - they are permanently stored for record-keeping and audit purposes.

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
3. View key metrics: total learners, active staff, pending enrollments, assessment progress

#### Dashboard
**Metrics Displayed:**
- Total learners (all enrolled children)
- Active learners (currently enrolled)
- Pending enrollments (awaiting approval)
- Assessment completion rates
- Active staff count
- Recent user activity feed
- System health status

**Quick Actions:**
- Approve pending enrollments
- View pending teacher registrations
- Access recent reports
- Send system-wide messages

#### Staff & Users Management
1. Go to **Admin > Staff & Users**
2. **View All Staff**:
   - See all teachers and staff with status
   - Filter by daycare center
   - Filter by role (teacher, admin)
   - View last login and activity
3. **Approve Teachers**: 
   - Review pending teacher registrations
   - Check credentials and documentation
   - Click "Approve" or "Reject"
   - Assign to daycare and section
4. **Assign Teachers to Sections**: 
   - Edit teacher profile
   - Select daycare and classroom
   - Update assignments
5. **Export Staff List**: 
   - Click "Print Staff" for PDF report
   - Includes all staff information
6. **Bulk Operations**: 
   - Select multiple staff members
   - Bulk delete, bulk archive, bulk restore
7. **View Staff Activity**: 
   - See recent logins and actions
   - Track staff engagement
   - Monitor system usage

#### Daycare Centers Management
1. Go to **Admin > Daycare Centers**
2. **View All Centers**:
   - List of all daycare locations
   - Enrollment numbers per center
   - Staff assignments
   - Capacity status
3. **Create New Daycare**: 
   - Click "Add Daycare Center"
   - Fill form: name, address, city, province, postal code
   - Add contact info: email, phone
   - Set principal name and capacity
   - Add description
   - Set established date
4. **Edit Daycare**: 
   - Click daycare name or edit icon
   - Modify all details
   - Update capacity and info
5. **Manage Sections**: 
   - Add classroom sections to daycare
   - Assign teachers to sections
   - Set section capacity and schedules
6. **Delete Daycare**: 
   - Click delete icon (cannot undo!)
   - Confirm deletion

#### Student Management
1. Go to **Admin > Student Management**
2. **View All Students**:
   - List of all enrolled and pending students
   - Filter by daycare, section, status
   - Search by name or ID
   - View enrollment dates
3. **Approve Student Enrollments**:
   - View **Pending Enrollments** count on dashboard
   - Review enrollment requests:
     - Check uploaded documents (birth certificate, vaccinations)
     - Verify parent information is complete
     - Review child demographics
   - Click "Approve Enrollment" or "Request Resubmission"
4. **Manage Enrollment Documents**:
   - View uploaded files per student
   - Verify document completeness
   - Request resubmission if needed
   - View document history
5. **Student Records**:
   - View complete student profiles
   - See guardian relationships
   - Track enrollment status
   - View assessment history
6. **Archive/Restore Students**:
   - Archive inactive students
   - Restore archived students
   - Bulk archive/restore operations
7. **Guardian Link Requests**:
   - Review pending guardian approvals
   - Manage multiple guardian access
   - Approve/reject link requests

#### Assessment Domains Management
1. Go to **Admin > Assessment Domains**
2. **View Existing Domains**:
   - List all active assessment domains
   - See which daycares use each domain
   - View sort order and status
3. **Create New Domain**: 
   - Click "Add Assessment Domain"
   - Enter domain name (e.g., "Cognitive Development")
   - Set sort order (controls form display sequence)
   - Activate for daycares
   - Set as active/inactive
4. **Edit Domain**: 
   - Click domain to edit
   - Update name, sort order, status
   - Modify daycare assignments
5. **Enable/Disable by Daycare**:
   - Select which daycares use this domain
   - Toggle domain active/inactive per center
6. **Toggle Status**: 
   - Activate/deactivate domains
   - Affects future assessments only
   - Past assessments remain unchanged

**Domain Usage:**
- Domains appear in teacher assessment forms
- Changes affect only future assessments
- Teachers see only active domains for their daycare

#### Reports
1. Go to **Admin > Reports**
2. **Available Reports**:
   - **Master Roster CSV** - Export all students with demographics
     - Includes: name, DOB, address, daycare, enrollment status
     - Download for Excel analysis
   - **Compliance Audit CSV** - Check document completion
     - Track which students have all required documents
     - Identify missing vaccination records
     - Export for audits
   - **Consolidated Report PDF** - System-wide analytics
     - Overall enrollment statistics
     - Assessment completion rates by daycare
     - Staff activity summaries
     - Professional PDF format for printing/archiving
3. **Report Customization**:
   - Filter by date range
   - Filter by daycare center
   - Select specific metrics
4. **Download & Print**:
   - Download reports in CSV or PDF
   - Print directly or save for records
   - Archive reports for compliance

#### Messages
1. Go to **Admin > Messages**
2. **View Inbox**:
   - See all messages from teachers and parents
   - Filter by sender (teacher, parent)
   - Filter by date range
   - Search messages
3. **Send Message**:
   - Click "New Message"
   - Select recipient (teacher or parent)
   - Type message
   - Click "Send"
4. **Manage Messages**:
   - Mark message as read
   - Archive/star messages for reference
5. **Message History**:
   - View complete conversation thread
   - See timestamp and sender info
   - Maintain permanent message archive

**Important:** Messages cannot be deleted - they are permanently stored for compliance and audit trail purposes. You can mark messages as read or archive them for organization.

---

### **For Teachers**

#### Accessing Teacher Dashboard
1. Log in with teacher credentials
2. Routed to `/teacher/dashboard`
3. View: assigned students, class metrics, pending assessments
4. Quick links to My Students and Assessments

#### Dashboard
**Metrics Displayed:**
- Total students in class
- Total assessments completed
- Assessments due (pending)
- Class average score
- Student roster by section

**Quick Actions:**
- Create new assessment
- View my students
- Send messages to parents

**Note:** Dashboard shows only assessment statistics, not enrollment status. Enrollment status is managed by administrators.

#### My Students Management
1. Go to **Teacher > My Students**
2. **View Students**: 
   - See all students in your assigned section
   - Includes active and archived students
   - Shows enrollment date and basic info
   - Filter by name or status
3. **Student Profile**: 
   - Click student name to view full profile
   - See demographics and guardian info
   - View assessment history
   - Track student progress
4. **Edit Student**: 
   - Click student name to update information
   - Modify demographics and contact info (limited fields)
   - Cannot change enrollment status
5. **Archive Student**: 
   - Click "Archive" (soft delete)
   - Student hidden but data retained
   - Can be restored later
6. **Restore Student**: 
   - View archived students (toggle)
   - Click "Restore" to reactivate
7. **Delete Student**: 
   - Permanently removes record (use with caution)
   - Cannot be undone

**Important Notes:**
- Teachers **cannot** import students via CSV
- All student records are created through parent enrollment process
- Admins approve enrollments and students appear in teacher rosters
- Student enrollment status is managed by admins only

#### Assessments Management
1. Go to **Teacher > Assessments**
2. **View All Assessments**:
   - List of all student assessments
   - Filter by student, date, status
   - Sort by completion date
   - Search assessments

**Creating Assessments:**

**Single Assessment:**
1. Click "Create Assessment"
2. Select single student
3. Select assessment type (ECCD/ITED)
4. Click "Next"
5. Open assessment form
6. Enter score for each domain (0-100)
7. Add optional teacher comments
8. System auto-calculates overall score
9. Click "Save as Draft" (to continue later) or "Mark Complete" (final)

**Bulk Assessment (Multiple Students):**
1. Click "Create Assessment"
2. Select multiple students (checkbox)
3. Click "Next"
4. System opens bulk form
5. Fill assessments for all students at once
6. Click "Save All"

#### Viewing & Editing Assessments
1. From **Assessments** list:
2. **Edit Draft**: 
   - Click assessment > modify scores > "Save"
   - Continue editing later if needed
3. **View Completed**: 
   - Click to view scores (read-only)
   - Can be reopened for editing if needed
4. **Mark as Completed**: 
   - Click "Complete" (final submission)
   - Parents notified automatically
5. **Delete**: 
   - Click delete icon (removes assessment)
6. **Flag for Review**:
   - Mark assessments needing follow-up
   - Track student progress concerns

#### Assessment Types

**ECCD Form Sections:**
- Child information
- Assessment date
- Domain scoring (0-100 per domain)
- Overall score calculation
- Teacher comments
- Recommendations

**ITED Form Sections:**
- Child information
- Assessment date
- Domain scoring (0-100 per domain)
- Overall score calculation
- Teacher observations
- Academic recommendations

#### Messages
1. Go to **Teacher > Messages**
2. **View Inbox**:
   - See all messages from parents and admins
   - Filter by sender
   - Sort by date
   - Search messages
3. **Send Message**:
   - Click "New Message"
   - Select parent or admin recipient
   - Type message
   - Click "Send"
4. **Manage Messages**:
   - Mark message as read
   - Archive/star messages for reference
5. **Message Threads**:
   - View complete conversation history
   - See timestamps
   - Reply within thread

**Important:** Messages cannot be deleted - they are permanently stored for record-keeping purposes. You can mark messages as read or archive them for organization.

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

#### Dashboard Overview
1. Log in to parent account
2. View **Dashboard Overview**:
   - All enrolled children listed
   - Child photos and basic info
   - Enrollment status for each child:
     - **Pending**: Awaiting admin approval
     - **Active**: Approved and attending
     - **Inactive**: Not currently enrolled
   - Daycare assignment
   - Quick stats on children
3. **Quick Actions**:
   - View academic progress
   - Access assessment history
   - Download report cards
   - Send messages to teachers
4. **Child Selection**:
   - Click child name to view details
   - Switch between children quickly

#### Enrolling Your Child

**Step 1: Start Enrollment**
1. From Dashboard Overview
2. Click "Enroll Your Child"
3. Or from menu: **Parent > Enroll**

**Step 2: Select Daycare**
1. View available daycares with:
   - Daycare name and location
   - Description and capacity info
   - Contact information
2. Click "Enroll" next to your preferred daycare

**Step 3: Fill Child Information**
1. Enter child's details:
   - First Name, Last Name (required)
   - Date of Birth (required - used to calculate age)
   - Gender (Male/Female)
   - Address
2. Click "Next"

**Step 4: Upload Documents**
1. Upload required enrollment documents:
   - Birth Certificate (PDF/JPG/PNG)
   - Vaccination Records (PDF/JPG/PNG)
   - Medical Clearance (if required by daycare)
2. Each file max 10MB
3. Click "Upload" for each document
4. Verify all documents uploaded

**Step 5: Review & Submit**
1. Review all entered information
2. Check all documents uploaded
3. Read and accept enrollment terms
4. Click "Submit for Approval"
5. System sends submission confirmation

**Step 6: Wait for Approval**
- Admin reviews documents (1-3 business days)
- You'll receive email when approved or if resubmission needed
- Enrollment status changes from "Pending" to "Active"
- Once approved, child appears in teacher roster
- Notifications sent when status changes

**Important Notes:**
- Health information (allergies, medical conditions) should be communicated directly with daycare staff
- This system focuses on enrollment and assessment tracking
- For special health or dietary needs, please contact your daycare center directly

#### Academics - Assessment History
1. Go to **Parent > Academics > Assessment History**
2. **View All Assessments**:
   - List of all completed assessments
   - Assessment date and type (ECCD/ITED)
   - Overall score
   - Teacher name and comments
3. **Assessment Details**:
   - Click assessment to expand
   - View domain-by-domain scores
   - Read teacher observations
   - See trends over time
4. **Assessment Timeline**:
   - See chronological progression
   - Track child's development
   - Compare scores over time
5. **Filters**:
   - Filter by assessment type
   - Filter by date range
   - Search for specific assessments
6. **Track Progress**:
   - Identify strengths and areas for development
   - See improvement trends
   - Review teacher recommendations

#### Academics - Report Cards
1. Go to **Parent > Academics > Report Cards**
2. **View Report Cards**:
   - List of all available report cards
   - Report generation date
   - Child's overall progress
3. **Download Report Card**:
   - Click "Download PDF"
   - Professional report generated with:
     - Child's photo and basic info
     - Assessment scores
     - Domain analysis
     - Teacher observations
     - Recommendations
   - File saved to Downloads folder
   - Report named: `LastName_ECCD_Consolidated_Report.pdf`
4. **Print Report Card**:
   - From report list, click "Print"
   - Browser print dialog opens
   - Select printer or "Save as PDF"
   - Print or save for records
5. **View Multiple Reports**:
   - Access report cards from different assessment periods
   - Compare progress across reports
   - Track long-term development

#### Linking Multiple Guardians
1. Go to **Dashboard Overview**
2. Click "Manage Guardians" or "Link Another Guardian"
3. Select child
4. Enter guardian's email
5. Specify relationship (Mother, Father, Grandparent, etc.)
6. Click "Send Link Request"
7. Other guardian receives email to accept link
8. Once accepted, both guardians can view child's records
9. Both guardians see same assessment data

#### Messages
1. Go to **Parent > Messages**
2. **View Inbox**:
   - See all messages from teachers and admins
   - Filter by sender (teacher, admin)
   - Sort by date
   - Search messages
3. **Send Message**:
   - Click "New Message"
   - Select recipient (child's teacher or admin)
   - Type message
   - Attach files if needed
   - Click "Send"
4. **Manage Messages**:
   - Mark message as read
   - Archive/star messages for reference
5. **Message Threads**:
   - View complete conversation history
   - Reply within thread
   - See all timestamps

**Important:** Messages cannot be deleted - they are permanently stored for compliance and record-keeping purposes. You can mark messages as read or archive them for organization.

#### Managing Your Account

**Update Profile:**
1. Go to **Settings > Profile**
2. Update:
   - Name, email, phone
   - Residential address
   - Language preference
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
   - All children's records deleted

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
- Admin must go to **Admin > Staff & Users** and click "Approve"

#### "Unauthorized role"
**Problem:** User logged in but doesn't have proper role assigned
**Solution:**
- Admin must verify user's role in database
- Possible roles: `admin`, `teacher`, `parent`
- Verify in **Admin > Staff & Users**

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
- Wait for admin to approve pending enrollments

#### "Can't create assessment"
**Problem:** Assessment creation button disabled
**Solution:**
- Ensure you're assigned to a daycare
- Select at least one student
- Ensure assessment domain exists (Admin creates these)
- Check MySQL connection
- Check that students have "Active" enrollment status

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

#### "Enrollment shows as Pending"
**Problem:** Child's enrollment status is still "Pending" after several days
**Solution:**
- Admin is still reviewing documents
- Contact your daycare directly for status update
- Check email for requests to resubmit documents
- Admin may need additional information
- Follow up after 5 business days if still pending

#### "Can't find child's report"
**Problem:** No assessments visible for child
**Solution:**
- Enrollment must be "Active" (not Pending)
- Teacher must create and complete assessment
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

#### "Can't find assessment history"
**Problem:** Assessment History page is empty
**Solution:**
- Child's enrollment must be "Active"
- Teacher must have completed assessments for child
- Assessments must have status "Completed"
- Wait for notification when teacher completes assessment
- Check multiple times as data updates

#### "Can't link another guardian"
**Problem:** Guardian link request fails
**Solution:**
- Verify guardian email is correct
- Ensure guardian has registered account
- Check email for link acceptance request
- Guardian must click link to accept

#### "How do I report health/dietary concerns?"
**Problem:** Need to communicate allergies or medical conditions
**Solution:**
- Use the **Messages** feature to contact your child's teacher directly
- Provide detailed information about allergies or special needs
- Contact the daycare center by phone for urgent health matters
- This system tracks assessments; health records are managed separately by the daycare

### Admin Issues

#### "Pending enrollments not showing"
**Problem:** Admin sees 0 pending enrollments
**Solution:**
- Parents must submit enrollment requests first
- Refresh page (Ctrl+R)
- Check if all enrollments already approved
- Look for pending documents in Student Management

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

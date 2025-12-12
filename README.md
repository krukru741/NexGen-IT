# NexGen-IT Ticketing System

A comprehensive IT ticketing and service request management system built with React, TypeScript, and Vite.

## 🚀 Features

### 📋 Ticket Management

- **Create Tickets**: Submit IT service requests with categories (Hardware, Software, Network, Other)
- **Track Status**: Monitor ticket progress (Pending, In Progress, Resolved, Closed)
- **Priority Levels**: Set urgency (Low, Medium, High, Critical)
- **Ticket History**: View complete ticket lifecycle and updates
- **Search & Filter**: Find tickets by status, category, priority, or date range
- **Double-click to Print**: Generate printable ticket details

### 👥 User Management

- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full system access, user management, all reports
  - **Technician**: Ticket assignment, status updates, maintenance reports
  - **User**: Create and view own tickets
- **User Profiles**: Manage user information and roles
- **Registration System**: Admin-controlled user registration

### 📊 Reports & Analytics

#### 1. **Tickets Report**

- View all tickets with filtering options
- Export ticket data
- Print individual tickets

#### 2. **Monthly Preventive Maintenance Report**

- **Filter by Month**: Select and add multiple months
- **Month Details Modal**: Double-click month to view detailed ticket breakdown
- **Ticket Management**: Transfer tickets between Excluded/Included lists using checkboxes
- **Print Report**: Generate formatted maintenance report for selected month
- **Persistent Filters**: Selected months saved in localStorage

#### 3. **Quality Objectives Report**

- **Filter by Month**: Select and add multiple months
- **Month Details Modal**: Double-click month to view ticket details
- **Ticket Management**: Transfer tickets between Excluded/Included lists
- **Category-Specific Printing**:
  - **Print All**: Complete report with all tickets
  - **Hardware**: Hardware-only service requests
  - **Software**: Software-only service requests
- **Dynamic Headers**: Report headers change based on category
- **Department Display**: Shows "MIS - HARDWARE" or "MIS - SOFTWARE"
- **Daily Ticket Counts**: Shows actual ticket count per day (not just 0)
- **Weekend Identification**: Automatically marks Saturdays and Sundays
- **Portrait Mode**: Optimized for portrait printing

### 🖨️ Print Features

- **Quality Objectives Monitoring Sheet**:
  - Department and Period information
  - KPI: "100% of hardware/software service requests within the set target date"
  - Day-by-day breakdown (1-31)
  - Actual ticket counts per day
  - Weekend markers (SATURDAY/SUNDAY)
  - Document metadata (Doc Code, Issue Date, Version, Effectivity Date)
- **Maintenance Reports**: Formatted printouts with ticket details
- **Ticket Printouts**: Individual ticket print capability

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Printing**: react-to-print
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Data Persistence**: localStorage for filters and preferences

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd NexGen-IT
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Copy `.env.local.example` to `.env.local`
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## 📁 Project Structure

```
NexGen-IT/
├── components/
│   ├── Dashboard.tsx          # Main dashboard component
│   ├── ReportsPage.tsx        # Reports and analytics
│   ├── QOPrint.tsx           # Quality Objectives print component
│   ├── MaintenancePrint.tsx  # Maintenance report print component
│   ├── TicketPrint.tsx       # Individual ticket print component
│   └── ...
├── services/
│   └── mockDatabase.ts       # Mock database service
├── types/
│   └── index.ts             # TypeScript type definitions
└── ...
```

## 🎯 Usage

### Creating a Ticket

1. Navigate to Dashboard
2. Click "Create Ticket"
3. Fill in ticket details (title, description, category, priority)
4. Submit

### Generating Reports

#### Quality Objectives Report

1. Go to Reports page
2. Select "Quality Objectives Report"
3. Choose month and year
4. Click "Add" to add month to list
5. Double-click month to view details
6. Transfer tickets between Excluded/Included using checkboxes
7. Click print button:
   - **Print All**: All tickets
   - **Hardware**: Hardware tickets only
   - **Software**: Software tickets only

#### Monthly Preventive Maintenance Report

1. Go to Reports page
2. Select "Monthly Preventive Maintenance Report"
3. Choose month and year
4. Click "Add" to add month
5. Double-click month to view and manage tickets
6. Print formatted report

## 🔐 Default Users

The system comes with pre-configured users for testing:

- **Admin**: admin / admin123

## 🎨 Key Features Implemented

### Quality Objectives Enhancements

- ✅ Month filter functionality
- ✅ Double-click month to open modal
- ✅ Checkbox-based ticket transfer system
- ✅ Category-specific printing (Hardware/Software)
- ✅ Dynamic table headers based on category
- ✅ Actual ticket counts per day
- ✅ Weekend identification
- ✅ Portrait print mode
- ✅ Professional monitoring sheet format

### Maintenance Report Features

- ✅ Month filter with localStorage persistence
- ✅ Modal for ticket management
- ✅ Print functionality
- ✅ Ticket grouping and organization

## 📝 License

This project is proprietary software developed for NexGen-IT.

## 🤝 Support

For support and questions, contact the IT department.

---

**Version**: 1.0.0  
**Last Updated**: December 2025

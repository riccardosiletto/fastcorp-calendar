# TaskFlow - FastCorp.ch Project Manager

A modern, professional project and task management tool built for FastCorp.ch. Features a beautiful dark theme with energetic orange accents, drag-and-drop calendar functionality, and comprehensive project tracking.

## 🚀 Features

- **Dashboard View**: Combined overview of projects and calendar in one place
- **Interactive Calendar**: Drag and drop tasks between dates with ease
- **Project Management**: Track multiple projects with progress bars and task lists
- **Timeline View**: Chronological view of all scheduled tasks
- **Task Labels**: Organize tasks with color-coded priority labels
- **Dark Theme**: Premium dark interface with high-contrast orange accents
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: All data is automatically saved to your browser

## 🎨 Design

The application follows a sophisticated dark theme inspired by top-tier project management tools:

- **Background**: Deep black (#0a0a0a) for elegance and premium feel
- **Accent Color**: Energetic orange (#ff6b35) conveying dynamism and action
- **Text**: White (#ffffff) for maximum contrast and readability

## 🛠️ Installation

### Prerequisites

- Node.js 16+ and npm installed on your system

### Setup Instructions

1. **Install Dependencies**

```bash
npm install
```

2. **Start Development Server**

```bash
npm run dev
```

The application will open at `http://localhost:3000`

3. **Build for Production**

```bash
npm run build
```

4. **Preview Production Build**

```bash
npm run preview
```

## 📦 Project Structure

```
fastcorp-taskflow/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── Dashboard.jsx    # Main dashboard view
│   │   ├── CalendarWidget.jsx  # Calendar widget for dashboard
│   │   ├── CalendarView.jsx    # Full-page calendar view
│   │   ├── Projects.jsx     # Projects list view
│   │   └── Timeline.jsx     # Timeline view
│   ├── context/
│   │   └── AppContext.jsx   # Global state management
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles and theme
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 Usage

### Creating Projects

1. Click the "+ Add" button in the "MY PROJECTS" section of the sidebar
2. Projects are automatically created with the sample data
3. Each project can have multiple tasks

### Managing Tasks

1. Click "+ Add Task" within any project card
2. Tasks can be marked as complete using the checkbox
3. Drag tasks from the "Unscheduled Tasks" section to the calendar
4. Move tasks between dates by dragging and dropping

### Navigation

- **Dashboard**: Overview of projects and calendar
- **Calendar**: Full-page interactive calendar
- **Projects**: Detailed view of all projects
- **Timeline**: Chronological task timeline

### Task Labels

- 🔴 **High Priority**: Urgent tasks requiring immediate attention
- 🟡 **In Progress**: Tasks currently being worked on
- 🟢 **Completed**: Finished tasks
- 🔵 **In Review**: Tasks awaiting review

## 🌐 Deployment

### Connecting to a Subdomain

1. Build the production version:

```bash
npm run build
```

2. The `dist` folder contains the production-ready files

3. Upload the contents of `dist` to your web server

4. Configure your subdomain to point to the uploaded directory

### Recommended Hosting Options

- **Vercel**: Connect your Git repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3 + CloudFront**: For enterprise-grade hosting
- **Traditional Web Hosting**: Upload via FTP to your subdomain directory

## 🔧 Configuration

### Customizing Colors

Edit `/src/index.css` to modify the color scheme:

```css
:root {
  --bg-primary: #0a0a0a;
  --accent-orange: #ff6b35;
  /* ... more variables */
}
```

### Adding Initial Projects

Modify `/src/context/AppContext.jsx` to customize the initial projects:

```javascript
const initialProjects = [
  {
    id: 'your-project',
    name: 'Your Project Name',
    emoji: '🚀',
    color: 'var(--project-orange)',
    // ...
  },
]
```

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Support

For questions or support, contact FastCorp.ch

## 📄 License

Proprietary - FastCorp.ch © 2025

---

Built with ❤️ for FastCorp.ch


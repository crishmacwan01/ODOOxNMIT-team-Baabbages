# SynergySphere - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Set Up Supabase Backend

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: "SynergySphere"
   - Set a strong database password
   - Choose a region close to you
   - Click "Create new project"

2. **Get Your Credentials:**
   - Wait for project to be ready (2-3 minutes)
   - Go to Settings > API
   - Copy your Project URL and anon public key

3. **Set Up Database:**
   - Go to SQL Editor in your Supabase dashboard
   - Copy the entire content from `database_setup.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the script

### 2. Configure Frontend

1. **Create Environment File:**
   - Create a `.env` file in the project root
   - Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

### 3. Test Authentication

1. **Open the application** in your browser (usually http://localhost:5173)
2. **Sign up** with a new account or use demo accounts:
   - Manager: `manager@demo.com` / `demo123`
   - Team: `team@demo.com` / `demo123`
3. **Explore features:**
   - Dashboard with project overview
   - Task management
   - Team collaboration
   - AI insights

## 🔧 Advanced Configuration

### Authentication Setup

The app uses Supabase Auth with the following features:
- Email/password authentication
- Role-based access control (Manager/Team)
- Row Level Security (RLS) policies
- Automatic profile creation on signup

### Database Schema

- **profiles**: User profiles with roles and permissions
- **projects**: Project management with team assignments
- **tasks**: Task tracking with priorities and due dates
- **team_messages**: Real-time team communication
- **activity_logs**: Audit trail for all actions
- **notifications**: User notifications system

### Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Managers have additional permissions
- Secure API endpoints with authentication

## 🎯 Features

### For Managers:
- Create and manage projects
- Assign tasks to team members
- View all projects and tasks
- Access advanced analytics
- Manage team members

### For Team Members:
- View assigned projects and tasks
- Update task status and progress
- Participate in team discussions
- Receive notifications
- Track personal productivity

## 🐛 Troubleshooting

### Common Issues:

1. **White Screen:**
   - Check if `.env` file exists and has correct Supabase credentials
   - Verify Supabase project is active
   - Check browser console for errors

2. **Authentication Errors:**
   - Ensure database setup script was run successfully
   - Check if RLS policies are properly configured
   - Verify user roles are set correctly

3. **Database Connection Issues:**
   - Verify Supabase URL and key are correct
   - Check if project is not paused
   - Ensure database tables exist

### Getting Help:

- Check the browser console for error messages
- Verify all environment variables are set
- Ensure Supabase project is properly configured
- Check the database setup script was executed

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) capabilities

## 🔄 Data Flow

1. **User Authentication:**
   - User signs up/in through Supabase Auth
   - Profile automatically created in database
   - RLS policies control data access

2. **Project Management:**
   - Managers create projects
   - Team members are assigned
   - Tasks are created and tracked
   - Progress is updated in real-time

3. **Real-time Updates:**
   - Supabase real-time subscriptions
   - Instant notifications
   - Live collaboration features

## 🚀 Deployment

### Vercel (Recommended):
1. Connect your GitHub repository
2. Add environment variables
3. Deploy automatically

### Netlify:
1. Connect repository
2. Set build command: `npm run build`
3. Add environment variables
4. Deploy

### Manual Deployment:
1. Run `npm run build`
2. Upload `dist` folder to your hosting provider
3. Configure environment variables

## 📊 Analytics & Monitoring

- Built-in activity logging
- User engagement tracking
- Performance monitoring
- Error reporting

## 🔐 Security Best Practices

- All data encrypted in transit and at rest
- Regular security updates
- Secure authentication flow
- Data privacy compliance
- Audit trail for all actions

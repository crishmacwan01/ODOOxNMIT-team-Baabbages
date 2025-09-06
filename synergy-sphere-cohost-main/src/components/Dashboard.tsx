import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/components/Auth/AuthProvider";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import ProjectDialog from "./ProjectDialog";
import BackendSetupDialog from "./BackendSetupDialog";
import { isSupabaseConfigured } from "@/lib/supabase";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Target,
  Zap,
  Plus,
  Database,
  Wifi,
  WifiOff,
  Settings
} from "lucide-react";

const Dashboard = () => {
  const { user, isManager } = useAuthContext();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();

  const stats = {
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    urgentTasks: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length
  };

  const taskCompletionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-primary rounded-xl p-8 text-primary-foreground">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-3">
            Welcome to SynergySphere
          </h1>
          <p className="text-primary-foreground/90 text-lg mb-6">
            Your advanced team collaboration platform. Streamline projects, enhance productivity, 
            and unlock your team's full potential with AI-powered insights.
          </p>
          <div className="flex flex-wrap gap-3">
            {isManager && (
              <ProjectDialog>
                <Button variant="secondary" className="bg-white/20 text-primary-foreground border-white/20 hover:bg-white/30">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </ProjectDialog>
            )}
            <Button variant="outline" className="border-white/20 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Invite Team
            </Button>
          </div>
        </div>
      </div>

      {/* Backend Status Card */}
      <Card className="p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-success' : 'bg-warning'}`}></div>
            <div>
              <h3 className="font-semibold flex items-center">
                {isSupabaseConfigured ? (
                  <>
                    <Wifi className="w-4 h-4 mr-2 text-success" />
                    Backend Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 mr-2 text-warning" />
                    Demo Mode
                  </>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSupabaseConfigured 
                  ? 'Connected to Supabase backend with real-time data sync'
                  : 'Running in demo mode. Configure Supabase for full functionality.'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isSupabaseConfigured ? 'default' : 'secondary'}>
              {isSupabaseConfigured ? 'Live' : 'Demo'}
            </Badge>
            {!isSupabaseConfigured && (
              <BackendSetupDialog>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Backend
                </Button>
              </BackendSetupDialog>
            )}
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 shadow-card hover:shadow-accent transition-smooth">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Active Projects</p>
              <p className="text-2xl font-bold">{projectsLoading ? "..." : stats.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-success text-sm flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {projects.length} total projects
            </span>
          </div>
        </Card>

        <Card className="p-6 shadow-card hover:shadow-accent transition-smooth">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Tasks</p>
              <p className="text-2xl font-bold">{tasksLoading ? "..." : stats.totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-success text-sm">
              {stats.completedTasks} completed
            </span>
          </div>
        </Card>

        <Card className="p-6 shadow-card hover:shadow-accent transition-smooth">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Tasks Completed</p>
              <p className="text-2xl font-bold">{taskCompletionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={taskCompletionRate} className="h-2" />
          </div>
        </Card>

        <Card className="p-6 shadow-card hover:shadow-accent transition-smooth">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Urgent Tasks</p>
              <p className="text-2xl font-bold">{tasksLoading ? "..." : stats.urgentTasks}</p>
            </div>
            <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-warning text-sm">
              Requires attention
            </span>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Projects</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {projectsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects yet</p>
                {isManager && (
                  <ProjectDialog>
                    <Button variant="outline" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </ProjectDialog>
                )}
              </div>
            ) : (
              projects.slice(0, 4).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
                  <div className="flex-1">
                    <h4 className="font-medium">{project.title}</h4>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    <div className="mt-2">
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge 
                      variant="secondary" 
                      className={
                        project.status === 'active' ? 'bg-primary/20 text-primary' :
                        project.status === 'review' ? 'bg-warning/20 text-warning' :
                        project.status === 'completed' ? 'bg-success/20 text-success' :
                        'bg-muted/20 text-muted-foreground'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {isManager ? (
                <ProjectDialog>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="w-4 h-4 mr-3" />
                    Create New Project
                  </Button>
                </ProjectDialog>
              ) : (
                <Button className="w-full justify-start" variant="outline" disabled>
                  <Target className="w-4 h-4 mr-3" />
                  Create New Project
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-3" />
                Schedule Meeting
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="w-4 h-4 mr-3" />
                Team Discussion
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="w-4 h-4 mr-3" />
                Invite Members
              </Button>
            </div>
          </Card>

          {/* Urgent Tasks */}
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
              Urgent Tasks
            </h3>
            <div className="space-y-3">
              {tasksLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                tasks
                  .filter(task => task.status !== 'done' && (task.priority === 'urgent' || task.priority === 'high'))
                  .slice(0, 3)
                  .map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                        </p>
                      </div>
                      {task.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                      {task.priority === 'high' && (
                        <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">
                          High
                        </Badge>
                      )}
                    </div>
                  ))
              )}
              {!tasksLoading && tasks.filter(task => task.priority === 'urgent' || task.priority === 'high').length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 mx-auto text-success mb-2" />
                  <p className="text-sm text-muted-foreground">No urgent tasks!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
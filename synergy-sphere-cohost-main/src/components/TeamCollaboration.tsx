import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeamManagement from "./TeamManagement";
import { 
  MessageSquare, 
  Video, 
  Calendar, 
  FileText, 
  Share2, 
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Settings
} from "lucide-react";

const TeamCollaboration = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="management">Team Management</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Team Communication Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Discussions */}
        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-accent" />
              Active Discussions
            </h3>
            <Button variant="accent" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Thread
            </Button>
          </div>
          
          <div className="space-y-4">
            {[
              {
                title: "Website Redesign Feedback",
                lastMessage: "Sarah: The new homepage looks amazing! Just a few minor tweaks needed...",
                participants: 8,
                unread: 3,
                time: "2 min ago",
                status: "active"
              },
              {
                title: "Sprint Planning Q2",
                lastMessage: "Mike: Should we include the mobile optimization tasks?",
                participants: 12,
                unread: 0,
                time: "15 min ago",
                status: "planning"
              },
              {
                title: "Client Requirements Review",
                lastMessage: "Emma: The client wants to add two new features to the scope",
                participants: 5,
                unread: 7,
                time: "1 hour ago",
                status: "urgent"
              }
            ].map((discussion, i) => (
              <div key={i} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-foreground">{discussion.title}</h4>
                  <div className="flex items-center space-x-2">
                    {discussion.unread > 0 && (
                      <Badge className="bg-accent text-accent-foreground text-xs">
                        {discussion.unread}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{discussion.time}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{discussion.lastMessage}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{discussion.participants} members</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={
                      discussion.status === 'urgent' ? 'bg-destructive/20 text-destructive' :
                      discussion.status === 'active' ? 'bg-success/20 text-success' :
                      'bg-accent/20 text-accent'
                    }
                  >
                    {discussion.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Status */}
        <Card className="p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-primary" />
            Team Status
          </h3>
          
          <div className="space-y-4">
            {[
              { name: "Sarah Chen", role: "UX Designer", status: "Available", avatar: "SC", online: true },
              { name: "Mike Johnson", role: "Developer", status: "In Meeting", avatar: "MJ", online: true },
              { name: "Emma Wilson", role: "PM", status: "Lunch Break", avatar: "EW", online: false },
              { name: "Alex Rodriguez", role: "Developer", status: "Available", avatar: "AR", online: true },
              { name: "Lisa Park", role: "QA Engineer", status: "Focus Time", avatar: "LP", online: true }
            ].map((member, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 bg-gradient-accent text-accent-foreground">
                    {member.avatar}
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                    member.online ? 'bg-success' : 'bg-muted-foreground'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {member.status}
                </Badge>
              </div>
            ))}
          </div>

          <Button className="w-full mt-6" variant="outline">
            <Video className="w-4 h-4 mr-2" />
            Start Team Meeting
          </Button>
        </Card>
      </div>

      {/* Shared Resources & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shared Files */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <FileText className="w-5 h-5 mr-2 text-success" />
              Shared Resources
            </h3>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {[
              { name: "Project Requirements.pdf", size: "2.4 MB", modified: "2 hours ago", type: "pdf" },
              { name: "Design Mockups.fig", size: "15.7 MB", modified: "Yesterday", type: "design" },
              { name: "Database Schema.sql", size: "842 KB", modified: "3 days ago", type: "code" },
              { name: "Meeting Notes Q2.md", size: "12 KB", modified: "1 week ago", type: "doc" }
            ].map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-smooth cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    file.type === 'pdf' ? 'bg-destructive/20' :
                    file.type === 'design' ? 'bg-accent/20' :
                    file.type === 'code' ? 'bg-primary/20' : 'bg-success/20'
                  }`}>
                    <FileText className={`w-4 h-4 ${
                      file.type === 'pdf' ? 'text-destructive' :
                      file.type === 'design' ? 'text-accent' :
                      file.type === 'code' ? 'text-primary' : 'text-success'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size} • {file.modified}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-warning" />
              Upcoming Events
            </h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {[
              {
                title: "Daily Standup",
                time: "10:00 AM",
                duration: "30 min",
                attendees: 8,
                type: "meeting",
                urgent: false
              },
              {
                title: "Client Presentation",
                time: "2:00 PM",
                duration: "1 hour",
                attendees: 12,
                type: "presentation",
                urgent: true
              },
              {
                title: "Sprint Review",
                time: "4:30 PM",
                duration: "45 min",
                attendees: 6,
                type: "review",
                urgent: false
              },
              {
                title: "Team Social Hour",
                time: "6:00 PM",
                duration: "1 hour",
                attendees: 15,
                type: "social",
                urgent: false
              }
            ].map((event, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-center">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">{event.time}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.urgent && (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.duration} • {event.attendees} attendees
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="secondary"
                  className={
                    event.type === 'meeting' ? 'bg-primary/20 text-primary' :
                    event.type === 'presentation' ? 'bg-accent/20 text-accent' :
                    event.type === 'review' ? 'bg-success/20 text-success' :
                    'bg-warning/20 text-warning'
                  }
                >
                  {event.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="management">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          {/* Real-time Collaboration Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                Live Chat
              </h3>
              <p className="text-muted-foreground mb-4">
                Real-time messaging and collaboration features coming soon.
              </p>
              <Button variant="outline" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            </Card>

            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Video className="w-5 h-5 mr-2 text-success" />
                Video Meetings
              </h3>
              <p className="text-muted-foreground mb-4">
                Integrated video conferencing with screen sharing capabilities.
              </p>
              <Button variant="outline" className="w-full">
                <Video className="w-4 h-4 mr-2" />
                Start Meeting
              </Button>
            </Card>
          </div>

          {/* Shared Workspace */}
          <Card className="p-6 shadow-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-accent" />
              Shared Workspace
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Documents</h4>
                <p className="text-sm text-muted-foreground mb-3">Collaborative document editing</p>
                <Button variant="outline" size="sm">Open Editor</Button>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Whiteboard</h4>
                <p className="text-sm text-muted-foreground mb-3">Visual brainstorming tools</p>
                <Button variant="outline" size="sm">Start Session</Button>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">Code Review</h4>
                <p className="text-sm text-muted-foreground mb-3">Collaborative code review</p>
                <Button variant="outline" size="sm">Review Code</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamCollaboration;
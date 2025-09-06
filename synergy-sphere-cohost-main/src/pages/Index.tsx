import { useState } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import TeamCollaboration from "@/components/TeamCollaboration";
import AIInsights from "@/components/AIInsights";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  Brain, 
  Calendar, 
  BarChart3, 
  MessageSquare,
  Settings,
  FileText
} from "lucide-react";
import heroImage from "@/assets/hero-collaboration.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "collaboration", label: "Team", icon: Users },
    { id: "insights", label: "AI Insights", icon: Brain },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "files", label: "Files", icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "collaboration":
        return <TeamCollaboration />;
      case "insights":
        return <AIInsights />;
      case "calendar":
        return (
          <Card className="p-8 text-center shadow-card">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-semibold mb-2">Calendar Integration</h3>
            <p className="text-muted-foreground">
              Unified calendar with meeting scheduler and global timezone support coming soon.
            </p>
          </Card>
        );
      case "analytics":
        return (
          <Card className="p-8 text-center shadow-card">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Detailed reports and tracking features are being developed.
            </p>
          </Card>
        );
      case "files":
        return (
          <Card className="p-8 text-center shadow-card">
            <FileText className="w-16 h-16 mx-auto mb-4 text-success" />
            <h3 className="text-xl font-semibold mb-2">File Management</h3>
            <p className="text-muted-foreground">
              Contextual search and smart file organization system coming soon.
            </p>
          </Card>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Navigation />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card/50 backdrop-blur-sm border-r border-border min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8 space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground px-2">Quick Actions</h4>
            <Button variant="accent" size="sm" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              New Discussion
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Invite Team
            </Button>
          </div>

          {/* Platform Preview */}
          <div className="mt-8">
            <Card className="p-4 bg-gradient-primary text-primary-foreground">
              <img 
                src={heroImage} 
                alt="Team collaboration" 
                className="w-full h-24 object-cover rounded-md mb-3 opacity-90"
              />
              <h4 className="font-semibold text-sm mb-1">SynergySphere</h4>
              <p className="text-xs text-primary-foreground/80 mb-3">
                Advanced team collaboration platform with AI-powered insights
              </p>
              <Button variant="secondary" size="sm" className="w-full bg-white/20 text-primary-foreground border-white/20 hover:bg-white/30">
                <Settings className="w-3 h-3 mr-2" />
                Settings
              </Button>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;

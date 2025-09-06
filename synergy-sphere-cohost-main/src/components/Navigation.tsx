import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/components/Auth/AuthProvider";
import { Bell, Search, Settings, User, Menu, LogOut } from "lucide-react";

const Navigation = () => {
  const { user, signOut, isManager } = useAuthContext();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SynergySphere
            </h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects, tasks, or team members..."
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 transition-smooth"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-accent text-accent-foreground text-xs">
                3
              </Badge>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.profile?.full_name || user?.email}</p>
                <Badge variant={isManager ? "default" : "secondary"} className="text-xs">
                  {isManager ? "Manager" : "Team"}
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
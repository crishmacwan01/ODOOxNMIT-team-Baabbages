import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Clock, 
  Users,
  BarChart3,
  Lightbulb,
  Zap,
  ArrowRight
} from "lucide-react";

const AIInsights = () => {
  return (
    <div className="space-y-6">
      {/* AI Overview */}
      <Card className="p-8 bg-gradient-accent text-accent-foreground shadow-accent">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
            <p className="text-accent-foreground/90">
              Smart analytics and recommendations to optimize your team's performance
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-accent-foreground/80">Productivity Score</p>
            <p className="text-2xl font-bold">92%</p>
            <p className="text-xs text-accent-foreground/70 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8% this week
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-accent-foreground/80">Bottlenecks Detected</p>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-accent-foreground/70">2 resolved today</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-accent-foreground/80">Predictions Made</p>
            <p className="text-2xl font-bold">24</p>
            <p className="text-xs text-accent-foreground/70">89% accuracy</p>
          </div>
        </div>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Recommendations */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-warning" />
              Smart Recommendations
            </h3>
            <Badge className="bg-warning/20 text-warning">3 New</Badge>
          </div>
          
          <div className="space-y-4">
            {[
              {
                title: "Optimize Sprint Planning",
                description: "Based on team velocity, consider reducing story points by 15% for next sprint",
                impact: "High",
                confidence: 94,
                action: "Adjust Sprint"
              },
              {
                title: "Resource Reallocation",
                description: "Sarah's design tasks are blocking development. Consider parallel workflows",
                impact: "Medium",
                confidence: 87,
                action: "Reassign Tasks"
              },
              {
                title: "Meeting Efficiency",
                description: "Daily standups averaging 45 minutes. Recommend time-boxing to 15 minutes",
                impact: "Medium",
                confidence: 91,
                action: "Update Process"
              }
            ].map((rec, i) => (
              <div key={i} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <Badge 
                    variant="secondary"
                    className={
                      rec.impact === 'High' ? 'bg-destructive/20 text-destructive' :
                      'bg-warning/20 text-warning'
                    }
                  >
                    {rec.impact} Impact
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="flex items-center space-x-1">
                      <Progress value={rec.confidence} className="w-16 h-1" />
                      <span className="text-xs font-medium">{rec.confidence}%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    {rec.action}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Analytics */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" />
              Performance Analytics
            </h3>
            <Button variant="outline" size="sm">View Details</Button>
          </div>
          
          <div className="space-y-6">
            {/* Team Velocity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Team Velocity</span>
                <span className="text-sm text-success">↗ +12%</span>
              </div>
              <Progress value={78} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">78 story points (avg: 65)</p>
            </div>

            {/* Task Completion Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Task Completion</span>
                <span className="text-sm text-success">↗ +5%</span>
              </div>
              <Progress value={92} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">92% on-time completion</p>
            </div>

            {/* Collaboration Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Collaboration Score</span>
                <span className="text-sm text-warning">→ 0%</span>
              </div>
              <Progress value={85} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">Based on communication patterns</p>
            </div>

            {/* Code Quality */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Code Quality</span>
                <span className="text-sm text-success">↗ +8%</span>
              </div>
              <Progress value={88} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">Based on reviews and testing</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold">Sprint Prediction</h4>
              <p className="text-xs text-muted-foreground">Next sprint outlook</p>
            </div>
          </div>
          <p className="text-sm mb-3">
            Current sprint likely to complete <span className="font-semibold text-success">2 days early</span> based on team velocity
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Zap className="w-4 h-4 mr-2" />
            Optimize Sprint
          </Button>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h4 className="font-semibold">Risk Detection</h4>
              <p className="text-xs text-muted-foreground">Potential blockers</p>
            </div>
          </div>
          <p className="text-sm mb-3">
            <span className="font-semibold text-warning">Medium risk</span> of delay in mobile development due to API dependencies
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Clock className="w-4 h-4 mr-2" />
            View Mitigation
          </Button>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <h4 className="font-semibold">Resource Optimization</h4>
              <p className="text-xs text-muted-foreground">Team capacity</p>
            </div>
          </div>
          <p className="text-sm mb-3">
            Team capacity at <span className="font-semibold text-success">optimal level</span>. Consider taking on additional project
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            Expand Capacity
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AIInsights;
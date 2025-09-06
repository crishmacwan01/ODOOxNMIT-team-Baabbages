import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuthContext } from './AuthProvider'
import { Users, User, Eye, EyeOff } from 'lucide-react'

const LoginForm = () => {
  const { signIn, signUp, loading } = useAuthContext()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'team' as 'team' | 'manager'
  })

  const handleSubmit = async (isSignUp: boolean) => {
    try {
      console.log('Starting authentication:', { isSignUp, email: formData.email })
      
      if (isSignUp) {
        const result = await signUp(formData.email, formData.password, formData.fullName, formData.role)
        console.log('Sign up result:', result)
        if (result.data) {
          console.log('Sign up successful')
        }
      } else {
        const result = await signIn(formData.email, formData.password)
        console.log('Sign in result:', result)
        if (result.data) {
          console.log('Sign in successful')
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SynergySphere
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced team collaboration platform
          </p>
        </div>

        <Card className="p-6 shadow-card">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleSubmit(false)}
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={formData.role === 'team' ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'team' }))}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm">Team Member</span>
                    <Badge variant="secondary" className="text-xs">
                      Standard Access
                    </Badge>
                  </Button>
                  <Button
                    type="button"
                    variant={formData.role === 'manager' ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'manager' }))}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm">Manager</span>
                    <Badge variant="secondary" className="text-xs">
                      Full Access
                    </Badge>
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => handleSubmit(true)}
                disabled={loading || !formData.email || !formData.password || !formData.fullName}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </TabsContent>
          </Tabs>

        </Card>
      </div>
    </div>
  )
}

export default LoginForm
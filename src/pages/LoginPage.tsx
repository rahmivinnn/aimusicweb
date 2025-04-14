import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';

const LoginPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { updateUser } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (isSignUp) {
      if (!fullName) {
        toast({
          title: "Missing name",
          description: "Please enter your full name",
          variant: "destructive"
        });
        return;
      }
      
      if (password !== confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure your passwords match",
          variant: "destructive"
        });
        return;
      }
      
      if (!agreedToTerms) {
        toast({
          title: "Terms & Conditions",
          description: "You must agree to the terms and conditions",
          variant: "destructive"
        });
        return;
      }

      // Store new user info temporarily
      localStorage.setItem('newUser', JSON.stringify({
        email,
        name: fullName,
      }));

      // Show success message and redirect to login
      toast({
        title: "Account created!",
        description: "Your account has been created successfully. Please login to continue.",
      });

      // Reset form and switch to login
      setIsSignUp(false);
      setEmail('');
      setPassword('');
      return;
    }
    
    // Handle login
    const userData = {
      email,
      name: email.split('@')[0],
      isLoggedIn: true,
      profileImage: "/lovable-uploads/0e06c333-6b0e-406d-8d9b-38daa4948267.png",
      subscriptionType: 'free' as const,
      subscriptionActive: true
    };

    // Update user context
    updateUser(userData);
    
    // Tampilkan pesan sukses
    toast({
      title: "Welcome back!",
      description: "You've been logged in successfully",
    });
    
    // Redirect ke dashboard
    navigate('/dashboard', { replace: true });
  };
  
  const handleForgotPassword = () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password reset email sent",
      description: "Check your inbox for password reset instructions",
    });
  };
  
  const handleGoogleLogin = () => {
    // If in signup mode, show error
    if (isSignUp) {
      toast({
        title: "Not available",
        description: "Google sign up is not available at the moment. Please use email registration.",
        variant: "destructive"
      });
      return;
    }

    const userData = {
      email: "user@gmail.com",
      name: "Google User",
      isLoggedIn: true,
      profileImage: "/lovable-uploads/0e06c333-6b0e-406d-8d9b-38daa4948267.png",
      subscriptionType: 'free' as const,
      subscriptionActive: true
    };

    // Update user context
    updateUser(userData);
    
    // Tampilkan pesan sukses
    toast({
      title: "Welcome back!",
      description: "You've been logged in successfully with Google",
    });
    
    // Redirect ke dashboard
    navigate('/dashboard', { replace: true });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Left Side - Form */}
      <motion.div 
        className="md:w-1/2 flex flex-col justify-center items-center p-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="w-full max-w-md space-y-8"
          variants={containerVariants}
        >
          <motion.div 
            className="flex justify-center mb-8"
            variants={itemVariants}
          >
            <img 
              src="/lovable-uploads/bcc7d218-d69c-4ecb-802d-35cdd21003d8.png" 
              alt="Pink Floyd Logo" 
              className="w-32 h-auto"
            />
          </motion.div>
          
          <motion.h2 
            className="text-4xl font-bold text-white text-center mb-2"
            variants={itemVariants}
          >
            {isSignUp ? "Get Started" : "Welcome Back"}
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-center mb-8"
            variants={itemVariants}
          >
            {isSignUp 
              ? "Log in to create and remix music with AI-powered tools." 
              : "Log in to continue your music creation journey."
            }
          </motion.p>
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            variants={containerVariants}
          >
            {isSignUp && (
              <motion.div variants={itemVariants}>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Shah Hussain"
                  className="bg-[#1A1A1A] border-[#333] text-white"
                />
              </motion.div>
            )}
            
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="bg-[#1A1A1A] border-[#333] text-white"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-[#1A1A1A] border-[#333] text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>
            
            {isSignUp && (
              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Password"
                    className="bg-[#1A1A1A] border-[#333] text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>
            )}
            
            {!isSignUp ? (
              <motion.div 
                className="flex items-center justify-between"
                variants={itemVariants}
              >
                <div className="flex items-center">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="h-4 w-4 text-studio-neon border-gray-600 rounded focus:ring-studio-neon"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-studio-neon hover:text-studio-neon/80"
                >
                  Forgot password?
                </button>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center"
                variants={itemVariants}
              >
                <Checkbox 
                  id="agree-terms" 
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="h-4 w-4 text-studio-neon border-gray-600 rounded focus:ring-studio-neon"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-300">
                  I agree to the terms & conditions
                </label>
              </motion.div>
            )}
            
            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full py-3 bg-studio-neon hover:bg-studio-neon/90 text-black font-medium"
              >
                {isSignUp ? "Sign up" : "Log in"}
              </Button>
            </motion.div>
            
            <motion.div 
              className="relative my-6"
              variants={itemVariants}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-gray-400">Or continue with</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full border-gray-700 text-white hover:bg-gray-800 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="#EA4335" d="M5.266 9.765C6.125 7.156 8.312 5.188 11 5.188c1.594 0 3.031.656 4.172 1.703l3.422-3.422C16.719 1.656 14 .688 11 .688c-4.797 0-8.891 3.094-10.266 7.437l4.532 1.641z"/>
                  <path fill="#FBBC05" d="M5.266 14.234l-4.532 1.641C1.75 20.218 5.844 23.312 11 23.312c2.719 0 5.188-.84 7.031-2.281l-3.484-2.938c-1.141.656-2.453.938-3.547.938-2.688 0-4.875-1.969-5.734-4.797z"/>
                  <path fill="#4285F4" d="M20.812 11c0-.75-.062-1.5-.188-2.25H11v4.375h5.5c-.219 1.234-.906 2.297-1.953 3.016l3.484 2.938C19.484 17.313 20.813 14.5 20.813 11z"/>
                  <path fill="#34A853" d="M11 23.313c2.719 0 5.188-.84 7.031-2.281l-3.484-2.938c-1.141.656-2.453.938-3.547.938-2.688 0-4.875-1.969-5.734-4.797l-4.532 1.641C1.75 20.218 5.844 23.312 11 23.312z"/>
                </svg>
                Sign {isSignUp ? "up" : "in"} with Google
              </Button>
            </motion.div>
          </motion.form>
          
          <motion.p 
            className="mt-6 text-center text-sm text-gray-400"
            variants={itemVariants}
          >
            {isSignUp 
              ? "Already have an account? " 
              : "Don't have an account? "
            }
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-studio-neon hover:text-studio-neon/80"
            >
              {isSignUp ? "Login instead" : "Sign up"}
            </button>
          </motion.p>
        </motion.div>
      </motion.div>
      
      {/* Right Side - Image */}
      <motion.div 
        className="hidden md:block md:w-1/2 bg-gradient-to-br from-gray-900 to-black p-6"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <motion.div 
          className="h-full w-full rounded-xl overflow-hidden shadow-xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src="/lovable-uploads/7afe7abe-5fe9-4912-8e18-68b88a9618c3.png" 
            alt="AI Music Creation" 
            className="w-full h-full object-cover rounded-xl"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

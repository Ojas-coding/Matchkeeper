
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Clock, User, LogOut, Megaphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MainNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center mr-8">
          <Trophy className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-xl">MatchKeeper</span>
        </Link>
        {user && (
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              to="/events"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Events
            </Link>
            <Link
              to="/matches"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Matches
            </Link>
            <Link
              to="/announcements"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Announcements
            </Link>
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Admin
              </Link>
            )}
          </nav>
        )}
        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center mr-2">
                <User className="h-4 w-4 mr-1" />
                <span className="text-sm">{user.name}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={handleLogin}
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MainNav;

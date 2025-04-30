import { useLocation } from "wouter";
import { 
  PieChartIcon, 
  SearchIcon,
  BellIcon,
  MenuIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem = ({ href, icon, label, active }: NavItemProps) => (
  <li>
    <Link href={href} className={cn(
      "flex items-center p-2 rounded-md font-medium",
      active 
        ? "text-primary bg-primary/10" 
        : "text-muted-foreground hover:bg-muted"
    )}>
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  </li>
);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white shadow-md z-20 transition-transform",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold text-primary">Meeting Analyzer</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <NavItem 
              href="/" 
              icon={<PieChartIcon className="w-5 h-5" />} 
              label="Dashboard" 
              active={location === "/"} 
            />
          </ul>
        </nav>
      </aside>
      
      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content */}
      <div className="lg:pl-64 flex-1">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
          
          <div className="flex items-center ml-auto space-x-4">
            <div className="relative hidden md:block">
              <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-9 w-64"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="rounded-full">
              <BellIcon className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                JD
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

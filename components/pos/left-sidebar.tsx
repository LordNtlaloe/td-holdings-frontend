'use client';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NavItem } from "@/types/pos";
import { Home, ClipboardList, BarChart3, Users, Building2, Settings } from "lucide-react";

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", active: false },
  { icon: ClipboardList, label: "Sales", active: true },
  { icon: BarChart3, label: "Reports", active: false },
  { icon: Users, label: "Customers", active: false },
  { icon: Building2, label: "Stores", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export const POSLeftSidebar = () => {
  return (
    <aside className="w-18 bg-card border-r border-border flex flex-col items-center py-6 space-y-4">
      <Avatar className="w-10 h-10 bg-primary mb-4">
        <AvatarFallback className="bg-primary text-primary-foreground">AG</AvatarFallback>
      </Avatar>
      <nav className="flex-1 flex flex-col space-y-2 w-full">
        {navItems.map((item, index) => (
          <Button
            key={index}
            variant={item.active ? "default" : "ghost"}
            size="icon"
            className={`w-full h-14 rounded-none ${
              item.active 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
          </Button>
        ))}
      </nav>
      <Button variant="ghost" size="icon" className="w-full h-14 text-muted-foreground hover:text-foreground rounded-none">
        <Settings className="w-5 h-5" />
      </Button>
    </aside>
  );
};
import {
  LayoutDashboard,
  Newspaper,
  Image,
  Video,
  Calendar,
  Users,
  User,
  Heart,
  MessageSquare,
  UserPlus,
  LogOut,
  LogIn,
  Sun,
  Moon,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  news: Newspaper,
  images: Image,
  videos: Video,
  events: Calendar,
  leaders: Users,
  users: User,
  donations: Heart,
  queries: MessageSquare,
  "join-requests": UserPlus,
  logout: LogOut,
  login: LogIn,
  sun: Sun,
  moon: Moon,
};

// Export individual icons for direct import
export { Sun as SunIcon, Moon as MoonIcon };

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  className = "w-6 h-6",
  size = 24,
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    return null;
  }

  return <IconComponent className={className} size={size} />;
};

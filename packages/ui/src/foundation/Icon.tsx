"use client";

import { Icon as ChakraIcon, type IconProps as ChakraIconProps } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";

export interface IconProps extends Omit<ChakraIconProps, "as"> {
  /** The Lucide icon component to render */
  icon: LucideIcon;
  /** Size of the icon in pixels or as a Chakra size token */
  size?: number | string;
  /** Color of the icon */
  color?: string;
}

/**
 * Icon component wraps Lucide icons with Chakra UI styling.
 * Use this for consistent icon rendering across the application.
 */
export function Icon({ icon: LucideIconComponent, size = 20, color, ...props }: IconProps) {
  return (
    <ChakraIcon
      as={LucideIconComponent}
      boxSize={typeof size === "number" ? `${size}px` : size}
      color={color}
      {...props}
    />
  );
}

Icon.displayName = "Icon";

// Re-export commonly used icons for convenience
export {
  Home,
  Users,
  Calendar,
  Clock,
  Car,
  CreditCard,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  FileText,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  MoreVertical,
  LogOut,
  User,
  UserPlus,
  CalendarDays,
  CalendarClock,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Copy,
  Sun,
  Moon,
  Loader2,
} from "lucide-react";

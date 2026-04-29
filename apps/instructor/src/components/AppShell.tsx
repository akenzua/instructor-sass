"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu as MenuIcon,
  Clock,
  BookOpen,
  Package,
  ClipboardList,
  Building2,
  Car,
  UserCog,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { NotificationBell } from "./NotificationBell";

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
}

// Base nav items every instructor sees
const coreNavItems: NavItem[] = [
  { label: "Dashboard", icon: <Home size={20} />, href: "/" },
  { label: "Calendar", icon: <Calendar size={20} />, href: "/calendar" },
  { label: "Lessons", icon: <BookOpen size={20} />, href: "/lessons" },
  { label: "Learners", icon: <Users size={20} />, href: "/learners" },
  { label: "Availability", icon: <Clock size={20} />, href: "/availability" },
  { label: "Settings", icon: <Settings size={20} />, href: "/settings" },
];

// Solo instructors also see these (school instructors inherit from school)
const soloOnlyNavItems: NavItem[] = [
  { label: "Syllabus", icon: <ClipboardList size={20} />, href: "/syllabus" },
  { label: "Packages", icon: <Package size={20} />, href: "/packages" },
];

// School admin section (owner/admin only)
const schoolAdminNavItems: NavItem[] = [
  { label: "School Dashboard", icon: <LayoutDashboard size={20} />, href: "/school/dashboard" },
  { label: "Instructors", icon: <UserCog size={20} />, href: "/school/team" },
  { label: "Fleet", icon: <Car size={20} />, href: "/school/fleet" },
  { label: "School Syllabus", icon: <ClipboardList size={20} />, href: "/school/syllabus" },
  { label: "School Packages", icon: <Package size={20} />, href: "/school/packages" },
  { label: "Policies", icon: <Shield size={20} />, href: "/school/policies" },
  { label: "School Settings", icon: <Building2 size={20} />, href: "/school" },
];

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { instructor, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  const bgSidebar = useColorModeValue("white", "gray.800");
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const isSchoolMember = !!(instructor as any)?.schoolId;
  const isSchoolAdmin = isSchoolMember && ["owner", "admin"].includes((instructor as any)?.role);
  const isTeaching = !!(instructor as any)?.isTeaching;

  // Build nav based on persona:
  // - Owner/Admin NOT teaching → school admin nav only
  // - Owner/Admin + teaching → school admin nav + core instructor nav + read-only syllabus/packages
  // - Regular school instructor → core nav + read-only syllabus/packages
  // - Solo instructor → core + solo-only nav (full CRUD)
  let instructorNavItems: NavItem[];
  if (isSchoolAdmin && !isTeaching) {
    // Admin-only persona: no instructor nav at all
    instructorNavItems = [];
  } else if (isSchoolMember) {
    // School instructors see core nav + read-only syllabus/packages
    instructorNavItems = [...coreNavItems.slice(0, -1), ...soloOnlyNavItems, coreNavItems[coreNavItems.length - 1]];
  } else {
    instructorNavItems = [...coreNavItems.slice(0, -1), ...soloOnlyNavItems, coreNavItems[coreNavItems.length - 1]];
  }

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        as="nav"
        w="240px"
        bg={bgSidebar}
        borderRight="1px solid"
        borderColor={borderColor}
        py={4}
        display={{ base: "none", md: "block" }}
      >
        <VStack h="full" justify="space-between">
          {/* Logo / Brand */}
          <VStack spacing={8} w="full">
            <HStack px={4} py={2} justify="space-between" w="full">
              <Text fontSize="xl" fontWeight="bold" color="primary.500">
                {isSchoolAdmin && !isTeaching ? "School Admin" : "Instructor"}
              </Text>
              <NotificationBell />
            </HStack>

            {/* Navigation Items */}
            {instructorNavItems.length > 0 && (
            <VStack spacing={1} w="full" px={2}>
              {instructorNavItems.map((item) => {
                const isActive = item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Box
                    key={item.href}
                    as="button"
                    onClick={() => handleNavigation(item.href)}
                    w="full"
                    px={4}
                    py={3}
                    borderRadius="md"
                    bg={isActive ? "primary.50" : "transparent"}
                    color={isActive ? "primary.600" : "text.default"}
                    _hover={{
                      bg: isActive ? "primary.50" : "gray.100",
                    }}
                    _dark={{
                      bg: isActive ? "primary.900" : "transparent",
                      color: isActive ? "primary.200" : "text.default",
                      _hover: {
                        bg: isActive ? "primary.900" : "gray.700",
                      },
                    }}
                    transition="all 0.2s"
                    textAlign="left"
                  >
                    <HStack spacing={3}>
                      {item.icon}
                      <Text fontWeight={isActive ? "semibold" : "medium"}>
                        {item.label}
                      </Text>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
            )}

            {/* School Admin Section */}
            {isSchoolAdmin && (
              <>
                {instructorNavItems.length > 0 && (
                <Box px={4} pt={4} pb={1}>
                  <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wider">
                    School Admin
                  </Text>
                </Box>
                )}
                <VStack spacing={1} w="full" px={2}>
                  {schoolAdminNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Box
                        key={item.href}
                        as="button"
                        onClick={() => handleNavigation(item.href)}
                        w="full"
                        px={4}
                        py={2.5}
                        borderRadius="md"
                        bg={isActive ? "primary.50" : "transparent"}
                        color={isActive ? "primary.600" : "text.default"}
                        _hover={{ bg: isActive ? "primary.50" : "gray.100" }}
                        _dark={{
                          bg: isActive ? "primary.900" : "transparent",
                          color: isActive ? "primary.200" : "text.default",
                          _hover: { bg: isActive ? "primary.900" : "gray.700" },
                        }}
                        transition="all 0.2s"
                        textAlign="left"
                      >
                        <HStack spacing={3}>
                          {item.icon}
                          <Text fontSize="sm" fontWeight={isActive ? "semibold" : "medium"}>
                            {item.label}
                          </Text>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              </>
            )}
          </VStack>

          {/* Bottom Section */}
          <VStack spacing={2} w="full" px={2}>
            {/* Color Mode Toggle */}
            <Box
              as="button"
              onClick={toggleColorMode}
              w="full"
              px={4}
              py={3}
              borderRadius="md"
              _hover={{ bg: "gray.100" }}
              _dark={{ _hover: { bg: "gray.700" } }}
              textAlign="left"
            >
              <HStack spacing={3}>
                {colorMode === "light" ? <Moon size={20} /> : <Sun size={20} />}
                <Text>{colorMode === "light" ? "Dark Mode" : "Light Mode"}</Text>
              </HStack>
            </Box>

            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Box}
                w="full"
                px={4}
                py={3}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                _dark={{ _hover: { bg: "gray.700" } }}
              >
                <HStack spacing={3}>
                  <Avatar size="sm" name={instructor ? `${instructor.firstName} ${instructor.lastName}` : undefined} />
                  <VStack spacing={0} align="start" flex={1}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {instructor ? `${instructor.firstName} ${instructor.lastName}` : ""}
                    </Text>
                    <Text fontSize="xs" color="text.muted" noOfLines={1}>
                      {instructor?.email}
                    </Text>
                  </VStack>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<Settings size={16} />}>Settings</MenuItem>
                <MenuDivider />
                <MenuItem
                  icon={<LogOut size={16} />}
                  onClick={handleLogout}
                  color="red.500"
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </VStack>
        </VStack>
      </Box>

      {/* Mobile Header */}
      <Box
        display={{ base: "block", md: "none" }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg={bgSidebar}
        borderBottom="1px solid"
        borderColor={borderColor}
        px={4}
        py={3}
        zIndex={10}
      >
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold" color="primary.500">
            {isSchoolAdmin && !isTeaching ? "School Admin" : "Instructor"}
          </Text>
          <HStack spacing={2}>
            <NotificationBell />
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === "light" ? <Moon size={18} /> : <Sun size={18} />}
              variant="ghost"
              size="sm"
              onClick={toggleColorMode}
            />
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Menu"
                icon={<MenuIcon size={18} />}
                variant="ghost"
                size="sm"
              />
              <MenuList>
                {isSchoolAdmin && (
                  <>
                    {schoolAdminNavItems.map((item) => (
                      <MenuItem
                        key={item.href}
                        icon={item.icon as any}
                        onClick={() => handleNavigation(item.href)}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                    {instructorNavItems.length > 0 && <MenuDivider />}
                  </>
                )}
                {instructorNavItems.map((item) => (
                  <MenuItem
                    key={item.href}
                    icon={item.icon as any}
                    onClick={() => handleNavigation(item.href)}
                  >
                    {item.label}
                  </MenuItem>
                ))}
                <MenuDivider />
                <MenuItem
                  icon={<LogOut size={16} />}
                  onClick={handleLogout}
                  color="red.500"
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box
        flex={1}
        bg={bgMain}
        p={{ base: 4, md: 8 }}
        mt={{ base: "60px", md: 0 }}
        overflow="auto"
      >
        {children}
      </Box>
    </Flex>
  );
}

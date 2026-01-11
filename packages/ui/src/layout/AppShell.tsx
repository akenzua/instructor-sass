"use client";

import {
  Box,
  Flex,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Button,
  type BoxProps,
} from "@chakra-ui/react";
import { Menu, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

export interface AppShellProps extends Omit<BoxProps, "children"> {
  /** Logo/brand element */
  logo?: React.ReactNode;
  /** Navigation items for sidebar */
  navItems?: NavItem[];
  /** Currently active href */
  activeHref?: string;
  /** Callback when navigation item is clicked */
  onNavigate?: (href: string) => void;
  /** Content to show on the right side of header */
  headerRight?: React.ReactNode;
  /** Main content area */
  children: React.ReactNode;
  /** Width of the sidebar */
  sidebarWidth?: string | number;
  /** Title shown in mobile drawer header */
  drawerTitle?: string;
}

/**
 * AppShell provides the main layout structure with header, sidebar, and content areas.
 * On mobile, the sidebar becomes a drawer that can be toggled.
 */
export function AppShell({
  logo,
  navItems,
  activeHref,
  onNavigate,
  headerRight,
  children,
  sidebarWidth = "260px",
  drawerTitle = "Menu",
  ...props
}: AppShellProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const hasSidebar = navItems && navItems.length > 0;

  const renderNavItems = () => (
    <VStack align="stretch" spacing={1} p={4}>
      {navItems?.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === activeHref;
        return (
          <Button
            key={item.href}
            leftIcon={<Icon size={18} />}
            variant="ghost"
            justifyContent="flex-start"
            fontWeight={isActive ? "semibold" : "normal"}
            bg={isActive ? "accent.subtle" : "transparent"}
            color={isActive ? "accent.default" : "fg.default"}
            _hover={{ bg: isActive ? "accent.subtle" : "bg.subtle" }}
            onClick={() => {
              onNavigate?.(item.href);
              onClose();
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </VStack>
  );

  return (
    <Box minH="100vh" bg="bg.canvas" {...props}>
      {/* Header */}
      <Box
        as="header"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex="sticky"
        bg="bg.surface"
        borderBottom="1px solid"
        borderColor="border.default"
        h="16"
      >
        <Flex h="full" align="center" px={4} gap={4}>
          {hasSidebar && (
            <IconButton
              display={{ base: "flex", lg: "none" }}
              aria-label="Open menu"
              icon={<Menu size={20} />}
              variant="ghost"
              onClick={onOpen}
            />
          )}
          {logo}
          <Box flex={1} />
          {headerRight}
        </Flex>
      </Box>

      {/* Mobile sidebar drawer */}
      {hasSidebar && (
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent bg="bg.surface">
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">{drawerTitle}</DrawerHeader>
            <DrawerBody p={0}>{renderNavItems()}</DrawerBody>
          </DrawerContent>
        </Drawer>
      )}

      {/* Desktop sidebar */}
      {hasSidebar && (
        <Box
          as="aside"
          display={{ base: "none", lg: "block" }}
          position="fixed"
          left={0}
          top="16"
          bottom={0}
          w={sidebarWidth}
          bg="bg.surface"
          borderRight="1px solid"
          borderColor="border.default"
          overflowY="auto"
        >
          {renderNavItems()}
        </Box>
      )}

      {/* Main content */}
      <Box
        as="main"
        ml={{
          base: 0,
          lg: hasSidebar ? sidebarWidth : 0,
        }}
        pt="16"
        minH="100vh"
        p={6}
      >
        {children}
      </Box>
    </Box>
  );
}

AppShell.displayName = "AppShell";

"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks";
import type { AppNotification } from "@/lib/api";

export function NotificationBell() {
  const router = useRouter();
  const { data: countData } = useUnreadNotificationCount();
  const { data: notifications, isLoading } = useNotifications({ limit: 15 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = countData?.count || 0;

  const handleNotificationClick = (notification: AppNotification) => {
    // Mark as read
    if (!notification.read) {
      markRead.mutate(notification._id);
    }
    // Navigate to the link
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <Popover placement="bottom-end" isLazy>
      <PopoverTrigger>
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Notifications"
            icon={<Bell size={20} />}
            variant="ghost"
            size="sm"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              colorScheme="red"
              borderRadius="full"
              fontSize="2xs"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              variant="solid"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="360px" maxH="460px">
        <PopoverArrow />
        <PopoverHeader>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Text fontWeight="semibold" fontSize="sm">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Badge colorScheme="red" fontSize="2xs">
                  {unreadCount} new
                </Badge>
              )}
            </HStack>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<CheckCheck size={14} />}
                onClick={() => markAllRead.mutate()}
                isLoading={markAllRead.isPending}
              >
                Mark all read
              </Button>
            )}
          </HStack>
        </PopoverHeader>
        <PopoverBody p={0} overflowY="auto" maxH="380px">
          {isLoading ? (
            <Box py={6} textAlign="center">
              <Spinner size="sm" />
            </Box>
          ) : !notifications || notifications.length === 0 ? (
            <Box py={6} textAlign="center">
              <Text fontSize="sm" color="text.muted">
                No notifications yet
              </Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {notifications.map((n) => (
                <Box
                  key={n._id}
                  as="button"
                  textAlign="left"
                  px={4}
                  py={3}
                  bg={n.read ? "transparent" : "blue.50"}
                  _dark={{
                    bg: n.read ? "transparent" : "blue.900",
                  }}
                  _hover={{
                    bg: n.read ? "gray.50" : "blue.100",
                    _dark: { bg: n.read ? "gray.700" : "blue.800" },
                  }}
                  transition="background 0.15s"
                  onClick={() => handleNotificationClick(n)}
                  w="full"
                >
                  <HStack spacing={3} align="start">
                    {!n.read && (
                      <Box
                        w="8px"
                        h="8px"
                        borderRadius="full"
                        bg="blue.500"
                        mt={1.5}
                        flexShrink={0}
                      />
                    )}
                    <Box flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight={n.read ? "normal" : "semibold"}
                        noOfLines={1}
                      >
                        {n.title}
                      </Text>
                      <Text fontSize="xs" color="text.muted" noOfLines={2} mt={0.5}>
                        {n.message}
                      </Text>
                      <Text fontSize="2xs" color="text.muted" mt={1}>
                        {formatDistanceToNow(new Date(n.createdAt), {
                          addSuffix: true,
                        })}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

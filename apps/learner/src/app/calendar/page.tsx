"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useClipboard,
  useToast,
  VStack,
  Alert,
  AlertIcon,
  Divider,
  Badge,
  Skeleton,
} from "@chakra-ui/react";
import { PageHeader } from "@acme/ui";
import { Calendar, CalendarPlus, Copy, Check, RefreshCw, Smartphone } from "lucide-react";
import { useLearnerAuth } from "@/lib/auth";
import { calendarApi } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
import { useLearnerProfile } from "@/hooks";

interface FeedUrls {
  feedToken: string;
  httpUrl: string;
  webcalUrl: string;
  googleCalendarUrl: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const { learner, isLoading: authLoading, isAuthenticated, logout } = useLearnerAuth();
  const { profile } = useLearnerProfile(isAuthenticated);
  const [feedUrls, setFeedUrls] = useState<FeedUrls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { onCopy, hasCopied } = useClipboard(feedUrls?.webcalUrl || "");
  const toast = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }
    if (isAuthenticated) {
      loadFeedUrl();
    }
  }, [authLoading, isAuthenticated]);

  const loadFeedUrl = async () => {
    try {
      setIsLoading(true);
      const data = await calendarApi.getFeedUrl();
      setFeedUrls(data);
    } catch (err) {
      console.error("Failed to load calendar feed URL:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const data = await calendarApi.regenerateToken();
      setFeedUrls(data);
      toast({
        title: "Calendar URL regenerated",
        description: "Your old calendar subscription URL will no longer work. Re-subscribe with the new URL.",
        status: "success",
        duration: 5000,
      });
    } catch (err) {
      toast({
        title: "Failed to regenerate",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSubscribeApple = () => {
    if (feedUrls?.webcalUrl) {
      window.location.href = feedUrls.webcalUrl;
    }
  };

  const handleSubscribeGoogle = () => {
    if (feedUrls?.googleCalendarUrl) {
      window.open(feedUrls.googleCalendarUrl, "_blank");
    }
  };

  const handleSubscribeOutlook = () => {
    if (feedUrls?.httpUrl) {
      const outlookUrl = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feedUrls.httpUrl)}&name=${encodeURIComponent("My Driving Lessons")}`;
      window.open(outlookUrl, "_blank");
    }
  };

  const handleCopy = () => {
    onCopy();
    toast({
      title: "URL copied",
      description: "Paste this into any calendar app that supports URL subscriptions.",
      status: "info",
      duration: 3000,
    });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <Box minH="100vh" bg="bg.subtle" p={8}>
        <Skeleton height="400px" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="bg.subtle">
      <AppHeader profile={profile} learner={learner} onLogout={logout} />

      <Box maxW="container.md" mx="auto" p={6}>
        <VStack spacing={6} align="stretch">
          <PageHeader
            title="Calendar Sync"
            description="Subscribe to your driving lessons calendar so they appear automatically in your phone or computer calendar"
          />

          {/* How it works */}
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">
              When you subscribe, your lessons will automatically appear and stay
              up-to-date in your calendar app. Any new bookings, cancellations, or
              reschedules will sync automatically.
            </Text>
          </Alert>

          {/* Quick subscribe buttons */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="sm">Subscribe to Calendar</Heading>
                <Text fontSize="sm" color="text.muted">
                  Choose your calendar app to subscribe:
                </Text>

                {isLoading ? (
                  <VStack spacing={3}>
                    <Skeleton height="40px" w="full" />
                    <Skeleton height="40px" w="full" />
                    <Skeleton height="40px" w="full" />
                  </VStack>
                ) : (
                  <VStack spacing={3} align="stretch">
                    <Button
                      w="full"
                      colorScheme="primary"
                      leftIcon={<Smartphone size={18} />}
                      onClick={handleSubscribeApple}
                    >
                      Apple Calendar / iPhone
                    </Button>

                    <Button
                      w="full"
                      variant="outline"
                      leftIcon={<CalendarPlus size={18} />}
                      onClick={handleSubscribeGoogle}
                    >
                      Google Calendar
                    </Button>

                    <Button
                      w="full"
                      variant="outline"
                      leftIcon={<Calendar size={18} />}
                      onClick={handleSubscribeOutlook}
                    >
                      Outlook Calendar
                    </Button>
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Manual URL for other apps */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="sm">Manual Setup</Heading>
                <Text fontSize="sm" color="text.muted">
                  For other calendar apps, copy this URL and add it as a &quot;URL
                  subscription&quot; or &quot;calendar from URL&quot;:
                </Text>

                {isLoading ? (
                  <Skeleton height="40px" />
                ) : (
                  <InputGroup>
                    <Input
                      value={feedUrls?.webcalUrl || ""}
                      isReadOnly
                      fontSize="sm"
                      pr="3rem"
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Copy URL"
                        icon={hasCopied ? <Check size={16} /> : <Copy size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={handleCopy}
                      />
                    </InputRightElement>
                  </InputGroup>
                )}

                <Divider />

                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">
                      Regenerate URL
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      If you shared your URL by mistake, regenerate it to invalidate
                      the old one
                    </Text>
                  </VStack>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    leftIcon={<RefreshCw size={14} />}
                    onClick={handleRegenerate}
                    isLoading={isRegenerating}
                  >
                    Regenerate
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* What's included */}
          <Card>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Heading size="sm">What&apos;s Included</Heading>
                <HStack>
                  <Badge colorScheme="green">Auto-sync</Badge>
                  <Text fontSize="sm">All scheduled and upcoming lessons</Text>
                </HStack>
                <HStack>
                  <Badge colorScheme="blue">Reminders</Badge>
                  <Text fontSize="sm">
                    1-hour and 24-hour reminders before each lesson
                  </Text>
                </HStack>
                {learner?.testDate && (
                  <HStack>
                    <Badge colorScheme="orange">Test Date</Badge>
                    <Text fontSize="sm">
                      Your driving test date with 1-week and 1-day reminders
                    </Text>
                  </HStack>
                )}
                <HStack>
                  <Badge colorScheme="purple">Details</Badge>
                  <Text fontSize="sm">
                    Instructor name, lesson type, pickup location, and notes
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Individual downloads */}
          {learner?.testDate && (
            <Card>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Heading size="sm">Quick Downloads</Heading>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<CalendarPlus size={16} />}
                    onClick={() => calendarApi.downloadTestDateIcs()}
                  >
                    Download Test Date (.ics)
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Box>
    </Box>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Button,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { Share2, Copy, Facebook, Twitter, MessageCircle, Mail } from "lucide-react";

interface ShareButtonProps {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const toast = useToast();
  const { onCopy } = useClipboard(url);
  const [canShare, setCanShare] = useState(false);

  // Check Web Share API availability only on client
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopyLink = () => {
    onCopy();
    toast({
      title: "Link copied!",
      description: "Share it anywhere",
      status: "success",
      duration: 2000,
    });
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this driving instructor: ${url}`)}`,
  };

  const handleNativeShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="solid"
        bg="whiteAlpha.200"
        color="white"
        leftIcon={<Share2 size={16} />}
        _hover={{ bg: "whiteAlpha.300" }}
        size="sm"
        onClick={canShare ? handleNativeShare : undefined}
      >
        Share
      </MenuButton>
      {!canShare && (
        <MenuList>
          <MenuItem icon={<Copy size={16} />} onClick={handleCopyLink}>
            Copy Link
          </MenuItem>
          <MenuItem
            icon={<Facebook size={16} />}
            as="a"
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on Facebook
          </MenuItem>
          <MenuItem
            icon={<Twitter size={16} />}
            as="a"
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on Twitter
          </MenuItem>
          <MenuItem
            icon={<MessageCircle size={16} />}
            as="a"
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on WhatsApp
          </MenuItem>
          <MenuItem
            icon={<Mail size={16} />}
            as="a"
            href={shareLinks.email}
          >
            Share via Email
          </MenuItem>
        </MenuList>
      )}
    </Menu>
  );
}

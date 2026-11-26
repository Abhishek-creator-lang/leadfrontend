'use client';

import { MouseEvent, useState } from 'react';
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
} from '@mui/material';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { track } from '@/lib/analytics';

type Channel = 'native' | 'linkedin' | 'x' | 'whatsapp' | 'copy';

/** Share links for the fallback menu. `url` and `text` are encoded here. */
const shareUrl = (channel: Exclude<Channel, 'native' | 'copy'>, url: string, text: string) => {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (channel) {
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'x':
      return `https://x.com/intent/post?url=${u}&text=${t}`;
    case 'whatsapp':
      return `https://wa.me/?text=${t}%20${u}`;
  }
};

const CHANNELS = [
  { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
  { id: 'x', label: 'X (Twitter)', Icon: XIcon },
  { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon },
] as const;

/**
 * Share the current page. Uses the native share sheet where available (mobile), otherwise a menu
 * with LinkedIn, X, WhatsApp and "Copy link". The page's Open Graph image becomes the preview card.
 */
export function ShareButton({
  title,
  kind,
}: {
  title: string;
  /** For analytics, e.g. "question". */
  kind: string;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);

  const url = () => window.location.href.split('#')[0];
  const done = (channel: Channel) => track('share_clicked', { kind, channel });

  const open = async (e: MouseEvent<HTMLElement>) => {
    const target = e.currentTarget;
    // Native share sheet on touch devices; desktop browsers get the menu (more predictable there).
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title, url: url() });
        done('native');
      } catch {
        // cancelled by the user
      }
      return;
    }
    setAnchor(target);
  };

  const copy = async () => {
    setAnchor(null);
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      done('copy');
    } catch {
      // clipboard blocked: nothing useful to show
    }
  };

  return (
    <>
      <Tooltip title="Share">
        <IconButton onClick={open} aria-label="Share" aria-haspopup="menu">
          <IosShareRoundedIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {CHANNELS.map(({ id, label, Icon }) => (
          <MenuItem
            key={id}
            component="a"
            href={typeof window === 'undefined' ? undefined : shareUrl(id, url(), title)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setAnchor(null);
              done(id);
            }}
          >
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}
        <MenuItem onClick={copy}>
          <ListItemIcon>
            <LinkRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy link</ListItemText>
        </MenuItem>
      </Menu>
      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        message="Link copied"
      />
    </>
  );
}

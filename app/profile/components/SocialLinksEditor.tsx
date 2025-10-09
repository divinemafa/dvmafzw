/**
 * Social Links Editor Component
 * 
 * Allows users to add/edit their social media profiles
 */

'use client';

import { useState } from 'react';
import {
  GlobeAltIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import type { SocialLinks } from '../types';

interface SocialLinksEditorProps {
  socialLinks: SocialLinks;
  onChange: (links: SocialLinks) => void;
}

// Social media platforms with icons and validation
const SOCIAL_PLATFORMS = [
  { 
    key: 'facebook' as keyof SocialLinks, 
    label: 'Facebook', 
    icon: '📘',
    placeholder: 'https://facebook.com/yourname',
    color: 'text-blue-500'
  },
  { 
    key: 'twitter' as keyof SocialLinks, 
    label: 'Twitter/X', 
    icon: '🐦',
    placeholder: 'https://twitter.com/yourname',
    color: 'text-sky-400'
  },
  { 
    key: 'instagram' as keyof SocialLinks, 
    label: 'Instagram', 
    icon: '📷',
    placeholder: 'https://instagram.com/yourname',
    color: 'text-pink-500'
  },
  { 
    key: 'linkedin' as keyof SocialLinks, 
    label: 'LinkedIn', 
    icon: '💼',
    placeholder: 'https://linkedin.com/in/yourname',
    color: 'text-blue-600'
  },
  { 
    key: 'youtube' as keyof SocialLinks, 
    label: 'YouTube', 
    icon: '📹',
    placeholder: 'https://youtube.com/@yourname',
    color: 'text-red-500'
  },
  { 
    key: 'tiktok' as keyof SocialLinks, 
    label: 'TikTok', 
    icon: '🎵',
    placeholder: 'https://tiktok.com/@yourname',
    color: 'text-purple-500'
  },
  { 
    key: 'github' as keyof SocialLinks, 
    label: 'GitHub', 
    icon: '💻',
    placeholder: 'https://github.com/yourname',
    color: 'text-gray-400'
  },
  { 
    key: 'website' as keyof SocialLinks, 
    label: 'Website', 
    icon: '🌐',
    placeholder: 'https://yourwebsite.com',
    color: 'text-green-500'
  },
  { 
    key: 'whatsapp' as keyof SocialLinks, 
    label: 'WhatsApp', 
    icon: '💬',
    placeholder: '+27671234567',
    color: 'text-green-600'
  },
  { 
    key: 'telegram' as keyof SocialLinks, 
    label: 'Telegram', 
    icon: '✈️',
    placeholder: '@yourname',
    color: 'text-blue-400'
  },
];

export function SocialLinksEditor({ socialLinks, onChange }: SocialLinksEditorProps) {
  const [showAll, setShowAll] = useState(false);

  const handleChange = (platform: keyof SocialLinks, value: string) => {
    if (value.trim() === '') {
      // Remove the platform if empty
      const newLinks = { ...socialLinks };
      delete newLinks[platform];
      onChange(newLinks);
    } else {
      onChange({
        ...socialLinks,
        [platform]: value.trim(),
      });
    }
  };

  const handleRemove = (platform: keyof SocialLinks) => {
    const newLinks = { ...socialLinks };
    delete newLinks[platform];
    onChange(newLinks);
  };

  // Count filled social links
  const filledCount = Object.keys(socialLinks).length;

  // Show platforms that have values or if showAll is true
  const visiblePlatforms = showAll 
    ? SOCIAL_PLATFORMS 
    : SOCIAL_PLATFORMS.filter(p => socialLinks[p.key]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GlobeAltIcon className="h-5 w-5 text-blue-400" />
          <h4 className="font-semibold">Social Media Links</h4>
          {filledCount > 0 && (
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
              {filledCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
        >
          {showAll ? (
            <>Hide Empty</>
          ) : (
            <>
              <PlusIcon className="h-3 w-3" />
              Add More
            </>
          )}
        </button>
      </div>

      {/* Social Media Inputs */}
      <div className="space-y-2">
        {visiblePlatforms.map((platform) => (
          <div key={platform.key} className="group">
            <label className="mb-1 flex items-center gap-2 text-xs text-white/60">
              <span className="text-base">{platform.icon}</span>
              {platform.label}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={socialLinks[platform.key] || ''}
                onChange={(e) => handleChange(platform.key, e.target.value)}
                placeholder={platform.placeholder}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
              {socialLinks[platform.key] && (
                <button
                  type="button"
                  onClick={() => handleRemove(platform.key)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 transition hover:border-red-400 hover:bg-red-500/10"
                  title="Remove"
                >
                  <TrashIcon className="h-4 w-4 text-red-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info Text */}
      {!showAll && filledCount === 0 && (
        <p className="text-xs text-white/40">
          Click &quot;Add More&quot; to add your social media profiles
        </p>
      )}
    </div>
  );
}

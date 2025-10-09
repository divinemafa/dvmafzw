/**
 * Profile Info Section
 * 
 * Displays user's contact information, bio, and languages
 */

'use client';

import { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type { UserProfile } from '../types';
import { useProfileUpdate } from '../hooks/useProfileUpdate';

interface ProfileInfoSectionProps {
  profile: UserProfile;
  onUpdate: () => void;
}

// Common languages list
const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
  'Arabic', 'Portuguese', 'Russian', 'Italian', 'Hindi', 'Korean',
  'Afrikaans', 'Zulu', 'Xhosa', 'Swahili', 'Dutch', 'Turkish',
  'Polish', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek'
];

export function ProfileInfoSection({ profile, onUpdate }: ProfileInfoSectionProps) {
  const { updateProfile, updating } = useProfileUpdate();
  const [languages, setLanguages] = useState<string[]>(
    profile.spoken_languages || ['English']
  );
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Filter languages based on search
  const filteredLanguages = COMMON_LANGUAGES.filter(
    lang => lang.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !languages.includes(lang)
  );

  const saveLanguages = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const result = await updateProfile(profile.id, {
        spoken_languages: languages
      });

      if (result.success) {
        setSaveSuccess(true);
        setHasChanges(false); // Reset changes flag
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        console.error('Failed to save languages:', result.error);
      }
    } catch (error) {
      console.error('Failed to save languages:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addLanguage = (lang: string) => {
    if (lang && !languages.includes(lang)) {
      const updatedLanguages = [...languages, lang];
      setLanguages(updatedLanguages);
      setHasChanges(true); // Mark as changed
      setNewLanguage('');
      setSearchQuery('');
      setIsAddingLanguage(false);
    }
  };

  const removeLanguage = (lang: string) => {
    const updatedLanguages = languages.filter(l => l !== lang);
    setLanguages(updatedLanguages);
    setHasChanges(true); // Mark as changed
  };

  const handleAddCustomLanguage = () => {
    if (newLanguage.trim()) {
      addLanguage(newLanguage.trim());
    }
  };

  return (
    <div className="space-y-3">
      {/* Contact Information - More compact */}
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-4 py-2.5">
          <h3 className="text-base font-semibold">Contact Information</h3>
        </div>
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
                <EnvelopeIcon className="h-3.5 w-3.5" />
                Email
              </div>
              <p className="text-sm font-medium">{profile.email}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
                <PhoneIcon className="h-3.5 w-3.5" />
                Phone
              </div>
              <p className="text-sm font-medium">
                {profile.phone_number || 'Not provided'}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 sm:col-span-2">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs text-white/60">
                <MapPinIcon className="h-3.5 w-3.5" />
                Location
              </div>
              <p className="text-sm font-medium">
                {profile.location || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bio - More compact */}
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-4 py-2.5">
          <h3 className="text-base font-semibold">About Me</h3>
        </div>
        <div className="p-4">
          <p className="text-xs leading-relaxed text-white/80">
            {profile.bio || 'No bio added yet. Tell others about yourself and your services.'}
          </p>
          <button className="mt-2.5 text-xs font-semibold text-blue-300 hover:text-blue-200">
            Edit Bio →
          </button>
        </div>
      </div>

      {/* Languages - More compact */}
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
        <div className="border-b border-white/10 px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <GlobeAltIcon className="h-4 w-4" />
              <h3 className="text-base font-semibold">Languages</h3>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && !isSaving && !saveSuccess && (
                <span className="text-[10px] text-yellow-300">● Unsaved changes</span>
              )}
              {isSaving && (
                <span className="text-[10px] text-blue-300">Saving...</span>
              )}
              {saveSuccess && (
                <span className="text-[10px] text-green-300">✓ Saved</span>
              )}
              {hasChanges && (
                <button
                  onClick={saveLanguages}
                  disabled={isSaving}
                  className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-semibold transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-1.5">
            {/* Existing Languages - Smaller badges */}
            {languages.map((lang, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium"
              >
                {lang}
                <button
                  onClick={() => removeLanguage(lang)}
                  className="opacity-0 transition group-hover:opacity-100 hover:text-red-300"
                  title="Remove language"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Add Language Button/Form */}
            {!isAddingLanguage ? (
              <button
                onClick={() => setIsAddingLanguage(true)}
                className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium transition hover:bg-white/10"
              >
                + Add Language
              </button>
            ) : (
              <div className="w-full space-y-2">
                {/* Search/Input Field */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        addLanguage(searchQuery.trim());
                      }
                      if (e.key === 'Escape') {
                        setIsAddingLanguage(false);
                        setSearchQuery('');
                      }
                    }}
                    placeholder="Search or type a language..."
                    className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setIsAddingLanguage(false);
                      setSearchQuery('');
                    }}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>

                {/* Language Suggestions */}
                {searchQuery && filteredLanguages.length > 0 && (
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-white/20 bg-white/5">
                    {filteredLanguages.slice(0, 8).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => addLanguage(lang)}
                        className="w-full px-3 py-1.5 text-left text-xs transition hover:bg-white/10"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}

                {/* Add Custom Language */}
                {searchQuery && filteredLanguages.length === 0 && (
                  <button
                    onClick={() => addLanguage(searchQuery.trim())}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-left text-xs transition hover:bg-white/10"
                  >
                    + Add &quot;{searchQuery}&quot;
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Info Text */}
          <p className="mt-3 text-[10px] text-white/50">
            Add or remove languages, then click &quot;Save&quot; to update your profile. Hover over a language to remove it.
          </p>
        </div>
      </div>
    </div>
  );
}

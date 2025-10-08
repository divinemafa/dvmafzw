"use client";

import { useState } from 'react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  GlobeAltIcon,
  KeyIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  CameraIcon,
  StarIcon,
  ClockIcon,
  IdentificationIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  InboxIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<'profile' | 'messages' | 'settings' | 'verification' | 'security'>('profile');
  const [activeMessageTab, setActiveMessageTab] = useState<'inbox' | 'sent' | 'archived'>('inbox');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  // User Profile Data
  const userProfile = {
    name: 'Demo User',
    email: 'demo@marketplace.com',
    phone: '+27 82 123 4567',
    location: 'Cape Town, South Africa',
    joined: 'March 2025',
    avatar: null, // Will show initials
    bio: 'Professional service provider with 5+ years of experience in home services and tutoring. Dedicated to quality and customer satisfaction.',
    languages: ['English', 'Afrikaans', 'Zulu'],
    verified: true,
    rating: 4.8,
    totalReviews: 24,
    responseTime: '2 hours',
    completionRate: 95,
  };

  // Messages Data
  const conversations = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      avatar: null,
      lastMessage: 'Thanks! What time works best for you?',
      timestamp: '10 min ago',
      unread: 2,
      service: 'House Cleaning',
      status: 'active',
    },
    {
      id: 2,
      name: 'John Davidson',
      avatar: null,
      lastMessage: 'Perfect, see you on Tuesday at 3 PM.',
      timestamp: '2 hours ago',
      unread: 0,
      service: 'Math Tutoring',
      status: 'active',
    },
    {
      id: 3,
      name: 'Linda Peterson',
      avatar: null,
      lastMessage: 'Could you send me your rates for weekly service?',
      timestamp: '1 day ago',
      unread: 1,
      service: 'Garden Maintenance',
      status: 'pending',
    },
    {
      id: 4,
      name: 'Michael Chen',
      avatar: null,
      lastMessage: 'Great work! I left you a 5-star review.',
      timestamp: '2 days ago',
      unread: 0,
      service: 'Plumbing',
      status: 'completed',
    },
    {
      id: 5,
      name: 'Emma Williams',
      avatar: null,
      lastMessage: 'Do you offer weekend sessions?',
      timestamp: '3 days ago',
      unread: 0,
      service: 'Math Tutoring',
      status: 'active',
    },
  ];

  const messageThread = selectedConversation ? [
    { id: 1, sender: 'them', text: 'Hi! I\'m interested in your house cleaning service.', time: '10:30 AM' },
    { id: 2, sender: 'me', text: 'Hello! Thank you for reaching out. I\'d be happy to help. What type of cleaning are you looking for?', time: '10:35 AM' },
    { id: 3, sender: 'them', text: 'I need a deep clean for a 3-bedroom house. How much would that cost?', time: '10:40 AM' },
    { id: 4, sender: 'me', text: 'For a 3-bedroom deep clean, the rate is R650. This includes all rooms, bathrooms, and kitchen. Takes about 4-5 hours.', time: '10:42 AM' },
    { id: 5, sender: 'them', text: 'That sounds good! When are you available?', time: '10:45 AM' },
    { id: 6, sender: 'me', text: 'I have availability this Friday or next Monday. Which would work better for you?', time: '10:47 AM' },
    { id: 7, sender: 'them', text: 'Thanks! What time works best for you?', time: '10:50 AM' },
  ] : [];

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingAlerts: true,
    messageAlerts: true,
    reviewAlerts: true,
    promotionalEmails: false,
  });

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1800px] px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-white/60">Manage your account, settings, and communications</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 space-y-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-2xl">
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSection === 'profile'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <UserCircleIcon className="h-5 w-5" />
                Profile Info
              </button>
              <button
                onClick={() => setActiveSection('messages')}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSection === 'messages'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                Messages
                {conversations.filter(c => c.unread > 0).length > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold">
                    {conversations.reduce((acc, c) => acc + c.unread, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSection('verification')}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSection === 'verification'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ShieldCheckIcon className="h-5 w-5" />
                Verification
                {userProfile.verified && (
                  <CheckCircleIcon className="ml-auto h-4 w-4 text-emerald-400" />
                )}
              </button>
              <button
                onClick={() => setActiveSection('settings')}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSection === 'settings'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Cog6ToothIcon className="h-5 w-5" />
                Settings
              </button>
              <button
                onClick={() => setActiveSection('security')}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSection === 'security'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <KeyIcon className="h-5 w-5" />
                Security
              </button>

              <div className="border-t border-white/10 pt-2">
                <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10">
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {/* PROFILE INFO SECTION */}
            {activeSection === 'profile' && (
              <div className="space-y-4">
                {/* Profile Header Card */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="relative h-32 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20">
                    <button className="absolute right-4 top-4 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/20">
                      <CameraIcon className="mr-1 inline-block h-4 w-4" />
                      Edit Cover
                    </button>
                  </div>
                  <div className="relative px-6 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
                      <div className="-mt-16 mb-4 sm:mb-0">
                        <div className="relative inline-block">
                          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#0a1532] bg-gradient-to-br from-purple-500 to-blue-500 text-4xl font-bold">
                            {getInitials(userProfile.name)}
                          </div>
                          <button className="absolute bottom-0 right-0 rounded-full border-2 border-[#0a1532] bg-blue-500 p-2 text-white transition hover:bg-blue-600">
                            <CameraIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                              {userProfile.verified && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300">
                                  <ShieldCheckIcon className="h-3 w-3" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-white/60">Member since {userProfile.joined}</p>
                          </div>
                          <button className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20">
                            <PencilSquareIcon className="mr-2 inline-block h-4 w-4" />
                            Edit Profile
                          </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{userProfile.rating}</span>
                            <span className="text-white/60">({userProfile.totalReviews} reviews)</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-white/60">
                            <ClockIcon className="h-4 w-4" />
                            <span>Responds in {userProfile.responseTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-white/60">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>{userProfile.completionRate}% completion rate</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                          <EnvelopeIcon className="h-4 w-4" />
                          Email
                        </div>
                        <p className="font-medium">{userProfile.email}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                          <PhoneIcon className="h-4 w-4" />
                          Phone
                        </div>
                        <p className="font-medium">{userProfile.phone}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:col-span-2">
                        <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                          <MapPinIcon className="h-4 w-4" />
                          Location
                        </div>
                        <p className="font-medium">{userProfile.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold">About Me</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm leading-relaxed text-white/80">{userProfile.bio}</p>
                    <button className="mt-4 text-sm font-semibold text-blue-300 hover:text-blue-200">
                      Edit Bio →
                    </button>
                  </div>
                </div>

                {/* Languages */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold">Languages</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {userProfile.languages.map((lang, idx) => (
                        <span key={idx} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
                          {lang}
                        </span>
                      ))}
                      <button className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10">
                        + Add Language
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGES SECTION */}
            {activeSection === 'messages' && (
              <div className="grid gap-4 lg:grid-cols-12">
                {/* Conversations List */}
                <div className="lg:col-span-5">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                    {/* Messages Header */}
                    <div className="border-b border-white/10 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Messages</h3>
                        <button className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/20">
                          <PencilSquareIcon className="mr-1 inline-block h-3 w-3" />
                          New
                        </button>
                      </div>
                      {/* Search */}
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <input
                          type="text"
                          placeholder="Search messages..."
                          className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 outline-none focus:border-white/20"
                        />
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                      <button
                        onClick={() => setActiveMessageTab('inbox')}
                        className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                          activeMessageTab === 'inbox'
                            ? 'border-b-2 border-blue-500 text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Inbox ({conversations.filter(c => c.unread > 0).length})
                      </button>
                      <button
                        onClick={() => setActiveMessageTab('sent')}
                        className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                          activeMessageTab === 'sent'
                            ? 'border-b-2 border-blue-500 text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Sent
                      </button>
                      <button
                        onClick={() => setActiveMessageTab('archived')}
                        className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
                          activeMessageTab === 'archived'
                            ? 'border-b-2 border-blue-500 text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Archived
                      </button>
                    </div>

                    {/* Conversation List */}
                    <div className="max-h-[600px] overflow-y-auto">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={`flex w-full items-start gap-3 border-b border-white/5 p-4 text-left transition hover:bg-white/5 ${
                            selectedConversation === conv.id ? 'bg-white/10' : ''
                          }`}
                        >
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold">
                            {getInitials(conv.name)}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-white">{conv.name}</h4>
                              <span className="text-xs text-white/50">{conv.timestamp}</span>
                            </div>
                            <p className="text-xs text-white/60">{conv.service}</p>
                            <p className="mt-1 truncate text-sm text-white/70">{conv.lastMessage}</p>
                          </div>
                          {conv.unread > 0 && (
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold">
                              {conv.unread}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message Thread */}
                <div className="lg:col-span-7">
                  {selectedConversation ? (
                    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                      {/* Thread Header */}
                      <div className="flex items-center justify-between border-b border-white/10 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold">
                            {getInitials(conversations.find(c => c.id === selectedConversation)?.name || '')}
                          </div>
                          <div>
                            <h4 className="font-semibold">{conversations.find(c => c.id === selectedConversation)?.name}</h4>
                            <p className="text-xs text-white/60">{conversations.find(c => c.id === selectedConversation)?.service}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="rounded-lg border border-white/15 bg-white/10 p-2 transition hover:bg-white/20">
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg border border-white/15 bg-white/10 p-2 transition hover:bg-white/20">
                            <EllipsisVerticalIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        {messageThread.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${msg.sender === 'me' ? 'order-2' : 'order-1'}`}>
                              <div className={`rounded-2xl px-4 py-2 ${
                                msg.sender === 'me'
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                  : 'border border-white/10 bg-white/5'
                              }`}>
                                <p className="text-sm">{msg.text}</p>
                              </div>
                              <p className="mt-1 text-xs text-white/40">{msg.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      <div className="border-t border-white/10 p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-white/20"
                          />
                          <button className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-3 transition hover:from-blue-600 hover:to-purple-600">
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-white/5 p-12 backdrop-blur-2xl">
                      <div className="text-center">
                        <InboxIcon className="mx-auto mb-4 h-16 w-16 text-white/30" />
                        <h3 className="mb-2 text-lg font-semibold text-white/60">Select a conversation</h3>
                        <p className="text-sm text-white/40">Choose a message from the list to start chatting</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VERIFICATION SECTION */}
            {activeSection === 'verification' && (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold">Identity Verification</h3>
                    <p className="text-sm text-white/60">Verify your identity to build trust with clients</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Email Verification */}
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
                          <EnvelopeIcon className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Email Address</h4>
                          <p className="text-sm text-white/60">{userProfile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-300">Verified</span>
                      </div>
                    </div>

                    {/* Phone Verification */}
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
                          <PhoneIcon className="h-5 w-5 text-blue-300" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Phone Number</h4>
                          <p className="text-sm text-white/60">{userProfile.phone}</p>
                        </div>
                      </div>
                      <button className="rounded-lg border border-blue-300/30 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/30">
                        Verify Now
                      </button>
                    </div>

                    {/* ID Verification */}
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
                          <IdentificationIcon className="h-5 w-5 text-purple-300" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Government ID</h4>
                          <p className="text-sm text-white/60">Upload your ID or passport</p>
                        </div>
                      </div>
                      <button className="rounded-lg border border-purple-300/30 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/30">
                        Upload ID
                      </button>
                    </div>

                    {/* Bank Verification */}
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                          <BanknotesIcon className="h-5 w-5 text-yellow-300" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Bank Account</h4>
                          <p className="text-sm text-white/60">Link your bank account for payouts</p>
                        </div>
                      </div>
                      <button className="rounded-lg border border-yellow-300/30 bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/30">
                        Link Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Verification Benefits */}
                <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 backdrop-blur-2xl">
                  <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                    <ShieldCheckIcon className="h-6 w-6 text-emerald-300" />
                    Why Verify Your Account?
                  </h4>
                  <ul className="space-y-2 text-sm text-white/80">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                      Build trust with clients and increase bookings
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                      Get a verified badge on your profile
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                      Qualify for higher-value projects
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                      Faster payment processing
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* SETTINGS SECTION */}
            {activeSection === 'settings' && (
              <div className="space-y-4">
                {/* Notification Settings */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold">Notification Preferences</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                          <p className="text-sm text-white/60">Receive notifications for this activity</p>
                        </div>
                        <button
                          onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !value }))}
                          className={`relative h-6 w-11 rounded-full transition ${
                            value ? 'bg-blue-500' : 'bg-white/20'
                          }`}
                        >
                          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                            value ? 'right-0.5' : 'left-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Language & Region */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold">Language & Region</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Language</label>
                      <select className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20">
                        <option>English</option>
                        <option>Afrikaans</option>
                        <option>Zulu</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Currency</label>
                      <select className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20">
                        <option>ZAR (South African Rand)</option>
                        <option>USD (US Dollar)</option>
                        <option>EUR (Euro)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Time Zone</label>
                      <select className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-white/20">
                        <option>South Africa Standard Time (SAST)</option>
                        <option>UTC</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold">Privacy</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Profile Visibility</h4>
                        <p className="text-sm text-white/60">Who can see your profile</p>
                      </div>
                      <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none">
                        <option>Everyone</option>
                        <option>Registered Users</option>
                        <option>Only Me</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Show Online Status</h4>
                        <p className="text-sm text-white/60">Let others see when you&apos;re online</p>
                      </div>
                      <button className="relative h-6 w-11 rounded-full bg-blue-500 transition">
                        <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY SECTION */}
            {activeSection === 'security' && (
              <div className="space-y-4">
                {/* Password */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold">Password & Authentication</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                      <div>
                        <h4 className="font-semibold">Password</h4>
                        <p className="text-sm text-white/60">Last changed 3 months ago</p>
                      </div>
                      <button className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20">
                        Change Password
                      </button>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                      <div>
                        <h4 className="font-semibold">Two-Factor Authentication</h4>
                        <p className="text-sm text-white/60">Add an extra layer of security</p>
                      </div>
                      <button className="rounded-lg border border-emerald-300/30 bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/30">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-white/10 px-6 py-4">
                    <h3 className="text-lg font-semibold">Active Sessions</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                      <div>
                        <h4 className="font-semibold">Current Device</h4>
                        <p className="text-sm text-white/60">Windows • Chrome • Cape Town, SA</p>
                        <p className="text-xs text-white/40">Active now</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Current
                      </span>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="overflow-hidden rounded-xl border border-red-500/30 bg-red-500/5 shadow-xl backdrop-blur-2xl">
                  <div className="border-b border-red-500/20 px-6 py-4">
                    <h3 className="text-lg font-semibold text-red-300">Danger Zone</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">Deactivate Account</h4>
                        <p className="text-sm text-white/60">Temporarily disable your account</p>
                      </div>
                      <button className="rounded-lg border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30">
                        Deactivate
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">Delete Account</h4>
                        <p className="text-sm text-white/60">Permanently delete your account and data</p>
                      </div>
                      <button className="rounded-lg border border-red-300/30 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/30">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

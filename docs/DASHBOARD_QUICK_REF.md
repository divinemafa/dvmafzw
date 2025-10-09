# Dashboard Quick Reference

## Tab Overview

| Tab | Icon | Purpose | Data Source | Status |
|-----|------|---------|-------------|--------|
| Overview | HomeIcon | Dashboard summary | Multiple tables | ✅ Mock data |
| Bookings | TicketIcon | Manage appointments | `user_bookings` | ✅ Mock data |
| Messages | ChatBubbleLeftRightIcon | Inbox/conversations | TBD | 🔄 Placeholder |
| Calendar | CalendarIcon | Schedule management | TBD | 🔄 Placeholder |
| Content | DocumentTextIcon | Listings & AI tools | `listings` | ✅ Mock data |
| Finance | BanknotesIcon | Transactions & earnings | `transactions` | ✅ Mock data |
| Reviews | StarIcon | Customer reviews | `reviews` | ✅ Mock data |
| Clients | UsersIcon | Customer management | `user_profiles` | 🔄 Placeholder |
| Analytics | ChartBarIcon | Performance metrics | TBD | 🔄 Mock data |
| Settings | Cog6ToothIcon | Dashboard settings | `user_settings` | 🔄 Placeholder |

## Key Stats by Tab

### Overview Tab
- Total Listings
- Active Bookings  
- Pending Reviews
- Total Earnings

### Bookings Tab
- Pending: 12
- Confirmed: 45
- Completed: 230
- Cancelled: 8

### Messages Tab
- Unread: 5
- Total Messages: 47

### Reviews Tab
- Average Rating
- Total Reviews
- 5-Star Reviews

### Clients Tab
- Total Clients
- Active Clients
- New (30 days)

### Analytics Tab
- Total Views
- Total Clicks
- Conversion Rate
- Revenue Growth

## Component Locations

```
app/dashboard/
├── page.tsx                    (Main dashboard, 230 lines)
├── types.ts                    (All TypeScript types)
├── mockData.ts                 (Mock data for testing)
└── components/
    ├── index.ts                (Central exports)
    ├── DashboardHeader.tsx     (User greeting)
    ├── DashboardLayout.tsx     (3-column structure)
    ├── TabNavigation.tsx       (All 10 tabs)
    ├── overview/               (✅ Complete)
    ├── content/                (✅ Complete)
    ├── finance/                (✅ Complete)
    ├── bookings/               (✅ New - Ready for data)
    ├── messages/               (✅ New - Ready for data)
    ├── calendar/               (✅ New - Ready for data)
    ├── reviews/                (✅ New - Ready for data)
    ├── clients/                (✅ New - Ready for data)
    ├── analytics/              (✅ New - Ready for data)
    └── settings/               (✅ New - Ready for data)
```

## Adding Real Data - Example

### Before (Mock):
```typescript
<BookingsTab bookings={mockBookings} />
```

### After (Real):
```typescript
const { data: bookings } = await supabase
  .from('user_bookings')
  .select('*')
  .eq('user_id', user.id);

<BookingsTab bookings={bookings} />
```

## Responsive Breakpoints

- **Mobile**: < 640px (single column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns with lg:col-span-8/4)

## Quick Actions Sidebar

Appears on right side for all tabs:
- Create New Listing
- View Profile
- Account Settings
- Help & Support

## Empty States

Every tab has a friendly empty state:
- Icon (relevant to tab)
- "No {items} yet" heading
- Helpful description
- (Future: Call-to-action button)

## TypeScript Types Quick Reference

```typescript
// Tab switching
type TabType = 'overview' | 'bookings' | 'messages' | ...

// Booking data
interface Booking {
  id: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// Message data
interface Message {
  id: string;
  senderName: string;
  subject: string;
  preview: string;
  sentAt: string;
  isRead: boolean;
}

// Client data
interface Client {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  totalBookings: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
}
```

## CSS Utilities

```css
/* Hide scrollbar for tab navigation */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

## Testing Tabs Locally

1. Navigate to `/dashboard`
2. Click any tab to switch
3. Scroll tabs horizontally on mobile
4. Check empty states (most tabs)
5. Check data rendering (Overview, Content, Finance)

---

**Legend:**
- ✅ Complete
- 🔄 Placeholder/Mock
- ❌ Not implemented

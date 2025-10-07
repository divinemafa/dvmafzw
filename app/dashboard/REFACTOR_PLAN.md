# Dashboard Refactoring - Component Structure

## 📁 New File Structure

```
app/dashboard/
  page.tsx                          (< 150 lines - main orchestration)
  types.ts                          (TypeScript interfaces)
  mockData.ts                       (Mock data constants)
  
  components/
    # Shared Components
    DashboardHeader.tsx             (✅ Created - Header with user name)
    TabNavigation.tsx               (✅ Created - Tab switcher)
    LoginScreen.tsx                 (✅ Created - Login UI)
    
    # Overview Tab
    overview/
      StatsGrid.tsx                 (4 stat cards)
      RecentBookings.tsx            (Bookings list)
      RecentReviews.tsx             (Reviews list)
      QuickStats.tsx                (Sidebar quick stats)
      QuickActions.tsx              (Sidebar action buttons)
    
    # Content Tab
    content/
      ContentHeader.tsx             (Header with "Create" button)
      ListingsGrid.tsx              (Grid of service listings)
      ListingCard.tsx               (Individual listing card)
      AIContentBanner.tsx           (Coming soon banner)
    
    # Finance Tab
    finance/
      BalanceCards.tsx              (BMC + Fiat balance)
      FinanceStats.tsx              (3 stat cards)
      TransactionList.tsx           (Recent transactions)
      TransactionItem.tsx           (Individual transaction)
      PremiumFeatures.tsx           (Premium feature grid)
      PremiumFeatureCard.tsx        (Individual feature card)
      EarnOpportunities.tsx         (Sidebar earn tasks)
      FinanceQuickActions.tsx       (Sidebar actions)
      InfoCard.tsx                  (About BMC info)
```

## 🎯 Component Breakdown

### **Main Page (page.tsx)** - Target: ~100-150 lines
- Import all components
- Manage state (isLoggedIn, activeTab)
- Render LoginScreen or Dashboard layout
- Pass data to child components

### **Overview Tab** - Total: ~400 lines (split into 5 files)
1. **StatsGrid.tsx** (~80 lines) - 4 stat cards
2. **RecentBookings.tsx** (~100 lines) - Bookings table
3. **RecentReviews.tsx** (~80 lines) - Reviews list
4. **QuickStats.tsx** (~60 lines) - Sidebar stats
5. **QuickActions.tsx** (~80 lines) - Sidebar buttons

### **Content Tab** - Total: ~350 lines (split into 4 files)
1. **ContentHeader.tsx** (~50 lines) - Header with actions
2. **ListingsGrid.tsx** (~80 lines) - Grid wrapper
3. **ListingCard.tsx** (~150 lines) - Individual listing
4. **AIContentBanner.tsx** (~70 lines) - AI promo banner

### **Finance Tab** - Total: ~500 lines (split into 8 files)
1. **BalanceCards.tsx** (~120 lines) - BMC + Fiat cards
2. **FinanceStats.tsx** (~90 lines) - 3 stat cards
3. **TransactionList.tsx** (~80 lines) - Transaction wrapper
4. **TransactionItem.tsx** (~40 lines) - Single transaction
5. **PremiumFeatures.tsx** (~80 lines) - Features grid
6. **PremiumFeatureCard.tsx** (~40 lines) - Single feature
7. **EarnOpportunities.tsx** (~100 lines) - Earn sidebar
8. **FinanceQuickActions.tsx** (~70 lines) - Finance actions
9. **InfoCard.tsx** (~50 lines) - Info banner

## ✅ Benefits of Refactoring

1. **Maintainability**: Each file has a single purpose
2. **Reusability**: Components can be used elsewhere
3. **Testing**: Easier to test individual components
4. **Performance**: Can optimize specific components
5. **Collaboration**: Multiple developers can work simultaneously
6. **Code Review**: Smaller PRs, easier to review

## 📝 Next Steps

1. ✅ Create types.ts
2. ✅ Create mockData.ts
3. ✅ Create shared components (Header, Tabs, Login)
4. Create Overview tab components
5. Create Content tab components
6. Create Finance tab components
7. Refactor main page.tsx to orchestrate components
8. Test all functionality
9. Remove old code

---

**Status**: In Progress
**Current File Count**: 3/23 components created
**Target File Size**: All files < 200 lines

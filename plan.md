# Wardrobe Designer - Foundation Setup Plan

## Overview
Create the foundation for a React Native/Expo wardrobe designer app with theme, API, and animation wrappers, plus 3 empty pages with header/footer navigation.

## Tech Stack
- **UI Framework:** Tamagui (components, theming, animations)
- **Navigation:** Expo Router (file-based routing)
- **Animations:** Tamagui animations with react-native-reanimated
- **API:** Native fetch wrapper (typed)

> Note: Using Tamagui alone instead of NativeWind+Tamagui to avoid compilation conflicts. Tamagui handles styling, components, AND animations in one unified system.

---

## Folder Structure
```
wardrobe-designer-frontend/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Main page (Schedule)
│   ├── wardrobe.tsx              # Items page
│   └── settings.tsx              # Settings page
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── PageContainer.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts         # API wrapper
│   │   │   └── types.ts
│   │   └── theme/
│   │       └── tokens.ts         # Design tokens
├── tamagui.config.ts
├── babel.config.js
├── metro.config.js
└── app.config.ts
```

---

## Theme: Eye-Safe Black & White Palette
```
Background:  #FAFAFA (soft white)
Text:        #1A1A1A (soft black)
Secondary:   #4A4A4A
Border:      #E5E5E5
Highlight:   #E8E8E8
```

---

## Dependencies to Install
```bash
# Core
npx expo install expo-router expo-linking expo-constants expo-splash-screen

# UI & Animation
npx expo install tamagui @tamagui/config @tamagui/themes @tamagui/font-inter @tamagui/animations-react-native @tamagui/lucide-icons

# Navigation requirements
npx expo install react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated

# Dev
npm install -D @tamagui/babel-plugin
```

---

## Implementation Steps

### Step 1: Configuration Files
1. Create `babel.config.js` - Tamagui + Reanimated plugins
2. Create `metro.config.js` - Bundle configuration
3. Convert `app.json` to `app.config.ts` - Enable Expo Router
4. Update `tsconfig.json` - Add path aliases
5. Create `tamagui.config.ts` - Theme, tokens, animations

### Step 2: Theme System
6. Create `src/lib/theme/tokens.ts` - Color palette, spacing, typography

### Step 3: API Wrapper
7. Create `src/lib/api/types.ts` - Request/response types
8. Create `src/lib/api/client.ts` - API class with:
   - Base URL: `https://wardrobe-designer-production.up.railway.app`
   - GET, POST, PUT, DELETE methods
   - Request/response interceptors (for future auth)
   - Error handling

### Step 4: Navigation & Pages
9. Create `app/_layout.tsx` - Provider hierarchy:
   ```
   GestureHandlerRootView > SafeAreaProvider > TamaguiProvider > Stack
   ```
10. Create `app/index.tsx` - Empty Schedule page
11. Create `app/wardrobe.tsx` - Empty Wardrobe page
12. Create `app/settings.tsx` - Empty Settings page

### Step 5: Layout Components
13. Create `src/components/layout/PageContainer.tsx` - Safe area wrapper
14. Create `src/components/layout/Header.tsx` - App title, subtle fade-in
15. Create `src/components/layout/Footer.tsx` - Bottom nav with:
    - 3 tabs: Schedule (Calendar icon), Wardrobe (Shirt icon), Settings (Settings icon)
    - Active state highlighting
    - Subtle press animation (scale 0.95)

### Step 6: Cleanup
16. Remove old `App.tsx` (replaced by Expo Router)
17. Update `index.ts` for Expo Router
18. Test with `npx expo start -c`

---

## Animation Config (Subtle)
```typescript
animations = {
  subtle: { type: 'timing', duration: 200 },
  gentle: { type: 'spring', damping: 20, stiffness: 150 },
  quick:  { type: 'spring', damping: 25, stiffness: 200 },
}
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `babel.config.js` | Create |
| `metro.config.js` | Create |
| `app.config.ts` | Create (replaces app.json) |
| `tamagui.config.ts` | Create |
| `tsconfig.json` | Modify (add paths) |
| `package.json` | Modify (add scheme) |
| `src/lib/theme/tokens.ts` | Create |
| `src/lib/api/types.ts` | Create |
| `src/lib/api/client.ts` | Create |
| `app/_layout.tsx` | Create |
| `app/index.tsx` | Create |
| `app/wardrobe.tsx` | Create |
| `app/settings.tsx` | Create |
| `src/components/layout/PageContainer.tsx` | Create |
| `src/components/layout/Header.tsx` | Create |
| `src/components/layout/Footer.tsx` | Create |
| `index.ts` | Modify (Expo Router entry) |
| `App.tsx` | Delete |
| `app.json` | Delete |

---

## Notes
- Reanimated v3 required for Expo 54 + Tamagui compatibility
- Run `npx expo start -c` after setup to clear cache
- API wrapper is ready but no calls made (as requested)

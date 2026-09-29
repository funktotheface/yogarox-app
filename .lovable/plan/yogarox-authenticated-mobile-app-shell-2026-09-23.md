# YogaRox authenticated mobile app shell

## Goal
Build the complete post-login mobile frontend shown by the supplied YogaRox wireframe and brief, while leaving the existing login, signup/link-out, session restoration, WordPress API proxy, member identity, membership lookup, and logout behavior unchanged.

## Protected existing behavior
- Keep `/` and its current login/account-creation experience unchanged.
- Keep `AuthProvider`, stored sessions, redirects, WordPress requests, real member identity, real membership response, and logout implementation unchanged.
- Continue entering the authenticated experience at `/home`.
- Preserve the current real membership lookup; do not add or infer any new access logic. Prototype View, Join, Unavailable, and Membership required states will be visual examples only.

## Build

### 1. Reusable authenticated app frame
- Create a mobile-first `AppShell` with safe-area spacing, screen headers, scrollable content, and persistent bottom navigation.
- Keep exactly four primary tabs: Home, Forum, Offers, Profile.
- Add reusable buttons, cards, metadata rows, placeholders, loading skeletons, empty states, inline errors, access-denied states, and back controls.
- Scope the plum/lavender design language to the authenticated app so the existing entry screens are not restyled.

### 2. Home and class journeys
- Replace the current temporary post-login screen with the member Home layout.
- Use the already available authenticated display name for the greeting, without changing how it is obtained.
- Show a Monday–Friday weekly schedule using deliberately labelled class placeholders, with visible View/Join state examples.
- Add an on-demand library entry within Home so the four-tab navigation remains unchanged.
- Build clickable frontend routes for:
  - weekly live-class detail;
  - Classes / on-demand library with visual-only filter controls;
  - on-demand class detail.
- Use explicit image, time, title, description, stream, video, instructor, metadata, and related-content placeholders—no invented classes, schedules, IDs, URLs, or providers.
- Add concise developer notes/comments for future class data, stream playback, video playback, and entitlement contracts.

### 3. Forum and Offers
- Build Forum as a polished Coming Soon screen only, with no posts, composer, users, replies, categories, or moderation simulation.
- Build Offers with structural placeholder cards and a placeholder detail state, without fake partners, promotions, expiry dates, or destinations.
- Document the conceptual future offer data needs without defining a production schema.

### 4. Profile and account destinations
- Build Profile using only member name/email already exposed by the existing session; use explicit placeholders for anything unavailable.
- Add destinations for Personal details, Password, Notifications, Payment details, and Privacy & terms.
- Personal details: frontend-only fields plus the required backend TODO.
- Password/account: labelled placeholder only; do not create password behavior.
- Notifications: visual preference controls and states only; no device registration or push infrastructure.
- Payment details: placeholder destination only; no URL, checkout, payment provider, or subscription integration.
- Privacy & terms: polished placeholder content structure without inventing legal copy.
- Reuse the existing logout action and return destination exactly.

### 5. Routing and metadata
- Add a real route file for every clickable destination in the same change, using typed internal links and working back navigation.
- Keep `/home` as the authenticated entry URL.
- Give each new content route unique YogaRox title, description, Open Graph text, and Twitter card metadata.

### 6. Validation
- Verify the existing login screen still renders and its route remains unchanged.
- Verify unauthenticated visits to the new screens return to the existing entry flow.
- Verify all four tabs, class flows, offer flow, profile rows, and back controls are clickable.
- Verify existing logout still clears the session and returns to `/`.
- Check mobile and desktop-width presentation, safe-area spacing, touch targets, keyboard focus, text fit, loading/empty/error/access states, runtime console, and the latest build result.

## Technical notes
- New work stays in frontend route and presentation components; no database, provider SDK, API endpoint, server function, schema, fake response, or persistence layer will be added.
- Placeholder routes will use static structural labels rather than production-like sample records.
- The existing membership API remains intact because it is already working functionality; it will not control the new prototype class states until a future class/access contract is supplied.
- The supplied file is the four-page `YogaRox-App-Wireframe.pdf`; the detailed written brief will govern screens not pictured in that low-fidelity wireframe.

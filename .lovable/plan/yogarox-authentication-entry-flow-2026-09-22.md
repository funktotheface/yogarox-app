# YogaRox authentication entry flow

## Build
- Replace the blank home screen with a mobile-first YogaRox welcome and login experience matching the supplied mockup.
- Add a separate create-account screen with name, email, password, and password confirmation.
- Add password visibility controls, back navigation, forgot-password feedback, and friendly inline validation.
- Keep all submission behaviour local and temporary; no accounts, storage, API calls, or authentication service will be added.

## Visual direction
- Use a warm off-white canvas, deep burgundy text, magenta actions, elegant serif display type, restrained sans-serif body type, rounded controls, and generous whitespace.
- Match the reference’s calm premium wellness character and narrow mobile composition while allowing a polished centered preview on larger screens.
- Include subtle, reduced-motion-safe transitions between login and sign-up states.

## Technical details
- Implement the two states within the existing home route so the preview remains focused on the entry flow.
- Extend the existing semantic design tokens in the global stylesheet and use those tokens throughout the interface.
- Add route-specific YogaRox metadata and preserve the current no-backend architecture.
- Verify login, sign-up, visibility toggles, back navigation, validation, and mobile/desktop presentation in the live preview.

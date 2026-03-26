# Kokuchi-kun Overwork Tool (告知くん残業ツール)

A web application designed to help VRChat event hosts and community admins batch-generate recurring Discord announcement messages with dynamic dates.

## Features

- **Batch Generation**: Select multiple dates on a calendar to instantly generate multiple announcement messages.
- **Dynamic Placeholders**: Use `<DATE>` and `<EVENT_TITLE>` in your templates to automatically inject the selected date and event title.
- **One-Click Copy**: Easily copy generated messages to your clipboard for quick pasting into Discord.
- **Admin URL Generator**: Community admins can generate custom URLs with pre-configured bot mentions, role mentions, and maximum generation limits.
- **Bilingual Support**: Fully supports both English and Japanese UI, automatically detecting the user's browser language preference.

## URL Parameters (For Admins)

You can customize the default behavior of the tool by appending the following query parameters to the URL:

- `mentionBot`: The Discord mention tag for the bot (e.g., `<@123456789>`).
- `mentionRole`: The Discord mention tag for the target role (e.g., `<@&987654321>`).
- `maxCount`: The maximum number of dates a user can select at once (default is `4`).

*Example:* `https://your-domain.com/?mentionBot=<@123>&mentionRole=<@&456>&maxCount=5`

*(Note: You can easily generate these URLs using the "Admin Tools" button in the bottom right corner of the app).*

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- shadcn/ui (Radix UI, Lucide Icons, Sonner for toasts)
- date-fns & react-day-picker

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` (or the port specified in your terminal).

## Deployment

This is a standard Client-Side Single Page Application (SPA) built with Vite. It can be deployed to any static hosting service like Vercel, Netlify, GitHub Pages, Cloudflare Pages, or Google Cloud Run.

1. Build the production assets:
   ```bash
   npm run build
   ```

2. The built files will be output to the `dist/` directory.

3. **Hosting**: Upload or connect the `dist/` directory to your preferred static hosting provider. 
   - *Note for routing*: Since this is a React SPA, ensure your hosting provider is configured to rewrite all requests to `index.html` (though this app primarily uses a single route with URL parameters).

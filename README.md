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

## Deployment to GitHub Pages (with Custom Domain)

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys your app to GitHub Pages whenever you push to the `main` or `master` branch.

### Step-by-Step Setup Guide

**1. Export and Push to GitHub**
1. In AI Studio, click the **Settings** (gear icon) or **Export** menu.
2. Choose **Export to GitHub** and follow the prompts to create a new repository on your GitHub account.

**2. Enable GitHub Pages**
1. Go to your new repository on GitHub.
2. Click on the **Settings** tab.
3. In the left sidebar, click on **Pages**.
4. Under **Build and deployment**, change the **Source** dropdown from "Deploy from a branch" to **GitHub Actions**.

**3. Trigger the First Deployment**
1. Go to the **Actions** tab in your repository.
2. You should see the "Deploy to GitHub Pages" workflow running automatically. If not, you can manually trigger it by clicking on the workflow name and selecting "Run workflow".
3. Wait for the build and deploy jobs to complete (they will turn green).

**4. Configure Your Custom Domain**
1. Go back to the **Settings > Pages** tab in your repository.
2. Scroll down to the **Custom domain** section.
3. Enter your custom domain (e.g., `tools.yourdomain.com`) and click **Save**.
4. GitHub will perform a DNS check. You need to configure your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare) to point to GitHub:
   - Create a **CNAME record** pointing your subdomain (e.g., `tools`) to `<your-github-username>.github.io`.
   - *(If using an apex/root domain like `yourdomain.com`, you'll need to configure A records pointing to GitHub's IP addresses instead. Check GitHub's documentation for the exact IPs).*
5. Once DNS propagates (can take a few minutes to a few hours), check the **Enforce HTTPS** box to secure your site with a free SSL certificate.

*(Note: If you decide NOT to use a custom domain and want to host it at `https://<username>.github.io/<repo-name>/`, you will need to update the `vite.config.ts` file to include `base: '/<repo-name>/'` before pushing to GitHub).*

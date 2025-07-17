# GitHub Issues Explorer

A single-page web application built with Next.js and React that fetches and displays open-source issues from top GitHub repositories. Perfect for developers looking to contribute to open-source projects by finding "good first issue" and "bug" labeled issues.

## Features

- 🔍 **Smart Issue Discovery**: Automatically fetches 100+ open issues from trending GitHub repositories
- 🏷️ **Advanced Filtering**: Filter by labels, repositories, and date ranges
- 📊 **Flexible Sorting**: Sort by creation date, repository name, or alphabetically
- 🔎 **Real-time Search**: Search across issue titles, descriptions, and repository names
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop screens
- ⚡ **Fast Performance**: Client-side SPA with efficient state management
- 🎨 **Clean UI**: Modern design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (configured as SPA)
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **GitHub API**: Native fetch with proper authentication
- **Build Tool**: Next.js built-in bundler

## Prerequisites

- Node.js 18.18 or later
- npm, yarn, or pnpm
- GitHub Personal Access Token (recommended for higher rate limits)

## Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd github-issues-explorer
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Environment Configuration

**IMPORTANT**: Create a \`.env.local\` file in the root directory and add your GitHub Personal Access Token:

\`\`\`env
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_github_token_here
\`\`\`

**To create a GitHub Personal Access Token:**

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: \`public_repo\` (for accessing public repositories)
4. Copy the generated token and add it to your \`.env.local\` file

**Note**: The app will work without a token but with much lower rate limits (60 requests/hour vs 5000 requests/hour with token).

### 4. Start the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

**Important**: After adding the \`.env.local\` file, make sure to restart your development server for the environment variables to take effect.

### 5. Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

\`\`\`
github-issues-explorer/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── loading.tsx        # Loading component
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ErrorMessage.tsx
│   ├── Header.tsx
│   ├── IssueCard.tsx
│   ├── IssuesList.tsx
│   ├── LoadingSpinner.tsx
│   ├── Pagination.tsx
│   └── SearchAndFilters.tsx
├── hooks/                 # Custom hooks
│   └── useIssuesStore.tsx # Zustand store
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
└── README.md             # This file
\`\`\`

## Troubleshooting

### Authentication Issues

If you see "Authentication failed" errors:

1. **Check your token**: Make sure your GitHub token is valid and not expired
2. **Restart the server**: After adding/changing the \`.env.local\` file, restart with \`npm run dev\`
3. **Check token format**: Ensure the token starts with \`ghp_\` for classic tokens
4. **Verify permissions**: Make sure your token has \`public_repo\` scope

### Rate Limit Issues

If you see "Rate limit exceeded" errors:

1. **Add a token**: Without authentication, you're limited to 60 requests/hour
2. **Wait for reset**: Rate limits reset every hour
3. **Check token**: With a valid token, you get 5000 requests/hour

### Common Setup Issues

1. **Environment variables not loading**: 
   - Make sure \`.env.local\` is in the root directory (same level as \`package.json\`)
   - Restart your development server after creating/modifying \`.env.local\`
   - Check that the variable name starts with \`NEXT_PUBLIC_\`

2. **Build errors**: 
   - Run \`npm install\` to ensure all dependencies are installed
   - Check Node.js version (requires 18.18+)
   - Clear \`.next\` directory and rebuild

## How It Works

### Data Fetching Process

1. **Repository Discovery**: The app searches for trending repositories with high star counts across popular languages (JavaScript, TypeScript, Python)
2. **Issue Extraction**: For each repository, it fetches open issues
3. **Data Transformation**: Issues are transformed into a standardized format containing:
   - Title and description (first 200 characters)
   - Labels and repository information
   - Creation date and GitHub link
4. **Real-time Updates**: Data is fetched on app startup and can be refreshed

### Authentication

The app uses GitHub Personal Access Tokens for authentication:

- **Without Token**: 60 requests/hour (may not be enough for full functionality)
- **With Token**: 5000 requests/hour (recommended)
- **Token Format**: Uses Bearer authentication with proper headers

### State Management

The app uses Zustand for state management with the following key features:

- **Centralized Store**: All application state in a single store
- **Reactive Updates**: Automatic UI updates when state changes
- **Efficient Filtering**: Client-side filtering and sorting for fast interactions
- **Pagination**: Built-in pagination support

## API Error Handling

The application includes comprehensive error handling:

### Rate Limiting
- **Without Token**: 60 requests/hour per IP
- **With Token**: 5000 requests/hour
- **Handling**: Graceful degradation with user-friendly error messages

### Network Errors
- Automatic retry logic for failed requests
- Fallback UI states for offline scenarios
- Clear error messages with suggested actions

### API Response Errors
- Validation of GitHub API responses
- Handling of malformed or missing data
- Graceful skipping of problematic repositories

## Building for Production

### Build the Application

\`\`\`bash
npm run build
# or
yarn build
# or
pnpm build
\`\`\`

### Start Production Server

\`\`\`bash
npm start
# or
yarn start
# or
pnpm start
\`\`\`

The app is configured to export as a static site, making it deployable to any static hosting service.

## Security Considerations

### Environment Variables

- Never commit \`.env.local\` to version control
- Use \`NEXT_PUBLIC_\` prefix for client-side environment variables
- Regularly rotate your GitHub tokens
- Use minimal required permissions for tokens

## License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy coding! 🚀**

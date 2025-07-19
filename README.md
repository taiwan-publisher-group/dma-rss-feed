# DMA RSS Feed

A Cloudflare Worker that converts the DMA (Taiwan Digital Media and Marketing Association) news API into an RSS feed format.

## Overview

This project fetches news from the Taiwan Digital Media and Marketing Association API and converts it into a standard RSS XML feed, making it easier to consume DMA news updates through RSS readers and other applications.

## Features

- Fetches latest news from DMA Taiwan API
- Converts JSON API response to RSS XML format
- Deployed as a Cloudflare Worker for global availability
- TypeScript implementation with proper type definitions

## Prerequisites

- Node.js (version 18 or higher recommended)
- pnpm package manager
- Cloudflare account (for deployment)

## Installation

1. Clone the repository:
```bash
git clone git@github.com:taiwan-publisher-group/dma-rss-feed.git
cd dma-rss-feed
```

2. Install dependencies:
```bash
pnpm install
```

## Development

Start the development server:
```bash
pnpm dev
# or
pnpm start
```

This will start the Wrangler development server, allowing you to test the worker locally.

## Deployment

Deploy to Cloudflare Workers:
```bash
pnpm deploy
```

Make sure you have configured your Cloudflare credentials with Wrangler before deploying.

## API Endpoints

The worker is deployed at: https://dma-rss-feed.dlackty.workers.dev/

Once deployed, the worker provides the following endpoint:

- `GET /` - Returns the RSS feed XML with latest DMA news

## Project Structure

```
dma-rss-feed/
├── src/
│   └── index.ts          # Main worker code
├── package.json          # Project dependencies and scripts
├── wrangler.jsonc        # Cloudflare Worker configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Configuration

The worker is configured through `wrangler.jsonc`:
- Worker name: `dma-rss-feed`
- Compatibility date: `2025-07-17`
- Observability enabled for monitoring

## Data Source

This project fetches data from the official DMA Taiwan news API:
- API Endpoint: `https://www.dma.org.tw/api/news/1?search=`
- Returns news items with title, subtitle, thumbnail, publication date, and links

## RSS Feed Format

The generated RSS feed includes:
- Channel title and description
- Individual news items with:
  - Title
  - Description
  - Publication date
  - Link to original article
  - Image (when available)

## Scripts

- `pnpm dev` - Start development server
- `pnpm start` - Alias for dev command
- `pnpm deploy` - Deploy to Cloudflare Workers
- `pnpm cf-typegen` - Generate Cloudflare Worker types

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

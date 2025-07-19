interface NewsItem {
	id: string;
	title: string;
	description: string;
	pubDate: string;
	link: string;
	imageUrl?: string;
}

interface DMAApiResponse {
	next: boolean;
	list: Array<{
		id: number;
		title: string;
		subtitle: string;
		thumbnail: string;
		published_at: string;
		link: string;
	}>;
}

async function fetchDMANews(): Promise<NewsItem[]> {
	try {
		const response = await fetch("https://www.dma.org.tw/api/news/1?search=", {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: DMAApiResponse = await response.json();
		return parseNewsFromAPI(data);
	} catch (error) {
		console.error("Error fetching DMA news:", error);
		return [];
	}
}

function parseNewsFromAPI(data: DMAApiResponse): NewsItem[] {
	const newsItems: NewsItem[] = [];

	for (const item of data.list) {
		// Convert published_at to proper date format
		const pubDate = new Date(item.published_at).toUTCString();

		// Build image URL if thumbnail exists
		let imageUrl: string | undefined;
		if (item.thumbnail && item.thumbnail.trim() !== "") {
			imageUrl = `https://www.dma.org.tw/uploads/post/${item.thumbnail}`;
		}

		newsItems.push({
			id: item.id.toString(),
			title: item.title,
			description: item.subtitle,
			pubDate,
			link: `https://www.dma.org.tw/newsPost/${item.id}`,
			imageUrl,
		});
	}

	return newsItems;
}

function generateRSSFeed(newsItems: NewsItem[], requestUrl: string): string {
	const now = new Date().toUTCString();

	let rssItems = "";
	for (const item of newsItems) {
		let imageTag = "";
		if (item.imageUrl) {
			imageTag = `<enclosure url="${item.imageUrl}" type="image/jpeg" />`;
		}

		rssItems += `
		<item>
			<title><![CDATA[${item.title}]]></title>
			<description><![CDATA[${item.description}]]></description>
			<link>${item.link}</link>
			<guid isPermaLink="true">${item.link}</guid>
			<pubDate>${item.pubDate}</pubDate>
			${imageTag}
		</item>`;
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>DMA 台北市數位行銷經營協會 - 協會活動訊息</title>
		<description>DMA 台北市數位行銷經營協會最新活動訊息</description>
		<link>https://www.dma.org.tw/news/1</link>
		<atom:link href="${requestUrl}" rel="self" type="application/rss+xml" />
		<language>zh-TW</language>
		<lastBuildDate>${now}</lastBuildDate>
		<pubDate>${now}</pubDate>
		<ttl>60</ttl>
		${rssItems}
	</channel>
</rss>`;
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		try {
			// Handle CORS preflight requests
			if (request.method === "OPTIONS") {
				return new Response(null, {
					status: 200,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type",
					},
				});
			}

			// Only handle GET requests
			if (request.method !== "GET") {
				return new Response("Method not allowed", { status: 405 });
			}

			console.log("Fetching DMA news...");
			const newsItems = await fetchDMANews();
			console.log(`Found ${newsItems.length} news items`);

			if (newsItems.length === 0) {
				return new Response("No news items found", {
					status: 500,
					headers: {
						"Content-Type": "text/plain; charset=utf-8",
						"Access-Control-Allow-Origin": "*",
					},
				});
			}

			const rssContent = generateRSSFeed(newsItems, request.url);

			return new Response(rssContent, {
				headers: {
					"Content-Type": "application/rss+xml; charset=utf-8",
					"Access-Control-Allow-Origin": "*",
					"Cache-Control": "public, max-age=3600", // Cache for 1 hour
				},
			});
		} catch (error) {
			console.error("Error generating RSS feed:", error);
			return new Response(`Error generating RSS feed: ${error}`, {
				status: 500,
				headers: {
					"Content-Type": "text/plain; charset=utf-8",
					"Access-Control-Allow-Origin": "*",
				},
			});
		}
	},
} satisfies ExportedHandler<Env>;

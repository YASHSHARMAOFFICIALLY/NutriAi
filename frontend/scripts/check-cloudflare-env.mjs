const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  console.error("NEXT_PUBLIC_API_URL is required for Cloudflare deployment.");
  console.error("Set it to your Render backend URL, for example: https://your-backend.onrender.com");
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(apiUrl);
} catch {
  console.error(`NEXT_PUBLIC_API_URL must be a valid URL. Received: ${apiUrl}`);
  process.exit(1);
}

const host = parsed.hostname.toLowerCase();
if (parsed.protocol !== "https:" || host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
  console.error("NEXT_PUBLIC_API_URL must be a public HTTPS backend URL for Cloudflare deployment.");
  console.error(`Received: ${apiUrl}`);
  process.exit(1);
}

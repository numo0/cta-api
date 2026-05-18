import type { Handler, HandlerEvent } from "@netlify/functions";

const IMAGE_URL = "https://img.cryptoteddies.xyz/static/HoneyJar/honeyjar.gif";

const METADATA = {
  name: "Honey Jar",
  description:
    "A Honey Jar from the CryptoTeddies burn economy. Collect 3 Honey Jars to redeem a handmade 1/1 OG CryptoTeddy — or spend 1 Jar to evolve and upgrade traits on an existing CryptoTeddy.",
  image: IMAGE_URL,
  attributes: [
    { trait_type: "Type", value: "Honey Jar" },
  ],
};

export const handler: Handler = async (_event: HandlerEvent) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
    body: JSON.stringify(METADATA),
  };
};

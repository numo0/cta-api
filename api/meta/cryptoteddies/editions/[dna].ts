import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";
import { CONTRACTS, META_ABI, decodeDataURI, getProvider, patchImageWithS3 } from "../_shared";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { dna } = req.query as { dna: string };
    if (!dna || isNaN(Number(dna))) return res.status(400).json({ error: "Bad dna" });

    const provider = getProvider();
    const metaC = new ethers.Contract(CONTRACTS.METADATA, META_ABI, provider);

    // editions flow doesn't rely on a unique tokenId; pass 0 (or dna) as first arg if needed
    const tokenURI: string = await metaC.tokenURI(0, dna);
    const meta = decodeDataURI(tokenURI);
    if (!meta) return res.status(502).json({ error: "Unexpected tokenURI format" });

    patchImageWithS3(meta, dna);
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(meta);
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Internal error", detail: e?.message });
  }
}

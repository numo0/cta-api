import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";
import { CONTRACTS, ERC_ABI, META_ABI, decodeDataURI, getProvider, patchImageWithS3 } from "./_shared";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { tokenId } = req.query as { tokenId: string };
    if (!tokenId || isNaN(Number(tokenId))) return res.status(400).json({ error: "Bad tokenId" });

    const provider = getProvider();

    const nft = new ethers.Contract(CONTRACTS.ERC721, ERC_ABI, provider);
    const dnaBN = await nft.getDNA(tokenId);
    const dna = dnaBN.toString();
    if (dna === "0") return res.status(404).json({ error: "Bad token ID: " + tokenId });

    const metaC = new ethers.Contract(CONTRACTS.METADATA, META_ABI, provider);
    const tokenURI: string = await metaC.tokenURI(tokenId, dna);

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

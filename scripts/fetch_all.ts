import 'dotenv/config';
import { ethers } from 'ethers';
import axios from 'axios';
import { mkdir, writeFile, stat } from 'fs/promises';
import { dirname, join } from 'path';

const CONTRACTS = {
  ERC1155: '0xD9FDF19006A6dEce42CED19EA195D2116c8ee717',
  ERC721:  '0x441698f426365Bbb1c16a46c1b722461567925AA',
  METADATA:'0x5Ca4322f29FAb81FbECb1ce002b9e516eaA9b6cE'
};

const ERC_ABI  = ['function getDNA(uint256 tokenId) view returns (uint256)'];

const RPC_URL = process.env.RPC_URL!;
if (!RPC_URL) throw new Error('Missing RPC_URL env var');

const SOURCE_IMAGE_BASE = process.env.SOURCE_IMAGE_BASE || 'https://creco-images.s3.amazonaws.com/static/CryptoTeddies/';
const OUT_DIR = process.env.OUT_DIR || 'images/CryptoTeddies';

function getArg(name: string, def?: number) {
  const i = process.argv.findIndex(a => a === `--${name}`);
  if (i >= 0 && process.argv[i+1]) return Number(process.argv[i+1]);
  return def;
}

const e721From = getArg('erc721-from');
const e721To   = getArg('erc721-to');
const edFrom   = getArg('editions-from');
const edTo     = getArg('editions-to');

if (e721From && !e721To) throw new Error('Provide --erc721-to with --erc721-from');
if (edFrom && !edTo) throw new Error('Provide --editions-to with --editions-from');

const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));

async function fileExists(path:string) {
  try { await stat(path); return true; } catch { return false; }
}

async function ensureDir(path: string) {
  await mkdir(path, { recursive: true });
}

async function downloadImage(dna: string) {
  const url = `${SOURCE_IMAGE_BASE}${dna}.gif`;
  const out = join(OUT_DIR, `${dna}.gif`);
  if (await fileExists(out)) return { dna, status: 'skip-exists' as const };

  const res = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer', validateStatus: () => true });
  if (res.status !== 200) return { dna, status: `http-${res.status}` as const };

  await ensureDir(dirname(out));
  await writeFile(out, Buffer.from(res.data));
  return { dna, status: 'ok' as const };
}

async function run() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const erc721 = new ethers.Contract(CONTRACTS.ERC721, ERC_ABI, provider);
  const erc1155 = new ethers.Contract(CONTRACTS.ERC1155, ERC_ABI, provider);

  // ERC-721 range
  if (typeof e721From === 'number' && typeof e721To === 'number') {
    console.log(`ERC721: fetching tokenIds ${e721From}..${e721To}`);
    for (let id = e721From; id <= e721To; id++) {
      try {
        const dna = (await erc721.getDNA(id)).toString();
        if (dna === '0') { console.log(`721 #${id}: dna=0 (skip)`); continue; }
        const r = await downloadImage(dna);
        console.log(`721 #${id}: dna=${dna} -> ${r.status}`);
      } catch (e:any) {
        console.log(`721 #${id}: error ${e.message}`);
      }
      await sleep(120); // be gentle
    }
  }

  // Editions range (ERC-1155)
  if (typeof edFrom === 'number' && typeof edTo === 'number') {
    console.log(`Editions: fetching editionIds ${edFrom}..${edTo}`);
    for (let eid = edFrom; eid <= edTo; eid++) {
      try {
        const dna = (await erc1155.getDNA(eid)).toString();
        if (dna === '0') { console.log(`ED #${eid}: dna=0 (skip)`); continue; }
        const r = await downloadImage(dna);
        console.log(`ED #${eid}: dna=${dna} -> ${r.status}`);
      } catch (e:any) {
        console.log(`ED #${eid}: error ${e.message}`);
      }
      await sleep(120);
    }
  }

  console.log('Done.');
}

run().catch(e=>{ console.error(e); process.exit(1); });

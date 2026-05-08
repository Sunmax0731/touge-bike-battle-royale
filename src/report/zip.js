import fs from "node:fs";
import path from "node:path";
const date = { time: 0, date: ((2026 - 1980) << 9) | (1 << 5) | 1 };
const table = new Uint32Array(256).map((_, i) => { let c = i; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const u16 = (v) => { const b = Buffer.alloc(2); b.writeUInt16LE(v); return b; };
const u32 = (v) => { const b = Buffer.alloc(4); b.writeUInt32LE(v >>> 0); return b; };
function crc32(buf) { let crc = 0xffffffff; for (const x of buf) crc = table[(crc ^ x) & 0xff] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
export function createDeterministicZip(rootDir, entries, outFile) {
  const locals = [], centrals = []; let offset = 0;
  for (const entry of [...entries].sort()) {
    const data = fs.readFileSync(path.join(rootDir, entry)); const name = Buffer.from(entry.replace(/\\/g, "/"), "utf8"); const crc = crc32(data);
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(date.time), u16(date.date), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name]);
    locals.push(local, data);
    centrals.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(date.time), u16(date.date), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
    offset += local.length + data.length;
  }
  const l = Buffer.concat(locals), c = Buffer.concat(centrals);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, Buffer.concat([l, c, u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(c.length), u32(l.length), u16(0)]));
}

/** ZIP sin compresión (método STORE). Suficiente para empaquetar archivos en el navegador. */

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

const enc = new TextEncoder();

export async function buildZipBlob(entries: ZipEntry[]): Promise<Blob> {
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = enc.encode(entry.name);
    const { data } = entry;
    const crc = crc32(data);
    const local = localHeader(nameBytes, data.length, crc);
    parts.push(local, data);
    central.push(centralHeader(nameBytes, data.length, crc, offset));
    offset += local.length + data.length;
  }

  const centralSize = central.reduce((n, c) => n + c.length, 0);
  parts.push(...central, endOfCentral(entries.length, centralSize, offset));

  return new Blob(parts as BlobPart[], { type: 'application/zip' });
}

function localHeader(name: Uint8Array, size: number, crc: number): Uint8Array {
  const h = new Uint8Array(30 + name.length);
  const v = new DataView(h.buffer);
  v.setUint32(0, 0x04034b50, true);
  v.setUint16(8, 0, true); // STORE
  v.setUint32(14, crc, true);
  v.setUint32(18, size, true);
  v.setUint32(22, size, true);
  v.setUint16(26, name.length, true);
  h.set(name, 30);
  return h;
}

function centralHeader(
  name: Uint8Array,
  size: number,
  crc: number,
  offset: number,
): Uint8Array {
  const h = new Uint8Array(46 + name.length);
  const v = new DataView(h.buffer);
  v.setUint32(0, 0x02014b50, true);
  v.setUint16(10, 0, true); // STORE
  v.setUint32(16, crc, true);
  v.setUint32(20, size, true);
  v.setUint32(24, size, true);
  v.setUint16(28, name.length, true);
  v.setUint32(42, offset, true);
  h.set(name, 46);
  return h;
}

function endOfCentral(count: number, centralSize: number, offset: number): Uint8Array {
  const h = new Uint8Array(22);
  const v = new DataView(h.buffer);
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, count, true);
  v.setUint16(10, count, true);
  v.setUint32(12, centralSize, true);
  v.setUint32(16, offset, true);
  return h;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = CRC_TABLE[(c ^ data[i]!) & 0xff]! ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

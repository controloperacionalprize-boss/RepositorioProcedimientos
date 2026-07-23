import { Procedimiento } from '../../core/models/procedimiento';
import { ProcedimientosStore } from '../../core/services/procedimientos.store';
import { buildZipBlob, ZipEntry } from '../../shared/utils/zip-store';

const textEnc = new TextEncoder();

export function descargarProcedimiento(
  store: ProcedimientosStore,
  doc: Procedimiento,
): void {
  const archivo = store.archivoDe(doc.id);
  if (archivo) {
    triggerDownload(URL.createObjectURL(archivo), archivo.name);
    return;
  }

  const blob = new Blob([fichaTexto(doc)], { type: 'text/plain;charset=utf-8' });
  triggerDownload(URL.createObjectURL(blob), `${doc.codigo}.txt`);
}

/** Empaqueta los procedimientos indicados en un ZIP con índice + archivos. */
export async function exportarProcedimientosPaquete(
  store: ProcedimientosStore,
  items: Procedimiento[],
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const usedNames = new Set<string>();
  const entries: ZipEntry[] = [
    {
      name: 'INDICE.txt',
      data: textEnc.encode(indiceTexto(items, store)),
    },
  ];

  for (const doc of items) {
    const archivo = store.archivoDe(doc.id);
    if (archivo) {
      const data = new Uint8Array(await archivo.arrayBuffer());
      const name = uniqueName(
        `documentos/${safeName(doc.codigo)}_${safeName(archivo.name)}`,
        usedNames,
      );
      entries.push({ name, data });
    } else {
      const name = uniqueName(`documentos/${safeName(doc.codigo)}.txt`, usedNames);
      entries.push({ name, data: textEnc.encode(fichaTexto(doc)) });
    }
  }

  const blob = await buildZipBlob(entries);
  triggerDownload(URL.createObjectURL(blob), nombrePaquete());
}

function fichaTexto(doc: Procedimiento): string {
  return [
    `Código: ${doc.codigo}`,
    `Título: ${doc.titulo}`,
    `Versión: ${doc.version}`,
    `Área: ${doc.area}`,
    `Estado: ${doc.estado}`,
    `Fecha: ${doc.fecha}`,
    '',
    doc.archivoNombre
      ? `(Archivo de referencia: ${doc.archivoNombre} — no disponible en esta sesión)`
      : '(Sin archivo cargado — ficha de inventario)',
  ].join('\n');
}

function indiceTexto(items: Procedimiento[], store: ProcedimientosStore): string {
  const lineas = [
    'Inventario de procedimientos',
    `Generado: ${new Date().toLocaleString('es-PE')}`,
    `Documentos: ${items.length}`,
    '',
    'Código | Título | Versión | Fecha | Área | Estado | Archivo en paquete',
    '-'.repeat(72),
  ];

  for (const d of items) {
    const enPaquete = store.archivoDe(d.id)
      ? d.archivoNombre ?? 'sí'
      : `${d.codigo}.txt (ficha)`;
    lineas.push(
      `${d.codigo} | ${d.titulo} | v${d.version} | ${d.fecha} | ${d.area} | ${d.estado} | ${enPaquete}`,
    );
  }

  return lineas.join('\n');
}

function nombrePaquete(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `procedimientos_${y}-${m}-${day}.zip`;
}

function safeName(value: string): string {
  return value.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim() || 'archivo';
}

function uniqueName(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let i = 2;
  let candidate = `${base}_${i}${ext}`;
  while (used.has(candidate)) {
    i += 1;
    candidate = `${base}_${i}${ext}`;
  }
  used.add(candidate);
  return candidate;
}

function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

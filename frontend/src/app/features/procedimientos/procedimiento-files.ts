import { Procedimiento } from '../../core/models/procedimiento';
import { ProcedimientosStore } from '../../core/services/procedimientos.store';

export function descargarProcedimiento(
  store: ProcedimientosStore,
  doc: Procedimiento,
): void {
  const archivo = store.archivoDe(doc.id);
  if (archivo) {
    triggerDownload(URL.createObjectURL(archivo), archivo.name);
    return;
  }

  const body = [
    `Código: ${doc.codigo}`,
    `Título: ${doc.titulo}`,
    `Versión: ${doc.version}`,
    `Área: ${doc.area}`,
    `Estado: ${doc.estado}`,
    `Fecha: ${doc.fecha}`,
    '',
    '(Sin archivo cargado — ficha demo)',
  ].join('\n');

  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  triggerDownload(URL.createObjectURL(blob), `${doc.codigo}.txt`);
}

export function exportarProcedimientosCsv(items: Procedimiento[]): void {
  const rows = [
    ['codigo', 'titulo', 'version', 'fecha', 'area', 'estado', 'archivo'],
    ...items.map((d) => [
      d.codigo,
      d.titulo,
      String(d.version),
      d.fecha,
      d.area,
      d.estado,
      d.archivoNombre ?? '',
    ]),
  ];
  const csv = rows
    .map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(URL.createObjectURL(blob), 'procedimientos-demo.csv');
}

function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

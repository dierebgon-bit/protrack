import { useState, useRef, useCallback } from 'react';
import { Badge, Modal, Textarea, Btn } from './UI';
import { formatDate } from '../utils/helpers';
import { FILE_ICONS } from '../utils/constants';
import { supabase } from '../lib/supabase';

// ── Detectar tipo legible desde MIME ─────────────────────────
function mimeToType(mime = '') {
  if (mime.startsWith('image/'))                          return 'Imagen';
  if (mime === 'application/pdf')                         return 'PDF';
  if (mime.includes('word') || mime.includes('document')) return 'Documento';
  if (mime.includes('sheet') || mime.includes('excel'))   return 'Documento';
  if (mime.includes('presentation'))                      return 'Documento';
  return 'Documento';
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Ruta en el bucket: protrack-files/<userId>/<projectId>/<timestamp>-<filename>
function storagePath(userId, projectId, filename) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${projectId}/${Date.now()}-${safe}`;
}

/* ════════════════════════════════════════════════════════════ */
export default function FilesTab({ project, onUpdate, userId }) {
  const [showModal, setShowModal]   = useState(false);
  const [comment,   setComment]     = useState('');
  const [dragOver,  setDragOver]    = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [uploadErr, setUploadErr]   = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // File object
  const fileInputRef = useRef(null);

  /* ── Seleccionar archivo (input o drop) ── */
  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadErr('');
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  /* ── Subir a Supabase Storage ── */
  const upload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadErr('');

    try {
      const path = storagePath(userId, project.id, selectedFile.name);

      const { error: uploadError } = await supabase.storage
        .from('protrack-files')
        .upload(path, selectedFile, { upsert: false });

      if (uploadError) throw uploadError;

      // Obtener URL pública (o firmada si el bucket es privado)
      const { data: urlData } = supabase.storage
        .from('protrack-files')
        .getPublicUrl(path);

      const newFile = {
        id:          Date.now(),
        name:        selectedFile.name,
        type:        mimeToType(selectedFile.type),
        size:        selectedFile.size,
        date:        new Date().toISOString().split('T')[0],
        comment:     comment,
        storagePath: path,
        url:         urlData?.publicUrl || null,
      };

      onUpdate({ ...project, files: [...project.files, newFile] });
      closeModal();
    } catch (err) {
      console.error('[ProTrack] Error subiendo archivo:', err);
      setUploadErr(
        err.message?.includes('Bucket not found')
          ? 'Bucket "protrack-files" no encontrado. Sigue las instrucciones de configuración de Storage.'
          : `Error al subir: ${err.message}`
      );
    } finally {
      setUploading(false);
    }
  };

  /* ── Eliminar archivo ── */
  const del = async (file) => {
    // Borrar de Storage si tiene path
    if (file.storagePath) {
      await supabase.storage.from('protrack-files').remove([file.storagePath]);
    }
    onUpdate({ ...project, files: project.files.filter((f) => f.id !== file.id) });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
    setComment('');
    setUploadErr('');
    setUploading(false);
  };

  /* ════════════════════════════════════════════════════════ */
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn onClick={() => setShowModal(true)}>+ Subir archivo</Btn>
      </div>

      {/* ── Grid de archivos ── */}
      {project.files.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#bbb', padding: '40px 0', fontSize: 14 }}>
          No hay archivos. Sube el primero.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {project.files.map((f) => (
            <FileCard key={f.id} file={f} onDelete={() => del(f)} />
          ))}
        </div>
      )}

      {/* ── Modal de subida ── */}
      {showModal && (
        <Modal title="Subir archivo" onClose={closeModal}>

          {/* Zona de drop */}
          <div
            onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? '#111' : selectedFile ? '#1D9E75' : '#d0d0d0'}`,
              borderRadius: 12,
              padding: '28px 20px',
              textAlign: 'center',
              cursor: selectedFile ? 'default' : 'pointer',
              background: dragOver ? '#f5f5f5' : selectedFile ? '#f0fdf8' : '#fafafa',
              transition: 'all 0.15s',
              marginBottom: 16,
            }}
          >
            {selectedFile ? (
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>
                  {FILE_ICONS[mimeToType(selectedFile.type)] || '📁'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', wordBreak: 'break-word' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  {formatSize(selectedFile.size)}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  style={{ marginTop: 10, background: 'none', border: '1px solid #e0e0e0',
                    borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12,
                    color: '#666', fontFamily: 'inherit' }}>
                  Cambiar archivo
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 4 }}>
                  Arrastra aquí tu archivo
                </div>
                <div style={{ fontSize: 13, color: '#aaa' }}>o pulsa para seleccionar</div>
                <div style={{ fontSize: 11, color: '#ccc', marginTop: 8 }}>
                  PDF, imágenes, documentos, facturas…
                </div>
              </div>
            )}
          </div>

          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {/* Comentario */}
          <Textarea
            label="Comentario opcional"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Descripción del archivo…"
          />

          {/* Error */}
          {uploadErr && (
            <div style={{ background: '#FCEBEB', border: '1px solid #F09595', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: 14 }}>
              {uploadErr}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="secondary" onClick={closeModal} disabled={uploading}>Cancelar</Btn>
            <Btn onClick={upload} disabled={!selectedFile || uploading}>
              {uploading ? 'Subiendo…' : 'Subir archivo'}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Tarjeta individual de archivo ─────────────────────────── */
function FileCard({ file, onDelete }) {
  const icon = FILE_ICONS[file.type] || '📁';

  return (
    <div style={{ background: '#fff', border: '1.5px solid #f0f0f0', borderRadius: 12,
      padding: 16, position: 'relative', transition: 'border-color 0.15s, transform 0.15s' }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = '#d0d0d0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={(e)  => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.transform = 'none'; }}>

      {/* Botón eliminar */}
      <button onClick={onDelete}
        style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none',
          cursor: 'pointer', color: '#ccc', fontSize: 18, lineHeight: 1, padding: 2 }}>
        ✕
      </button>

      {/* Icono */}
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>

      {/* Nombre */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 6,
        wordBreak: 'break-word', paddingRight: 20 }}>
        {file.name}
      </div>

      {/* Badge tipo */}
      <Badge label={file.type} color="#185FA5" bg="#E6F1FB" />

      {/* Meta */}
      <div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>
        {formatDate(file.date)}
        {file.size ? <span style={{ marginLeft: 6 }}>· {formatSize(file.size)}</span> : null}
      </div>

      {/* Comentario */}
      {file.comment && (
        <div style={{ fontSize: 12, color: '#666', marginTop: 6, fontStyle: 'italic',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {file.comment}
        </div>
      )}

      {/* Botón abrir/descargar (solo si tiene URL) */}
      {file.url && (
        <a href={file.url} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12,
            padding: '6px 10px', background: '#f5f5f5', borderRadius: 7, textDecoration: 'none',
            fontSize: 12, fontWeight: 600, color: '#333', border: '1px solid #eee',
            transition: 'background 0.15s' }}
          onMouseOver={(e) => e.currentTarget.style.background = '#ebebeb'}
          onMouseOut={(e)  => e.currentTarget.style.background = '#f5f5f5'}>
          <span>↓</span> Abrir / Descargar
        </a>
      )}
    </div>
  );
}


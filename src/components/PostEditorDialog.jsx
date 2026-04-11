import { useEffect, useState } from 'react';
import FormInput from './FormInput';

export default function PostEditorDialog({
  open,
  title,
  initialData,
  onClose,
  onSubmit,
  submitting = false,
}) {
  const [form, setForm] = useState({ title: '', body: '', summary: '', tags: [] });
  const [file, setFile] = useState(null);
  const [keepExistingImage, setKeepExistingImage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      title: initialData?.title || '',
      body: initialData?.body || '',
      summary: initialData?.summary || '',
      tags: initialData?.tags || [],
    });
    setKeepExistingImage(initialData?.imageUrl || '');
    setFile(null);
    setError('');
  }, [open, initialData]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError('Both title and content are required.');
      return;
    }
    setError('');
    const ok = await onSubmit({
      title: form.title.trim(),
      body: form.body.trim(),
      summary: form.summary.trim(),
      tags: form.tags,
      imageFile: file,
      imageUrl: keepExistingImage,
    });
    if (ok) onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box modal-lg glass-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button type="button" className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Title field */}
          <FormInput
            label="Title"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Post title..."
          />

          {/* Cover Image */}
          <label className="form-input upload-field">
            <span className="form-input__label">Cover Image</span>
            <span className="upload-visual">
              <span className="upload-title">
                {file ? file.name : 'Choose a replacement image'}
              </span>
              <span className="upload-hint">
                {file
                  ? 'Ready to upload when you save'
                  : 'Drop in a cleaner hero image if you want to update the post'}
              </span>
            </span>
            <input
              className="field react-field upload-native"
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>

          {keepExistingImage && !file ? (
            <div className="image-meta">
              <img className="image-preview" src={keepExistingImage} alt="Current cover" />
              <div className="image-meta-text">
                <p className="results-meta">Current image attached.</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setKeepExistingImage('')}
                >
                  Remove Image
                </button>
              </div>
            </div>
          ) : null}

          {file ? (
            <div className="image-meta">
              <div className="image-meta-text">
                <p className="results-meta">{file.name} selected. It will upload on save.</p>
              </div>
            </div>
          ) : null}

          {/* Body */}
          <FormInput
            label="Story"
            multiline
            rows={6}
            value={form.body}
            onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
            placeholder="Share your thoughts..."
          />

          {error ? <p className="inline-error">{error}</p> : null}

          <button type="submit" className="btn-publish" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

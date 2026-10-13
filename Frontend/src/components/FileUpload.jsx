import { useRef, useState } from 'react';

export default function FileUpload({ file, onChange, label = 'Proof of Payment' }) {
  const input = useRef(null);
  const [drag, setDrag] = useState(false);

  const pick = (f) => f && onChange(f);

  return (
    <div>
      <p className="field-label">{label}</p>
      <div
        className={`dropzone ${drag ? 'drag' : ''}`}
        onClick={() => input.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && input.current.click()}
      >
        <span className="dropzone-btn">Upload</span>
        <small>{file ? file.name : 'Choose a file or drag & drop it here'}</small>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          hidden
          onChange={(e) => pick(e.target.files[0])}
        />
      </div>
    </div>
  );
}
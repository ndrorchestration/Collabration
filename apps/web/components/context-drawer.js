'use client';

import { useRef } from 'react';

export function ContextDrawer({ label = 'View context', children }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="context-trigger"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>
      <dialog
        ref={dialogRef}
        className="context-drawer"
        aria-label={label}
        onClose={() => triggerRef.current?.focus()}
      >
        <button type="button" className="context-drawer__close" onClick={close} aria-label="Close context">
          Close
        </button>
        <div className="context-drawer__content">{children}</div>
      </dialog>
    </>
  );
}

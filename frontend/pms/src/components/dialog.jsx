// @/components/ui/dialog.jsx
import React from "react";

// The main Dialog wrapper
export function Dialog({ open, onOpenChange, children }) {
  // If 'open' is false, don't render anything
  if (!open) return null;

  // Clicking the background overlay will close the dialog
  const handleOverlayClick = () => {
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleOverlayClick}
      />
      {/* Dialog content */}
      <div className="relative z-10 w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}

// The DialogContent wrapper (styles the dialog container)
export function DialogContent({ children }) {
  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg p-6">
      {children}
    </div>
  );
}

// The DialogHeader section
export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

// The DialogTitle (usually a heading inside the header)
export function DialogTitle({ children }) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}

// The DialogFooter (for action buttons, etc.)
export function DialogFooter({ children }) {
  return (
    <div className="mt-4 flex justify-end space-x-2">
      {children}
    </div>
  );
}

// Minimal toast event bus — paired with <Toaster /> in App.jsx.
// Avoids pulling in an extra dependency for a handful of success/error messages.

const listeners = new Set();
let idCounter = 0;

function emit(type, message) {
  const item = { id: ++idCounter, type, message };
  listeners.forEach((fn) => fn(item));
}

export const toast = {
  success: (message) => emit('success', message),
  error: (message) => emit('error', message),
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

/**
 * GSI singleton — call initialize() exactly once globally.
 * All subsequent calls just update the callback via a stored ref
 * and re-render the button, without calling initialize() again.
 */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

// The single stored callback ref — updated by each page/component that needs it
let _credentialCallback: ((response: any) => void) | null = null;

function _masterCallback(response: any) {
  _credentialCallback?.(response);
}

/**
 * Initialize GSI once. Safe to call from multiple components —
 * subsequent calls only update the callback, never re-initialize.
 */
export function initGSI(callback: (response: any) => void) {
  if (typeof window === 'undefined') return;
  _credentialCallback = callback;

  const g = (window as any).google;
  if (!g?.accounts?.id) return;

  if (!(window as any).__gsiInitDone) {
    g.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: _masterCallback,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    (window as any).__gsiInitDone = true;
  }
  // No else — never call initialize() again
}

/**
 * Render the GSI button into a container element.
 */
export function renderGSIButton(container: HTMLElement | null, width = 300) {
  if (!container) return;
  const g = (window as any).google;
  if (!g?.accounts?.id) return;
  g.accounts.id.renderButton(container, {
    theme: 'filled_black',
    size: 'large',
    shape: 'pill',
    width,
    text: 'continue_with',
    logo_alignment: 'left',
  });
}

/**
 * Poll until GSI script is ready, then run callback.
 * Returns a cleanup function.
 */
export function whenGSIReady(fn: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  if ((window as any).google?.accounts?.id) {
    fn();
    return () => {};
  }
  const timer = setInterval(() => {
    if ((window as any).google?.accounts?.id) {
      clearInterval(timer);
      fn();
    }
  }, 100);
  return () => clearInterval(timer);
}

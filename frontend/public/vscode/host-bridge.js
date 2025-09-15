/**
 * host-bridge.js
 * Placeholder message bridge to allow the parent app to compile/run before
 * the official VS Code Web workbench (web-min) is dropped into /public/vscode.
 *
 * When you replace this folder with the real build:
 *  - Keep this file and ensure it is loaded by index.html (or merge the bridge logic
 *    into a custom extension/initializer within the workbench).
 *  - The real workbench script should:
 *      - postMessage({ type: 'vscode-ready' }) once the workbench is initialized
 *      - listen for { type: 'init-workspace' } and use a memfs provider to seed files
 *      - listen for { type: 'set-theme', themeId } and switch themes accordingly
 */

(function () {
  const log = (...args) => console.log('[VSCodeHostBridge]', ...args);

  // Simulate readiness so the parent can proceed with init
  function signalReadySoon() {
    // Give the page a tick to load UI
    setTimeout(() => {
      try {
        window.parent && window.parent.postMessage({ type: 'vscode-ready' }, '*');
        log('signaled vscode-ready (placeholder)');
      } catch (e) {
        log('error signaling ready', e);
      }
    }, 300);
  }

  // Handle messages from parent
  function onMessage(ev) {
    const msg = ev.data;
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'host-hello': {
        log('host-hello received');
        break;
      }
      case 'init-workspace': {
        // In placeholder, we cannot seed a real VS Code FS. We just log.
        // Real implementation (in VS Code Web) should:
        //  - register memfs provider
        //  - create files msg.files at msg.rootUri
        //  - open msg.primaryFile in editor
        log('init-workspace received (placeholder)', {
          rootUri: msg.rootUri,
          primaryFile: msg.primaryFile,
          filesCount: Array.isArray(msg.files) ? msg.files.length : 0,
          theme: msg.theme,
          options: msg.options || {},
        });
        break;
      }
      case 'set-theme': {
        // Real implementation should call workbench theme service.
        log('set-theme requested (placeholder)', msg.themeId);
        break;
      }
      default:
        // ignore
        break;
    }
  }

  window.addEventListener('message', onMessage);
  signalReadySoon();
})();
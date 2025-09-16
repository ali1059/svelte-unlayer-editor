<script lang="ts">
  import UnlayerEditor from './lib/UnlayerEditor.svelte';
  import type {
    UnlayerDesign,
    UnlayerExportData,
    UnlayerEditorInstance,
    UnlayerOptions
  } from './lib/types';

  let unlayerEditor: UnlayerEditor;

  // Application state
  let currentDesign = $state<UnlayerDesign | null>(null);
  let isExporting = $state(false);
  let previewHtml = $state('');
  let showPreview = $state(false);
  let editorStatus = $state('Initializing...');

  const tools = {};

  const options: UnlayerOptions = {
    displayMode: 'email'
  };

  // Sample design for demo
  const sampleDesign: UnlayerDesign = {
    counters: { u_column: 1, u_row: 1, u_content_text: 1 },
    body: {
      rows: [
        {
          id: 'row-1',
          cells: [1],
          columns: [
            {
              id: 'column-1',
              contents: [
                {
                  id: 'text-1',
                  type: 'text',
                  values: {
                    containerPadding: '20px',
                    fontSize: '18px',
                    textAlign: 'center',
                    lineHeight: '140%',
                    text: `
                      <h1 style="color: #3b82f6; text-align: center; margin-bottom: 20px;">
                        🚀 Welcome to Svelte Email Editor!
                      </h1>
                      <p style="text-align: center; margin-bottom: 16px;">
                        This is a sample email template created with our Svelte wrapper around Unlayer's powerful drag-and-drop email editor.
                      </p>
                    `
                  }
                }
              ],
              values: { backgroundColor: '', padding: '0px' }
            }
          ],
          values: {
            backgroundColor: '#f8fafc',
            columnsBackgroundColor: '#ffffff',
            padding: '20px'
          }
        }
      ],
      values: {
        contentWidth: '600px',
        fontFamily: { label: 'Arial', value: 'arial,helvetica,sans-serif' },
        textColor: '#000000',
        backgroundColor: '#ffffff'
      }
    },
    schemaVersion: 16
  };

  function handleEditorLoaded(event: { editor: UnlayerEditorInstance }) {
    console.log('Editor loaded:', event.editor);
    editorStatus = 'Editor loaded successfully! Start designing your email.';
  }

  function handleDesignUpdated(event: { design: UnlayerDesign }) {
    currentDesign = event.design;
    console.log('Design updated:', currentDesign);
  }

  async function loadSampleDesign() {
    try {
      await unlayerEditor.loadDesign(sampleDesign);
      editorStatus = 'Sample design loaded successfully!';
    } catch (error) {
      console.error('Failed to load design:', error);
      alert('Failed to load design: ' + (error as Error).message);
    }
  }

  async function saveCurrentDesign() {
    try {
      const rawDesign = await unlayerEditor.saveDesign();
      const design = JSON.parse(JSON.stringify(rawDesign));
      currentDesign = design;

      const blob = new Blob([JSON.stringify(design, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email-design-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      editorStatus = 'Design saved and downloaded!';
    } catch (error) {
      console.error('Failed to save design:', error);
      alert('Failed to save design: ' + (error as Error).message);
    }
  }

  function handleExportHtml({
    html,
    design
  }: {
    html: string;
    design: UnlayerDesign;
  }) {
    if (!isExporting) return;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportAndDownloadHtml() {
    isExporting = true;
    try {
      await unlayerEditor.exportHtml();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export HTML: ' + (error as Error).message);
    } finally {
      isExporting = false;
    }
  }

  async function previewEmail() {
    try {
      const result: UnlayerExportData = await unlayerEditor.exportHtml();
      previewHtml = result.html;
      showPreview = true;
    } catch (error) {
      console.error('Failed to generate preview:', error);
      alert('Failed to generate preview: ' + (error as Error).message);
    }
  }

  function closePreview() {
    showPreview = false;
    previewHtml = '';
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && showPreview) {
      closePreview();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<main class="app">
  <header class="header">
    <h1>🎨 Svelte Email Editor SDK</h1>
    <p>A lightweight Svelte wrapper around Unlayer's embeddable email editor</p>
    <div class="links">
      <a href="https://docs.unlayer.com" target="_blank">📚 Unlayer Docs</a>
    </div>
  </header>

  <section class="controls">
    <button class="btn btn-primary" onclick={loadSampleDesign}>📝 Load Sample Design</button>
    <button class="btn" onclick={saveCurrentDesign}>💾 Save Design JSON</button>
    <button class="btn" onclick={exportAndDownloadHtml} disabled={isExporting}>
      {#if isExporting}⏳ Exporting...{:else}📤 Export HTML{/if}
    </button>
    <button class="btn btn-success" onclick={previewEmail}>👁️ Preview Email</button>
  </section>

  <section class="status-bar">
    <p class="status-text">{editorStatus}</p>
  </section>

  <section class="editor-section">
    <UnlayerEditor
      bind:this={unlayerEditor}
      design={currentDesign}
      {tools}
      {options}
      onloaded={handleEditorLoaded}
      ondesignupdated={handleDesignUpdated}
      onexporthtml={handleExportHtml}
    />
  </section>
</main>

{#if showPreview}
  <div class="modal-overlay" onclick={closePreview}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h2>📧 Email Preview</h2>
        <button class="close-btn" onclick={closePreview}>×</button>
      </div>
      <div class="modal-body">
        <iframe title="Email Preview" srcdoc={previewHtml} class="preview-iframe" />
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: #f1f5f9;
    line-height: 1.6;
  }

  .app {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    text-align: center;
    margin-bottom: 32px;
  }

  .header h1 {
    color: #1e293b;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .header p {
    color: #64748b;
    font-size: 1.125rem;
    margin-bottom: 16px;
  }

  .links {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .links a {
    color: #3b82f6;
    text-decoration: none;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .links a:hover {
    background: #e0f2fe;
  }

  .controls {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn {
    padding: 12px 24px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-primary {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
  }

  .btn-success {
    background: #10b981;
    border-color: #10b981;
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: #059669;
    border-color: #059669;
  }

  .status-bar {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 20px;
    margin-bottom: 20px;
    text-align: center;
  }

  .status-text {
    margin: 0;
    color: #475569;
    font-size: 14px;
  }

  .editor-section {
    background: white;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
  }

  .modal-header h2 {
    margin: 0;
    color: #1e293b;
    font-size: 18px;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .modal-body {
    padding: 0;
  }

  .preview-iframe {
    width: 100%;
    height: 70vh;
    border: none;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .app {
      padding: 16px;
    }

    .header h1 {
      font-size: 2rem;
    }

    .controls {
      flex-direction: column;
      align-items: stretch;
    }

    .btn {
      justify-content: center;
    }

    .modal-content {
      margin: 10px;
      max-width: calc(100% - 20px);
    }

    .preview-iframe {
      height: 60vh;
    }
  }
</style>
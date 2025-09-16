<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import type {
    UnlayerEditorInstance,
    UnlayerDesign,
    UnlayerExportData,
    UnlayerOptions,
    UnlayerTools
  } from './types';

  interface Props {
    design?: UnlayerDesign | null;
    tools?: UnlayerTools | null;
    options?: UnlayerOptions;
    style?: string;
    onloaded?: (event: { editor: UnlayerEditorInstance }) => void;
    ondesignupdated?: (event: { design: UnlayerDesign }) => void;
    onexporthtml?: (event: { html: string; design: UnlayerDesign }) => void;
  }

  let {
    design = null,
    tools = null,
    options = {},
    style = '',
    onloaded,
    ondesignupdated,
    onexporthtml
  }: Props = $props();

  let editorContainer = $state<HTMLDivElement>();
  let editor = $state<UnlayerEditorInstance | null>(null);
  let isLoaded = $state(false);
  let isReady = $state(false);
  let loadError = $state<Error | null>(null);

  const editorId = 'unlayer-editor';

  export function loadDesign(designData: UnlayerDesign): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!editor) return reject(new Error('Editor not initialized'));
      try {
        editor.loadDesign(designData, () => resolve());
      } catch (err) {
        reject(err);
      }
    });
  }

  export function saveDesign(): Promise<UnlayerDesign> {
    return new Promise((resolve, reject) => {
      if (!editor) return reject(new Error('Editor not initialized'));
      try {
        editor.saveDesign((data: UnlayerDesign) => resolve(data));
      } catch (err) {
        reject(err);
      }
    });
  }

  export function exportHtml(): Promise<UnlayerExportData> {
    return new Promise((resolve, reject) => {
      if (!editor) return reject(new Error('Editor not initialized'));
      try {
        editor.exportHtml((data: UnlayerExportData) => {
          onexporthtml?.({ html: data.html, design: data.design });
          resolve({ html: data.html, design: data.design });
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  export function getEditorInstance() {
    return editor;
  }

  async function loadUnlayerScript(): Promise<void> {
    if (window.unlayer) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://editor.unlayer.com/embed.js';
      script.async = true;
      const timeout = setTimeout(
        () => reject(new Error('Unlayer script loading timeout (10s)')),
        10000
      );
      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load Unlayer script'));
      };
      document.head.appendChild(script);
    });
  }

  async function initializeEditor() {
    try {
      await tick();
      await loadUnlayerScript();
      if (!window.unlayer) throw new Error('Unlayer not available after script load');
      if (!editorContainer) throw new Error('Editor container not found');

      const config = {
        id: editorId,
        projectId: 279432,
        ...(tools && { tools }),
        ...options
      };

      window.unlayer.init(config);
      window.unlayer.addEventListener('editor:ready', handleEditorReady);
      window.unlayer.addEventListener('design:updated', handleDesignUpdated);

      editor = window.unlayer;
    } catch (err) {
      loadError = err as Error;
      console.error('Failed to initialize Unlayer editor:', err);
    }
  }

  function handleEditorReady() {
    isReady = true;
    console.log('EHRHERHEHRHE');
    if (design && editor) editor.loadDesign(design);
    if (editor) onloaded?.({ editor });
  }

  function handleDesignUpdated(event: any) {
    ondesignupdated?.({ design: event.detail });
  }

  function cleanup() {
    if (window.unlayer) {
      window.unlayer.removeEventListener('editor:ready', handleEditorReady);
      window.unlayer.removeEventListener('design:updated', handleDesignUpdated);
    }
    editor = null;
    isLoaded = false;
    isReady = false;
  }

  onMount(() => {
    initializeEditor();
  });

  onDestroy(() => {
    cleanup();
  });

  $effect(() => {
    if (design && editor && isReady) {
      editor.loadDesign(design);
    }
  });
</script>

<div class="unlayer-editor-container" {style}>
  <div
    bind:this={editorContainer}
    id={editorId}
    class="editor-instance"
    style="height:1024px"
  ></div>

  {#if loadError}
    <div class="error-overlay">
      <p>❌ {loadError.message}</p>
      <button
        onclick={() => {
          loadError = null;
          initializeEditor();
        }}
      >
        Retry
      </button>
    </div>
  {/if}
</div>

<style>
  .unlayer-editor-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  .editor-instance {
    width: 100%;
    height: 100%;
  }

  .loading-overlay,
  .error-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(248, 250, 252, 0.9);
    font-size: 16px;
    z-index: 10;
    flex-direction: column;
    gap: 12px;
  }
</style>

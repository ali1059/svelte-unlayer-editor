# 📧 Svelte Unlayer Editor

A reusable **Svelte** wrapper for the [Unlayer](https://unlayer.com) drag-and-drop email editor.  
This component makes it easy to embed the Unlayer editor in Svelte projects for building and managing email templates.

---

## ✨ Features
- 🧩 Simple integration with Svelte 5+  
- 🎨 Full-featured drag-and-drop email builder powered by Unlayer  
- ⚡ Built with Vite for fast builds and library distribution  
- 📦 NPM-ready with peer dependency on Svelte  

---

## 📦 Installation
Install the package via NPM:

```bash
npm install svelte-unlayer-editor


📝 Props

Prop	Type	Description
design	UnlayerDesign | null	Initial design to load in the editor
tools	UnlayerTools | null	Optional custom tools for the editor
options	UnlayerOptions	Configuration options for the editor


📢 Events
Event	Payload	Description
onloaded	{ editor: UnlayerEditorInstance }	Fires when the editor is initialized and ready
ondesignupdated	{ design: UnlayerDesign }	Fires when the editor design changes
onexporthtml	{ html: string, design: UnlayerDesign }

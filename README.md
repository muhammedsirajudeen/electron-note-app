
---

# 🖥️ Markdown Note Editor – Electron + React Desktop App

A simple, elegant Markdown note-taking desktop app built with **Electron** and **React**, supporting local storage, live preview, and basic editing features.

---

## 🔧 Features

- 📝 Create, edit, and delete notes
- ✍️ Live **Markdown formatting preview**
- 💾 Save notes **locally** using IndexedDB (or filesystem for Node-based implementation)
- 🧪 Unit test for core markdown rendering logic
- 📱 Clean and responsive UI

---

## 🧱 Tech Stack

- **Electron** – Desktop app shell
- **React** – Frontend interface
- **Vite** / **Webpack** – Fast React bundling (choose one)
- **Marked.js** / **ReactMarkdown** – Markdown parsing
- **IndexedDB** – Local note persistence
- **Jest** – Unit testing

---

## 📦 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/markdown-note-editor.git
cd markdown-note-editor
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Run the App (Dev Mode)

```bash
npm run dev
```

This will start the Electron app with hot-reloaded React frontend.

---

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## 💾 Note Persistence

All notes are saved in **IndexedDB** and persist across sessions. Optionally, you can switch to the filesystem using Node.js `fs` APIs for full file control.

---

## 📁 Folder Structure

```
.
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── App.jsx
├── electron/
│   └── main.js
├── tests/
│   └── markdown.test.js
├── index.html
├── vite.config.js
└── package.json
```

---

## 🧪 Tests

A unit test for the Markdown renderer is included:

```bash
npm run test
```

Example: Ensures that Markdown like `**bold**` renders as `<strong>`.

---

## 🎯 Todo / Improvements

- [ ] Export/Import notes as `.md` files
- [ ] Theme toggle (Light/Dark)
- [ ] Tags and folders

---

## 📸 Screenshots

> *(Add screenshots or a GIF here showing markdown preview, create/edit UI)*

---

## 📄 License

MIT License © 2025 Muhammed Sirajudeen


---


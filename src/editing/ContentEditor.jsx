import React, { createContext, useContext, useMemo, useState } from "react";
import { Camera } from "lucide-react";
import { siteContent } from "../content/siteContent";

const ContentContext = createContext(null);
const STORAGE_KEY = "lizzie-site-content-draft";

function getAtPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function setAtPath(source, path, nextValue) {
  const keys = path.split(".");
  const clone = Array.isArray(source) ? [...source] : { ...source };
  let cursor = clone;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = nextValue;
      return;
    }
    cursor[key] = Array.isArray(cursor[key]) ? [...cursor[key]] : { ...cursor[key] };
    cursor = cursor[key];
  });

  return clone;
}

function loadInitialContent() {
  if (!import.meta.env.DEV) return siteContent;

  try {
    const draft = window.localStorage.getItem(STORAGE_KEY);
    return draft ? JSON.parse(draft) : siteContent;
  } catch {
    return siteContent;
  }
}

export function ContentProvider({ children }) {
  const isDev = import.meta.env.DEV;
  const [content, setContent] = useState(loadInitialContent);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState("");

  const api = useMemo(
    () => ({
      content,
      editMode: isDev && editMode,
      isDev,
      status,
      get(path) {
        return getAtPath(content, path);
      },
      update(path, value) {
        setContent((current) => {
          const next = setAtPath(current, path, value);
          if (isDev) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          }
          return next;
        });
      },
      setEditMode,
      async saveToFile() {
        setStatus("Saving…");
        const response = await fetch("/__save-site-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(content),
        });
        if (!response.ok) {
          setStatus("Save failed. Use copy JSON.");
          return;
        }
        window.localStorage.removeItem(STORAGE_KEY);
        setStatus("Saved to src/content/siteContent.js");
      },
      async copyJson() {
        await navigator.clipboard.writeText(JSON.stringify(content, null, 2));
        setStatus("Copied JSON to clipboard");
      },
      async captureScreenshot() {
        setStatus("Capturing screenshot…");
        const url = new URL(window.location.href);
        url.searchParams.set("capture", "1");
        const response = await fetch("/__capture-screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: url.toString(),
            content,
            width: window.innerWidth,
            height: window.innerHeight,
            deviceScaleFactor: window.devicePixelRatio || 1,
          }),
        });

        if (!response.ok) {
          setStatus("Screenshot failed.");
          return;
        }

        const result = await response.json();
        setStatus(`Saved ${result.filename}`);
      },
      resetDraft() {
        window.localStorage.removeItem(STORAGE_KEY);
        setContent(siteContent);
        setStatus("Reset local draft");
      },
    }),
    [content, editMode, isDev, status],
  );

  return <ContentContext.Provider value={api}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used inside ContentProvider");
  return context;
}

export function EditableText({ path, as: Element = "span", className, multiline = false }) {
  const editor = useContent();
  const value = editor.get(path) ?? "";

  if (!editor.editMode) {
    return <Element className={className}>{value}</Element>;
  }

  return (
    <Element
      className={className}
      contentEditable
      suppressContentEditableWarning
      data-editable-path={path}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onBlur={(event) => {
        const next = multiline ? event.currentTarget.innerText : event.currentTarget.textContent;
        editor.update(path, next);
      }}
    >
      {value}
    </Element>
  );
}

export function EditPanel() {
  const editor = useContent();

  if (!editor.isDev) return null;
  if (new URLSearchParams(window.location.search).get("capture") === "1") return null;

  return (
    <div className="edit-panel">
      <button
        type="button"
        className="edit-panel-camera"
        onClick={() => editor.captureScreenshot()}
        aria-label="Capture screenshot"
        title="Capture screenshot"
      >
        <Camera size={16} />
      </button>
      <label>
        <input
          type="checkbox"
          checked={editor.editMode}
          onChange={(event) => editor.setEditMode(event.target.checked)}
        />
        Edit Mode
      </label>
      <button type="button" onClick={() => editor.saveToFile()}>
        Save to content file
      </button>
      <button type="button" onClick={() => editor.copyJson()}>
        Copy JSON
      </button>
      <button type="button" onClick={() => editor.resetDraft()}>
        Reset draft
      </button>
      <small>Editing: src/content/siteContent.js</small>
      {editor.status ? <p>{editor.status}</p> : null}
    </div>
  );
}

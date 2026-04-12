import type { KeyboardEvent } from "react";

type JsonSpecEditorProps = {
  id: string;
  value: string;
  disabled?: boolean;
  formatDisabled?: boolean;
  onChange: (nextValue: string) => void;
  onFormat: () => void;
};

const INDENT = "  ";

function getLineStart(text: string, index: number) {
  return text.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
}

function getLineEnd(text: string, index: number) {
  const lineEnd = text.indexOf("\n", index);
  return lineEnd === -1 ? text.length : lineEnd;
}

function setSelectionRange(
  textarea: HTMLTextAreaElement,
  selectionStart: number,
  selectionEnd: number,
) {
  requestAnimationFrame(() => {
    textarea.setSelectionRange(selectionStart, selectionEnd);
  });
}

function countAddedBeforeOffset(lines: string[], addedCounts: number[], offset: number) {
  let traversed = 0;
  let total = 0;

  for (let index = 0; index < lines.length; index += 1) {
    if (offset < traversed) {
      break;
    }

    total += addedCounts[index];
    traversed += lines[index].length;

    if (index < lines.length - 1) {
      if (offset <= traversed) {
        break;
      }

      traversed += 1;
    }
  }

  return total;
}

function countRemovedBeforeOffset(lines: string[], removedCounts: number[], offset: number) {
  let traversed = 0;
  let total = 0;

  for (let index = 0; index < lines.length; index += 1) {
    if (offset <= traversed) {
      break;
    }

    const offsetInLine = Math.min(offset - traversed, lines[index].length);
    total += Math.min(offsetInLine, removedCounts[index]);
    traversed += lines[index].length;

    if (index < lines.length - 1) {
      if (offset <= traversed) {
        break;
      }

      traversed += 1;
    }
  }

  return total;
}

function removeIndentPrefix(line: string) {
  if (line.startsWith(INDENT)) {
    return {
      removedCount: INDENT.length,
      nextLine: line.slice(INDENT.length),
    };
  }

  if (line.startsWith("\t")) {
    return {
      removedCount: 1,
      nextLine: line.slice(1),
    };
  }

  if (line.startsWith(" ")) {
    return {
      removedCount: 1,
      nextLine: line.slice(1),
    };
  }

  return {
    removedCount: 0,
    nextLine: line,
  };
}

export function JsonSpecEditor({
  id,
  value,
  disabled = false,
  formatDisabled = false,
  onChange,
  onFormat,
}: JsonSpecEditorProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const textarea = event.currentTarget;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    if (!event.shiftKey && selectionStart === selectionEnd) {
      const nextValue =
        value.slice(0, selectionStart) + INDENT + value.slice(selectionEnd);
      const nextSelection = selectionStart + INDENT.length;

      onChange(nextValue);
      setSelectionRange(textarea, nextSelection, nextSelection);
      return;
    }

    const lineStart = getLineStart(value, selectionStart);
    const lineEnd = getLineEnd(value, selectionEnd);
    const selectedBlock = value.slice(lineStart, lineEnd);
    const lines = selectedBlock.split("\n");

    if (event.shiftKey) {
      const removedLines = lines.map(removeIndentPrefix);
      const nextBlock = removedLines.map(({ nextLine }) => nextLine).join("\n");
      const removedCounts = removedLines.map(({ removedCount }) => removedCount);
      const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
      const nextSelectionStart =
        selectionStart -
        countRemovedBeforeOffset(lines, removedCounts, selectionStart - lineStart);
      const nextSelectionEnd =
        selectionEnd - countRemovedBeforeOffset(lines, removedCounts, selectionEnd - lineStart);

      onChange(nextValue);
      setSelectionRange(textarea, nextSelectionStart, nextSelectionEnd);
      return;
    }

    const nextBlock = lines.map((line) => `${INDENT}${line}`).join("\n");
    const addedCounts = lines.map(() => INDENT.length);
    const nextValue = value.slice(0, lineStart) + nextBlock + value.slice(lineEnd);
    const nextSelectionStart =
      selectionStart + countAddedBeforeOffset(lines, addedCounts, selectionStart - lineStart);
    const nextSelectionEnd =
      selectionEnd + countAddedBeforeOffset(lines, addedCounts, selectionEnd - lineStart);

    onChange(nextValue);
    setSelectionRange(textarea, nextSelectionStart, nextSelectionEnd);
  }

  return (
    <>
      <div className="editor-toolbar">
        <button
          type="button"
          className="secondary-button"
          onClick={onFormat}
          disabled={disabled || formatDisabled}
        >
          Format JSON
        </button>
      </div>
      <textarea
        id={id}
        className="spec-editor"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        disabled={disabled}
      />
    </>
  );
}

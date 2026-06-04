"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

interface ArrayInputEditorProps {
  value: number[];
  onChange: (array: number[]) => void;
  maxElements?: number;
}

const MAX_ELEMENTS = 20;

export function ArrayInputEditor({
  value,
  onChange,
  maxElements = MAX_ELEMENTS,
}: ArrayInputEditorProps) {
  const t = useTranslations();
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingIndex]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed === "") {
      setError(t("arrayEditor.error.enterNumber"));
      return;
    }

    const num = Number(trimmed);
    if (isNaN(num)) {
      setError(t("arrayEditor.error.invalidNumber"));
      return;
    }

    if (value.length >= maxElements) {
      setError(t("arrayEditor.error.maxElements", { max: maxElements }));
      return;
    }

    onChange([...value, num]);
    setInputValue("");
    clearError();
    inputRef.current?.focus();
  }, [inputValue, value, onChange, maxElements, clearError]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const handleEditStart = useCallback(
    (index: number) => {
      setEditingIndex(index);
      setEditingValue(String(value[index]));
    },
    [value]
  );

  const handleEditConfirm = useCallback(() => {
    if (editingIndex === null) return;

    const trimmed = editingValue.trim();
    if (trimmed === "") {
      handleRemove(editingIndex);
      setEditingIndex(null);
      return;
    }

    const num = Number(trimmed);
    if (isNaN(num)) {
      setError(t("arrayEditor.error.invalidNumber"));
      setEditingIndex(null);
      return;
    }

    const newArray = [...value];
    newArray[editingIndex] = num;
    onChange(newArray);
    setEditingIndex(null);
    clearError();
  }, [editingIndex, editingValue, value, onChange, handleRemove, clearError]);

  const handleEditCancel = useCallback(() => {
    setEditingIndex(null);
    clearError();
  }, [clearError]);

  const handleShuffle = useCallback(() => {
    const shuffled = [...value];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    onChange(shuffled);
  }, [value, onChange]);

  const handleClear = useCallback(() => {
    onChange([]);
    setInputValue("");
    clearError();
  }, [onChange, clearError]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd]
  );

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleEditConfirm();
      } else if (e.key === "Escape") {
        handleEditCancel();
      }
    },
    [handleEditConfirm, handleEditCancel]
  );

  return (
    <div className="space-y-3">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 text-xs font-semibold text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
          >
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t("arrayEditor.title")}
          <span className="text-[10px] font-normal text-text-tertiary ml-1">
            ({value.length}/{maxElements})
          </span>
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-3">
          {/* Chips display */}
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {value.map((num, index) => (
                <div
                  key={`${index}-${num}`}
                  className="group relative"
                >
                  {editingIndex === index ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={handleEditConfirm}
                      onKeyDown={handleEditKeyDown}
                      className="w-12 h-7 px-2 text-xs font-mono text-text-primary bg-[#FF6B6B]/20 border border-[#FF6B6B]/40 rounded-md focus:outline-none focus:border-[#FF6B6B]/60"
                    />
                  ) : (
                    <button
                      onClick={() => handleEditStart(index)}
                      className="flex items-center gap-1 h-7 px-2 text-xs font-mono text-text-primary/80 bg-bg-glass-light border border-border rounded-md hover:bg-bg-glass-light hover:border-border transition-all cursor-pointer"
                    >
                      {num}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="w-4 h-4 flex items-center justify-center rounded-full text-text-primary/30 hover:text-text-primary hover:bg-[#FF6B6B]/30 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-8 text-[10px] text-text-tertiary border border-dashed border-border rounded-lg">
              {t("arrayEditor.empty")}
            </div>
          )}

          {/* Add input */}
          <div className="flex gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                clearError();
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("arrayEditor.placeholder")}
              className="flex-1 h-7 px-2 text-xs font-mono text-text-primary bg-bg-glass-light border border-border rounded-md placeholder:text-text-tertiary focus:outline-none focus:border-[#4ECDC4]/40"
            />
            <button
              onClick={handleAdd}
              disabled={value.length >= maxElements}
              className="h-7 px-3 text-xs font-medium text-text-primary bg-[#4ECDC4]/20 border border-[#4ECDC4]/30 rounded-md hover:bg-[#4ECDC4]/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t("arrayEditor.add")}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-[10px] text-[#FF6B6B]">{error}</div>
          )}

          {/* Action buttons */}
          <div className="flex gap-1.5">
            <button
              onClick={handleShuffle}
              disabled={value.length < 2}
              className="flex-1 h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium text-text-tertiary bg-bg-glass-light border border-border rounded-md hover:text-text-secondary hover:bg-bg-glass-light transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h2l3 4-3 4H2M14 4h-2l-3 4 3 4h2M5 4l3 4-3 4M11 4l-3 4 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t("arrayEditor.shuffle")}
            </button>
            <button
              onClick={handleClear}
              disabled={value.length === 0}
              className="flex-1 h-7 flex items-center justify-center gap-1.5 text-[10px] font-medium text-text-tertiary bg-bg-glass-light border border-border rounded-md hover:text-text-secondary hover:bg-bg-glass-light transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t("arrayEditor.clear")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

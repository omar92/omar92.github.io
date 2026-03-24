import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save, RotateCcw, CheckCircle2, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { portfolioSchema, createTemplateFromSchema, type FieldSchema } from '@/lib/editorSchema';

const ENDPOINT = '/__portfolio-json';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonPath = Array<string | number>;

function isObjectValue(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function setAtPath(root: JsonValue, path: JsonPath, nextValue: JsonValue): JsonValue {
  if (path.length === 0) {
    return nextValue;
  }

  const [head, ...rest] = path;

  if (Array.isArray(root)) {
    const index = Number(head);
    const clone = [...root];

    if (rest.length === 0) {
      clone[index] = nextValue;
    } else {
      clone[index] = setAtPath(clone[index], rest, nextValue);
    }

    return clone;
  }

  if (!isObjectValue(root)) {
    return root;
  }

  const clone = { ...root } as { [key: string]: JsonValue };
  const key = String(head);

  if (rest.length === 0) {
    clone[key] = nextValue;
  } else {
    clone[key] = setAtPath(clone[key], rest, nextValue);
  }

  return clone;
}

function removeAtPath(root: JsonValue, path: JsonPath): JsonValue {
  if (path.length === 0) {
    return root;
  }

  const [head, ...rest] = path;

  if (Array.isArray(root)) {
    const index = Number(head);
    const clone = [...root];

    if (rest.length === 0) {
      clone.splice(index, 1);
      return clone;
    }

    clone[index] = removeAtPath(clone[index], rest);
    return clone;
  }

  if (!isObjectValue(root)) {
    return root;
  }

  const clone = { ...root } as { [key: string]: JsonValue };
  const key = String(head);

  if (rest.length === 0) {
    delete clone[key];
    return clone;
  }

  clone[key] = removeAtPath(clone[key], rest);
  return clone;
}

type FieldEditorProps = {
  label: string;
  value: JsonValue;
  path: JsonPath;
  schema?: FieldSchema;
  defaultExpanded?: boolean;
  autoExpandAll?: boolean;
  expandedItems?: Record<string, boolean>;
  onExpandItem?: (pathKey: string, expanded: boolean) => void;
  onChangeAtPath: (path: JsonPath, nextValue: JsonValue) => void;
  onDeleteAtPath: (path: JsonPath) => void;
};

function FieldEditor({
  label,
  value,
  path,
  schema,
  defaultExpanded = false,
  autoExpandAll = false,
  expandedItems = {},
  onExpandItem,
  onChangeAtPath,
  onDeleteAtPath,
}: FieldEditorProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || autoExpandAll);
  const isObject = isObjectValue(value);
  const isArray = Array.isArray(value);
  const isBoolean = typeof value === 'boolean';
  const isNumber = typeof value === 'number';
  const isLongString = typeof value === 'string' && (value.length > 60 || value.includes('\n'));

  // For arrays of objects
  if (isArray && schema?.itemSchema) {
    return (
      <div className="border border-slate-800 bg-slate-900/40 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-100"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {label}
            <span className="mono text-[10px] text-slate-500">({value.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              // Create a schema for a single item (not the array itself)
              const itemSchema: FieldSchema = {
                type: 'object',
                schema: schema?.itemSchema,
              };
              const newItem = createTemplateFromSchema(itemSchema) as JsonValue;
              onChangeAtPath(path, [...value, newItem]);
            }}
            className="inline-flex items-center gap-1 border border-cyan-500/40 px-2 py-1 text-[11px] text-cyan-200 hover:bg-cyan-500/10"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-2">
            {value.map((item, index) => {
              const itemPathKey = `${path.join('.')}.${index}`;
              const hasExplicitExpansionState = Object.prototype.hasOwnProperty.call(expandedItems, itemPathKey);
              const isItemExpanded = hasExplicitExpansionState ? expandedItems[itemPathKey] : autoExpandAll;
              const itemTitle = isObjectValue(item)
                ? item.id || item.title || item.name || item.label || `Item ${index + 1}`
                : `Item ${index + 1}`;

              return (
                <div
                  key={itemPathKey}
                  className="border border-slate-700 bg-slate-950 p-2"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onExpandItem?.(itemPathKey, !isItemExpanded);
                      }}
                      className="flex items-center gap-2 flex-1 text-xs font-medium text-slate-300 hover:text-cyan-200"
                    >
                      {isItemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {String(itemTitle)}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newArray = [...value];
                        newArray.splice(index, 1);
                        onChangeAtPath(path, newArray);
                      }}
                      className="inline-flex items-center gap-1 border border-rose-500/40 px-2 py-0.5 text-[11px] text-rose-200 hover:bg-rose-500/10"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                  {isItemExpanded &&
                    isObjectValue(item) &&
                    Object.entries(item).map(([key, child]) => (
                      <FieldEditor
                        key={`${itemPathKey}.${key}`}
                        label={key}
                        value={child}
                        path={[...path, index, key]}
                        schema={schema.itemSchema?.[key]}
                        defaultExpanded={autoExpandAll}
                        autoExpandAll={autoExpandAll}
                        expandedItems={expandedItems}
                        onExpandItem={onExpandItem}
                        onChangeAtPath={onChangeAtPath}
                        onDeleteAtPath={onDeleteAtPath}
                      />
                    ))}
                </div>
              );
            })}
            {value.length === 0 && <div className="text-xs text-slate-500">No items</div>}
          </div>
        )}
      </div>
    );
  }

  // For arrays of primitives
  if (isArray && schema?.itemType === 'string') {
    return (
      <div className="border border-slate-800 bg-slate-900/40 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-100"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {label}
            <span className="mono text-[10px] text-slate-500">({value.length})</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeAtPath(path, [...value, ''])}
            className="inline-flex items-center gap-1 border border-cyan-500/40 px-2 py-1 text-[11px] text-cyan-200 hover:bg-cyan-500/10"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-1.5">
            {value.map((item, index) => (
              <div key={`${path.join('.')}.${index}`} className="flex gap-2">
                <input
                  type="text"
                  value={String(item)}
                  onChange={(event) => {
                    const newArray = [...value];
                    newArray[index] = event.target.value;
                    onChangeAtPath(path, newArray);
                  }}
                  className="flex-1 border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newArray = [...value];
                    newArray.splice(index, 1);
                    onChangeAtPath(path, newArray);
                  }}
                  className="inline-flex items-center border border-rose-500/40 px-2 py-1 text-[11px] text-rose-200 hover:bg-rose-500/10"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {value.length === 0 && <div className="text-xs text-slate-500">No items</div>}
          </div>
        )}
      </div>
    );
  }

  // For objects
  if (isObject) {
    return (
      <div className="border border-slate-800 bg-slate-900/40 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-100"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {label}
            <span className="mono text-[10px] text-slate-500">OBJECT</span>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-2">
            {Object.entries(value).map(([key, child]) => {
              const childSchema = schema?.schema?.[key];
              return (
                <FieldEditor
                  key={`${path.join('.')}.${key}`}
                  label={key}
                  value={child}
                  path={[...path, key]}
                  schema={childSchema}
                  defaultExpanded={autoExpandAll}
                  autoExpandAll={autoExpandAll}
                  expandedItems={expandedItems}
                  onExpandItem={onExpandItem}
                  onChangeAtPath={onChangeAtPath}
                  onDeleteAtPath={onDeleteAtPath}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // For primitives
  return (
    <div className="border border-slate-700 bg-slate-900/20 p-2.5">
      <label className="mb-1 block text-xs font-medium text-slate-300">{label}</label>
      {isBoolean ? (
        <label className="inline-flex items-center gap-2 text-xs text-slate-200">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChangeAtPath(path, event.target.checked)}
            className="h-4 w-4"
          />
          {value ? 'True' : 'False'}
        </label>
      ) : isLongString ? (
        <textarea
          value={String(value)}
          onChange={(event) => onChangeAtPath(path, event.target.value)}
          className="min-h-[80px] w-full border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
        />
      ) : (
        <input
          type={isNumber ? 'number' : 'text'}
          value={String(value)}
          onChange={(event) => {
            if (isNumber) {
              const nextNumber = Number(event.target.value);
              onChangeAtPath(path, Number.isNaN(nextNumber) ? 0 : nextNumber);
            } else {
              onChangeAtPath(path, event.target.value);
            }
          }}
          className="w-full border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-cyan-500"
        />
      )}
    </div>
  );
}

export default function PortfolioEditor() {
  const [currentData, setCurrentData] = useState<JsonValue | null>(null);
  const [baselineData, setBaselineData] = useState<JsonValue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const serializedCurrent = useMemo(() => JSON.stringify(currentData), [currentData]);
  const serializedBaseline = useMemo(() => JSON.stringify(baselineData), [baselineData]);
  const isDirty = serializedCurrent !== serializedBaseline;
  const canSave = !loading && isDirty && saveState !== 'saving' && currentData !== null;

  const topLevelKeys = useMemo(() => {
    if (!currentData || !isObjectValue(currentData)) {
      return [];
    }

    return Object.keys(currentData);
  }, [currentData]);

  const handleChangeAtPath = (path: JsonPath, nextValue: JsonValue) => {
    if (currentData === null) {
      return;
    }

    setCurrentData((prev) => {
      if (prev === null) {
        return prev;
      }

      return setAtPath(prev, path, nextValue);
    });
    setSaveState('idle');
  };

  const handleDeleteAtPath = (path: JsonPath) => {
    if (currentData === null || path.length === 0) {
      return;
    }

    setCurrentData((prev) => {
      if (prev === null) {
        return prev;
      }

      return removeAtPath(prev, path);
    });
    setSaveState('idle');
  };

  useEffect(() => {
    let isMounted = true;

    const loadPortfolioJson = async () => {
      try {
        const response = await fetch(ENDPOINT, { method: 'GET' });

        if (!response.ok) {
          throw new Error('Failed to load portfolio.json.');
        }

        const payload = (await response.json()) as JsonValue;

        if (!isMounted) {
          return;
        }

        setCurrentData(payload);
        setBaselineData(payload);
        setStatusMessage('Loaded src/data/portfolio.json');
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const fallback: JsonValue = {
          error: 'Unable to load portfolio.json from local endpoint.',
        };
        setCurrentData(fallback);
        setBaselineData(fallback);
        setStatusMessage(
          error instanceof Error
            ? `${error.message} Start app with \"npm run dev\" in this workspace to enable file save.`
            : 'Unable to load portfolio.json.'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPortfolioJson();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setSaveState('saving');
    setStatusMessage('Saving changes to src/data/portfolio.json...');

    try {
      if (currentData === null) {
        throw new Error('No data to save.');
      }

      const response = await fetch(ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentData),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorPayload?.error ?? 'Save failed.');
      }

      setBaselineData(currentData);
      setSaveState('saved');
      setStatusMessage('Saved to src/data/portfolio.json');
      window.setTimeout(() => setSaveState('idle'), 1800);
    } catch (error) {
      setSaveState('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to save file.');
    }
  };

  const handleReset = () => {
    setCurrentData(baselineData);
    setSaveState('idle');
    setStatusMessage('Reverted unsaved changes.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Portfolio Editor</div>
            <h1 className="truncate text-lg font-semibold sm:text-xl">Edit portfolio.json</h1>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <ArrowLeft size={14} /> Back
            </a>
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || saveState === 'saving'}
              className="inline-flex items-center gap-2 border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="inline-flex items-center gap-2 border border-cyan-500/60 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300 transition hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} /> {saveState === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
          <span className="mono">File: src/data/portfolio.json</span>
          <span className={isDirty ? 'text-amber-300' : 'text-emerald-300'}>{isDirty ? 'Unsaved changes' : 'No pending changes'}</span>
          {saveState === 'saved' && (
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <CheckCircle2 size={13} /> Saved
            </span>
          )}
          <span className="text-cyan-300">Visual editor mode</span>
        </div>

        <div className="mb-3 border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300">
          {statusMessage || 'Ready.'}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="border border-slate-800 bg-slate-900/40 p-3 lg:sticky lg:top-[84px] lg:h-[calc(100vh-110px)] lg:overflow-auto">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">Sections</h3>
            <div className="space-y-1 mb-4">
              {topLevelKeys.map((key) => (
                <a
                  key={key}
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setExpandedSections((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }));
                  }}
                  className={`block border px-2 py-1.5 text-xs transition ${
                    expandedSections[key]
                      ? 'border-cyan-500/40 bg-cyan-500/5 text-cyan-200'
                      : 'border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200'
                  }`}
                >
                  {key}
                </a>
              ))}
              {topLevelKeys.length === 0 && <div className="text-xs text-slate-500">No sections</div>}
            </div>

            {currentData &&
              isObjectValue(currentData) &&
              ['projects', 'experience', 'education', 'skills', 'stats'].map((sectionName) => {
                if (!expandedSections[sectionName]) return null;

                const sectionData = currentData[sectionName];
                if (!Array.isArray(sectionData)) return null;

                const addItemToSection = () => {
                  const sectionSchema = portfolioSchema[sectionName];
                  if (!sectionSchema?.itemSchema) return;

                  const itemSchema: FieldSchema = {
                    type: 'object',
                    schema: sectionSchema.itemSchema,
                  };
                  const newItem = createTemplateFromSchema(itemSchema) as JsonValue;
                  const newIndex = sectionData.length;

                  handleChangeAtPath([sectionName], [...sectionData, newItem]);
                  setExpandedItems((prev) => ({
                    ...prev,
                    [`${sectionName}.${newIndex}`]: true,
                  }));
                };

                const getTitleForItem = (item: JsonValue, index: number): string => {
                  if (!isObjectValue(item)) return `Item ${index + 1}`;

                  // Project: id or name
                  if (sectionName === 'projects') {
                    return (item.id as string) || (item.name as string) || `Project ${index + 1}`;
                  }
                  // Experience: position at company
                  if (sectionName === 'experience') {
                    const position = (item.position as string) || '';
                    const company = (item.company as string) || '';
                    if (position && company) return `${position} @ ${company}`;
                    return position || company || `Experience ${index + 1}`;
                  }
                  // Skills: category
                  if (sectionName === 'skills') {
                    return (item.category as string) || `Skill ${index + 1}`;
                  }
                  // Stats: label
                  if (sectionName === 'stats') {
                    return (item.label as string) || `Stat ${index + 1}`;
                  }
                    // Education: name or degree
                    if (sectionName === 'education') {
                      return (item.name as string) || (item.degree as string) || `Education ${index + 1}`;
                    }

                  return `Item ${index + 1}`;
                };

                return (
                  <div key={sectionName} className="border-t border-slate-700 pt-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        {sectionName}
                      </h3>
                      <button
                        type="button"
                        onClick={addItemToSection}
                        className="inline-flex items-center gap-1 border border-cyan-500/40 px-2 py-1 text-[11px] text-cyan-200 hover:bg-cyan-500/10"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                    <div className="space-y-1">
                      {(sectionData as JsonValue[]).map((item, index) => {
                        const itemKey = `${sectionName}.${index}`;
                        const isExpanded = expandedItems[itemKey];
                        const itemTitle = getTitleForItem(item, index);

                        return (
                          <button
                            key={itemKey}
                            onClick={() => {
                              setExpandedItems((prev) => ({
                                ...prev,
                                [itemKey]: !prev[itemKey],
                              }));
                            }}
                            className={`w-full text-left border px-2 py-1.5 text-xs transition ${
                              isExpanded
                                ? 'border-cyan-500/40 bg-cyan-500/5 text-cyan-200'
                                : 'border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              <span className="truncate">{itemTitle}</span>
                            </div>
                          </button>
                        );
                      })}
                      {sectionData.length === 0 && (
                        <div className="border border-slate-800 px-2 py-1.5 text-xs text-slate-500">No items yet</div>
                      )}
                    </div>
                  </div>
                );
              })}
          </aside>

          <div className="space-y-4">
            {currentData && isObjectValue(currentData) ? (
              topLevelKeys.map((key) => {
                if (!expandedSections[key]) return null;

                const sectionValue = currentData[key];
                const isArraySection = Array.isArray(sectionValue);

                // Find ALL expanded items in this section
                const expandedIndices: number[] = [];
                if (isArraySection) {
                  (sectionValue as JsonValue[]).forEach((_, index) => {
                    if (expandedItems[`${key}.${index}`]) {
                      expandedIndices.push(index);
                    }
                  });
                }

                const getTitleForItem = (item: JsonValue, index: number, sectionKey: string): string => {
                  if (!isObjectValue(item)) return `Item ${index + 1}`;
                  if (sectionKey === 'projects') {
                    return (item.id as string) || (item.name as string) || `Project ${index + 1}`;
                  }
                  if (sectionKey === 'experience') {
                    const position = (item.position as string) || '';
                    const company = (item.company as string) || '';
                    if (position && company) return `${position} @ ${company}`;
                    return position || company || `Experience ${index + 1}`;
                  }
                  if (sectionKey === 'skills') {
                    return (item.category as string) || `Skill ${index + 1}`;
                  }
                  if (sectionKey === 'stats') {
                    return (item.label as string) || `Stat ${index + 1}`;
                  }
                  return `Item ${index + 1}`;
                };

                // If items are expanded, show them
                if (expandedIndices.length > 0 && isArraySection) {
                  return (
                    <div key={key} className="space-y-4">
                      {expandedIndices.map((expandedItemIndex) => {
                        const item = (sectionValue as JsonValue[])[expandedItemIndex];
                        return (
                          <section
                            key={`${key}-${expandedItemIndex}`}
                            className="border border-slate-800 bg-slate-900/30 p-3"
                          >
                            <h2 className="mb-4 text-base font-semibold text-cyan-300">
                              {getTitleForItem(item, expandedItemIndex, key)} ({key})
                            </h2>
                            <FieldEditor
                              label={getTitleForItem(item, expandedItemIndex, key)}
                              value={item}
                              path={[key, expandedItemIndex]}
                              schema={{
                                type: 'object',
                                schema: (portfolioSchema[key] as any)?.itemSchema,
                              }}
                              defaultExpanded
                              autoExpandAll
                              expandedItems={expandedItems}
                              onExpandItem={(pathKey, expanded) => {
                                setExpandedItems((prev) => ({
                                  ...prev,
                                  [pathKey]: expanded,
                                }));
                              }}
                              onChangeAtPath={handleChangeAtPath}
                              onDeleteAtPath={handleDeleteAtPath}
                            />
                          </section>
                        );
                      })}
                    </div>
                  );
                }

                // Otherwise show the whole section
                return (
                  <section key={key} className="border border-slate-800 bg-slate-900/30 p-3">
                    <h2 className="mb-4 text-base font-semibold text-cyan-300">{key}</h2>
                    <FieldEditor
                      label={key}
                      value={sectionValue}
                      path={[key]}
                      schema={portfolioSchema[key]}
                      defaultExpanded
                      expandedItems={expandedItems}
                      onExpandItem={(pathKey, expanded) => {
                        setExpandedItems((prev) => ({
                          ...prev,
                          [pathKey]: expanded,
                        }));
                      }}
                      onChangeAtPath={handleChangeAtPath}
                      onDeleteAtPath={handleDeleteAtPath}
                    />
                  </section>
                );
              })
            ) : currentData !== null ? (
              <FieldEditor
                label="root"
                value={currentData}
                path={[]}
                schema={{ type: 'object' }}
                expandedItems={expandedItems}
                onExpandItem={(pathKey, expanded) => {
                  setExpandedItems((prev) => ({
                    ...prev,
                    [pathKey]: expanded,
                  }));
                }}
                onChangeAtPath={handleChangeAtPath}
                onDeleteAtPath={handleDeleteAtPath}
              />
            ) : (
              <div className="border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">Loading...</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { Check, Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { CatalogItem, FittingSide } from '../types/catalog';
import { cleanOemCode } from '../lib/catalogEngine';

interface CatalogTablePanelProps {
  items: CatalogItem[];
  onUpdateItem: (id: string, updated: Partial<CatalogItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddEmptyRow: () => void;
}

type SideFilter = 'ALL' | 'SX' | 'DX' | 'Bilaterale';

export const CatalogTablePanel: React.FC<CatalogTablePanelProps> = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddEmptyRow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sideFilter, setSideFilter] = useState<SideFilter>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<CatalogItem>>({});

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (sideFilter !== 'ALL' && item.fitting_side !== sideFilter) return false;
      if (!q) return true;
      return (
        item.car_brand.toLowerCase().includes(q) ||
        item.car_model.toLowerCase().includes(q) ||
        item.oem_code.toLowerCase().includes(q) ||
        item.cross_reference.toLowerCase().includes(q) ||
        item.fitting_side.toLowerCase().includes(q) ||
        item.attributes.toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery, sideFilter]);

  const startEditing = (item: CatalogItem) => {
    setEditingId(item.id);
    setDraft({
      car_brand: item.car_brand,
      car_model: item.car_model,
      oem_code: item.oem_code,
      cross_reference: item.cross_reference,
      fitting_side: item.fitting_side,
      attributes: item.attributes,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEditing = (id: string) => {
    onUpdateItem(id, {
      car_brand: (draft.car_brand ?? '').trim(),
      car_model: (draft.car_model ?? '').trim(),
      oem_code: cleanOemCode(draft.oem_code ?? ''),
      cross_reference: (draft.cross_reference ?? '').trim().toUpperCase(),
      fitting_side: (draft.fitting_side as FittingSide) || '',
      attributes: (draft.attributes ?? '').trim(),
    });
    setEditingId(null);
    setDraft({});
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditing(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  return (
    <section
      aria-label="Tabella Anteprima"
      className="rounded-xl border border-slate-800/80 bg-[#101622] p-4 sm:p-5 space-y-3.5"
    >
      {/* Toolbar */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center flex-1">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca marca, modello, OEM..."
              aria-label="Cerca nella tabella"
              className="h-10 w-full rounded-lg border border-slate-800 bg-[#0A0E17] pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-amber-500/70 focus:outline-none"
            />
          </div>

          <div
            role="group"
            aria-label="Filtro lato"
            className="inline-flex flex-wrap items-center rounded-lg border border-slate-800 bg-[#0A0E17] p-1 gap-1 self-start"
          >
            {(['ALL', 'SX', 'DX', 'Bilaterale'] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setSideFilter(side)}
                className={`min-h-[34px] rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  sideFilter === side
                    ? 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {side === 'ALL' ? `Tutti (${items.length})` : side}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onAddEmptyRow}
          className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#151D2E] px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0 self-start lg:self-auto"
        >
          <Plus className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <span>Aggiungi Riga</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 bg-[#0A0E17]/70 px-4 py-10 text-center font-mono text-xs text-slate-500">
          car_brand · car_model · oem_code · cross_reference · fitting_side · attributes
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-[#0A0E17] px-4 py-8 text-center text-xs text-slate-400">
          Nessun risultato trovato.
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-800 bg-[#0A0E17]">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0E1421] text-[11px] font-mono text-slate-400">
                  <th className="w-10 px-3 py-2.5 text-right tabular-nums">#</th>
                  <th className="min-w-[110px] px-3 py-2.5">car_brand</th>
                  <th className="min-w-[185px] px-3 py-2.5">car_model</th>
                  <th className="min-w-[135px] px-3 py-2.5">oem_code</th>
                  <th className="min-w-[175px] px-3 py-2.5">cross_reference</th>
                  <th className="w-24 px-3 py-2.5">fitting_side</th>
                  <th className="min-w-[160px] px-3 py-2.5">attributes</th>
                  <th className="w-24 px-3 py-2.5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredItems.map((item, idx) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      onDoubleClick={() => !isEditing && startEditing(item)}
                      className={isEditing ? 'bg-slate-900/90' : 'hover:bg-slate-900/50'}
                    >
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-500">
                        {idx + 1}
                      </td>

                      {/* car_brand */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draft.car_brand ?? ''}
                            onChange={(e) => setDraft((d) => ({ ...d, car_brand: e.target.value }))}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            className="h-8 w-full rounded border border-slate-700 bg-[#090D16] px-2 text-xs text-slate-100 focus:border-amber-500/70 focus:outline-none"
                          />
                        ) : (
                          <span className="font-medium text-slate-100">
                            {item.car_brand || <span className="text-slate-600">—</span>}
                          </span>
                        )}
                      </td>

                      {/* car_model */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draft.car_model ?? ''}
                            onChange={(e) => setDraft((d) => ({ ...d, car_model: e.target.value }))}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            className="h-8 w-full rounded border border-slate-700 bg-[#090D16] px-2 text-xs text-slate-100 focus:border-amber-500/70 focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-200">
                            {item.car_model || <span className="text-slate-600">—</span>}
                          </span>
                        )}
                      </td>

                      {/* oem_code */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draft.oem_code ?? ''}
                            onChange={(e) => setDraft((d) => ({ ...d, oem_code: e.target.value }))}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            className="h-8 w-full rounded border border-amber-500/60 bg-[#090D16] px-2 font-mono text-xs text-sky-300 focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono font-semibold text-sky-300">
                            {item.oem_code || <span className="text-slate-600">—</span>}
                          </span>
                        )}
                      </td>

                      {/* cross_reference */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draft.cross_reference ?? ''}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, cross_reference: e.target.value }))
                            }
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            className="h-8 w-full rounded border border-slate-700 bg-[#090D16] px-2 font-mono text-xs text-slate-200 focus:border-amber-500/70 focus:outline-none"
                          />
                        ) : (
                          <span className="font-mono text-slate-300">
                            {item.cross_reference || <span className="text-slate-600">—</span>}
                          </span>
                        )}
                      </td>

                      {/* fitting_side */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <select
                            value={draft.fitting_side ?? ''}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                fitting_side: e.target.value as FittingSide,
                              }))
                            }
                            className="h-8 w-full rounded border border-slate-700 bg-[#090D16] px-2 font-mono text-xs text-amber-300 focus:border-amber-500/70 focus:outline-none"
                          >
                            <option value="">—</option>
                            <option value="SX">SX</option>
                            <option value="DX">DX</option>
                            <option value="Bilaterale">Bilaterale</option>
                          </select>
                        ) : (
                          <span
                            className={`font-mono font-semibold ${
                              item.fitting_side === 'SX'
                                ? 'text-amber-300'
                                : item.fitting_side === 'DX'
                                  ? 'text-emerald-300'
                                  : item.fitting_side === 'Bilaterale'
                                    ? 'text-sky-300'
                                    : 'text-slate-600'
                            }`}
                          >
                            {item.fitting_side || ''}
                          </span>
                        )}
                      </td>

                      {/* attributes */}
                      <td className="px-3 py-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={draft.attributes ?? ''}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, attributes: e.target.value }))
                            }
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            className="h-8 w-full rounded border border-slate-700 bg-[#090D16] px-2 text-xs text-slate-200 focus:border-amber-500/70 focus:outline-none"
                          />
                        ) : (
                          <span className="text-slate-400">
                            {item.attributes || <span className="text-slate-600">—</span>}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEditing(item.id)}
                                aria-label="Salva"
                                className="inline-flex h-8 w-8 items-center justify-center rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50"
                              >
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                aria-label="Annulla"
                                className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEditing(item)}
                                aria-label="Modifica riga"
                                className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-amber-300"
                              >
                                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteItem(item.id)}
                                aria-label="Elimina riga"
                                className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-rose-950/50 hover:text-rose-300"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards (< md) */}
          <div className="space-y-2.5 md:hidden">
            {filteredItems.map((item, idx) => {
              const isEditing = editingId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-800 bg-[#0A0E17] p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="font-mono text-xs text-slate-400 tabular-nums">
                      #{idx + 1} · {item.fitting_side || '—'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => saveEditing(item.id)}
                            aria-label="Salva"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/50 bg-emerald-950/40 text-emerald-300"
                          >
                            <Check className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            aria-label="Annulla"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            aria-label="Modifica"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-[#101622] text-slate-300"
                          >
                            <Edit3 className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            aria-label="Elimina"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-[#101622] text-rose-400"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <input
                        type="text"
                        value={draft.car_brand ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, car_brand: e.target.value }))}
                        placeholder="car_brand"
                        className="h-10 rounded border border-slate-700 bg-[#090D16] px-2.5 text-slate-100"
                      />
                      <input
                        type="text"
                        value={draft.car_model ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, car_model: e.target.value }))}
                        placeholder="car_model"
                        className="h-10 rounded border border-slate-700 bg-[#090D16] px-2.5 text-slate-100"
                      />
                      <input
                        type="text"
                        value={draft.oem_code ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, oem_code: e.target.value }))}
                        placeholder="oem_code"
                        className="h-10 rounded border border-slate-700 bg-[#090D16] px-2.5 font-mono text-sky-300"
                      />
                      <input
                        type="text"
                        value={draft.cross_reference ?? ''}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, cross_reference: e.target.value }))
                        }
                        placeholder="cross_reference"
                        className="h-10 rounded border border-slate-700 bg-[#090D16] px-2.5 font-mono text-slate-200"
                      />
                      <select
                        value={draft.fitting_side ?? ''}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            fitting_side: e.target.value as FittingSide,
                          }))
                        }
                        className="h-10 rounded border border-slate-700 bg-[#090D16] px-2.5 font-mono text-amber-300"
                      >
                        <option value="">fitting_side</option>
                        <option value="SX">SX</option>
                        <option value="DX">DX</option>
                        <option value="Bilaterale">Bilaterale</option>
                      </select>
                      <input
                        type="text"
                        value={draft.attributes ?? ''}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, attributes: e.target.value }))
                        }
                        placeholder="attributes"
                        className="h-10 rounded border border-slate-700 bg-[#090D16] px-2.5 text-slate-200"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1 text-xs">
                      <div className="font-medium text-slate-100">
                        {item.car_brand || '—'} · {item.car_model || '—'}
                      </div>
                      <div className="font-mono font-semibold text-sky-300">
                        OEM: {item.oem_code || '—'}
                      </div>
                      {item.cross_reference && (
                        <div className="font-mono text-[11px] text-slate-300">
                          Cross-Ref: {item.cross_reference}
                        </div>
                      )}
                      {item.attributes && (
                        <div className="text-[11px] text-slate-400">
                          Note: {item.attributes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};

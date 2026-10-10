import React, { useState, useMemo } from 'react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from './Icons';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchField?: keyof T;
  rowsPerPage?: number;
  actions?: React.ReactNode;
  filterComponent?: React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchField,
  rowsPerPage = 10,
  actions,
  filterComponent,
  emptyMessage = 'No records found matching criteria'
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter(item => {
      if (searchField) {
        return String(item[searchField] || '').toLowerCase().includes(term);
      }
      return Object.values(item).some(val =>
        String(val || '').toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchField]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortOrder === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white border border-[#dbe3d8] flex flex-col">
      {/* Controls Bar */}
      <div className="p-3.5 sm:p-4 border-b border-[#e2e8df] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#fafbfa]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 max-w-lg">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#738776]">
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#c9d4c6] text-[#1c2e22] placeholder-[#8c9c8e] focus:outline-none focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20]"
            />
          </div>
          {filterComponent}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#f1f4ed] border-b border-[#dbe3d8] text-[#4d5e50]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                  className={`px-4 py-2.5 font-semibold uppercase tracking-wider text-[11px] select-none ${
                    col.sortable ? 'cursor-pointer hover:text-[#1b5e20]' : ''
                  } ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                >
                  <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end w-full' : ''}`}>
                    <span>{col.header}</span>
                    {col.sortable && sortKey === col.accessorKey && (
                      <span className="text-[#1b5e20]">
                        <ChevronDownIcon size={12} className={sortOrder === 'desc' ? 'rotate-180 transition-transform' : ''} />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf1ea]">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-[#f7f9f6] transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-4 py-3 text-[#1c2e22] ${
                        col.align === 'right'
                          ? 'text-right tabular-nums'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-xs text-[#758a78]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-[#e2e8df] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#5f7362] bg-[#fafbfa]">
        <div className="tabular-nums text-center sm:text-left">
          Showing <span className="font-semibold text-[#1f3325]">{sortedData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> to{' '}
          <span className="font-semibold text-[#1f3325]">
            {Math.min(currentPage * rowsPerPage, sortedData.length)}
          </span>{' '}
          of <span className="font-semibold text-[#1f3325]">{sortedData.length}</span> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 border border-[#c9d4c6] bg-white text-[#384d3b] hover:bg-[#edf1eb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeftIcon size={14} />
          </button>
          <span className="px-2 text-xs tabular-nums text-[#384d3b] font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 border border-[#c9d4c6] bg-white text-[#384d3b] hover:bg-[#edf1eb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRightIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

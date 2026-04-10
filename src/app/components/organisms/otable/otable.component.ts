import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, HostListener, ViewContainerRef, Injector } from '@angular/core';
import { Column, TableAction, OTableProps, SortConfig, EditingCell } from './otable.types';
import { ComponentPortal } from '@angular/cdk/portal';
import { ThemeService } from '../../../services/theme.service';
@Component({
  selector: 'otable',
  templateUrl: './otable.component.html',
  styleUrls: ['./otable.component.scss'],
  standalone: false
})
export class OTableComponent implements OnInit, OnChanges {
  @Input() columns: Column[] = [];
  @Input() data: Record<string, any>[] = [];
  @Input() moduleTitle: string = 'Reporte';
  @Input() selectable: boolean = false;
  @Input() singleSelection: boolean = false;
  @Input() keyTag: string = 'id';
  @Input() actions: TableAction[] = [];
  @Input() singleAction: (() => void) | null = null;
  @Input() singleActionText: string = 'Agregar';
  @Input() emptyText: string = 'Sin registros';
  @Input() isReorder: boolean = false;
  @Input() filterContent: any;
  filterInjector: Injector;
  @Input() filterText: string = 'Filtro';
  @Input() disableFilter: boolean = false;
  @Input() headerComponent: any;
  @Input() filterComponent: any;

  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() reorder = new EventEmitter<Record<string, any>[]>();
  @Output() rowsChange = new EventEmitter<{ rows: Record<string, any>[]; idx: number; changedKey?: string; changedValue?: any }>();
  @Output() closeDrawer = new EventEmitter<boolean>();
  filterPortal: ComponentPortal<any> | null = null;
  // Internal state
  sortConfig: SortConfig | null = null;
  search: string = '';
  selectedKeys: any[] = [];
  rows: Record<string, any>[] = [];
  editing: EditingCell | null = null;
  editValue: any = '';
  drawerOpen: boolean = false;
  dragSrcKey: string | null = null;

  // Default actions
  defaultActions: TableAction[] = [
    { title: 'Carga manual', icon: 'border_color', action: () => { } },
    { title: 'Carga masiva', icon: 'upload', action: () => { } }
  ];

  // Computed properties
  get visibleColumns(): Column[] {
    return this.columns.filter(col => col.visible !== false);
  }

  get tableActions(): TableAction[] {
    return this.actions && this.actions.length > 0 ? this.actions : this.defaultActions;
  }

  getColumnWidth(col: Column): number {
    return col.width && col.width > 0 ? col.width : 100;
  }

  get sortedData(): Record<string, any>[] {
    if (!this.sortConfig || this.isReorder) return this.rows;
    const copy = [...this.rows];
    copy.sort((a, b) => {
      const aVal = a[this.sortConfig!.key];
      const bVal = b[this.sortConfig!.key];
      if (aVal < bVal) return this.sortConfig!.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortConfig!.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }

  get filteredData(): Record<string, any>[] {
    if (!this.search.trim()) return this.sortedData;
    const q = this.search.toLowerCase();
    return this.sortedData.filter(row =>
      this.visibleColumns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
    );
  }

  get isMobile(): boolean {
    return window.innerWidth <= 768;
  }


  constructor(
    private injector: Injector,
    public themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.rows = [...this.data];
    // Expose functions to window for external control
    (window as any).openOTableFilter = () => this.openFilterDrawer();
    (window as any).closeOTableFilter = () => this.closeFilterDrawer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.rows = [...this.data];
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Handle responsive changes if needed
  }

  // ============================================
  // SORTING
  // ============================================

  requestSort(key: string): void {
    if (this.isReorder) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (this.sortConfig?.key === key && this.sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    this.sortConfig = { key, direction };
  }

  // ============================================
  // SELECTION
  // ============================================

  toggleSelection(keyValue: any): void {
    let newSelected: any[];
    if (this.singleSelection) {
      newSelected = this.selectedKeys.includes(keyValue) ? [] : [keyValue];
    } else {
      newSelected = this.selectedKeys.includes(keyValue)
        ? this.selectedKeys.filter(k => k !== keyValue)
        : [...this.selectedKeys, keyValue];
    }
    this.selectedKeys = newSelected;
    this.selectionChange.emit(newSelected);
  }

  // ============================================
  // ROW KEY MANAGEMENT
  // ============================================

  private rowKeyMap = new WeakMap<any, string>();

  getRowKey(row: any, idx: number): string {
    const v = this.keyTag ? row?.[this.keyTag] : undefined;
    if (v !== undefined && v !== null && v !== '') return String(v);
    const existing = this.rowKeyMap.get(row);
    if (existing) return existing;
    const gen = `rk-${idx}-${Math.random().toString(36).slice(2, 8)}`;
    this.rowKeyMap.set(row, gen);
    return gen;
  }

  // ============================================
  // DRAG & DROP REORDERING
  // ============================================

  onDragStart(row: Record<string, any>, idx: number, event: DragEvent): void {
    if (!this.isReorder || this.isEditingCell(row, null, idx)) return;
    const k = this.getRowKey(row, idx);
    this.dragSrcKey = k;
    try {
      event.dataTransfer!.setData('text/plain', k);
      event.dataTransfer!.effectAllowed = 'move';
    } catch (e) { }
  }

  onDragOver(event: DragEvent): void {
    if (!this.isReorder) return;
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(targetRow: Record<string, any>, targetIdx: number, event: DragEvent): void {
    if (!this.isReorder) return;
    event.preventDefault();
    const fromKey = event.dataTransfer!.getData('text/plain') || this.dragSrcKey;
    if (!fromKey) return;

    const srcIndex = this.rows.findIndex((r, i) => this.getRowKey(r, i) === fromKey);
    const destIndex = this.rows.findIndex((r, i) => this.getRowKey(r, i) === this.getRowKey(targetRow, targetIdx));
    if (srcIndex === -1 || destIndex === -1) return;

    const next = [...this.rows];
    const [moved] = next.splice(srcIndex, 1);
    next.splice(destIndex, 0, moved);

    this.rows = next;
    this.reorder.emit(next);
    this.rowsChange.emit({ rows: next, idx: targetIdx });
    this.dragSrcKey = null;
  }

  onDragEnd(): void {
    this.dragSrcKey = null;
  }

  // ============================================
  // INLINE EDITING
  // ============================================

  isEditingCell(row: any, colKey?: string | null, idx?: number): boolean {
    if (!this.editing) return false;
    const rk = this.getRowKey(row, idx ?? 0);
    if (colKey == null) return this.editing.rowKey === rk;
    return this.editing.rowKey === rk && this.editing.colKey === colKey;
  }

  beginEdit(row: any, col: Column, idx: number): void {
    if (!col.editable) return;
    if (col.disabledEdit?.(row)) return;
    const rk = this.getRowKey(row, idx);
    this.editing = { rowKey: rk, colKey: col.key };
    this.editValue = row[col.key] ?? '';
  }

  commitEdit(row: any, col: Column, idx: number, newValue?: any): void {
    const rk = this.getRowKey(row, idx);
    const finalValue = newValue ?? this.editValue;
    const next = this.rows.map((r, i) =>
      this.getRowKey(r, i) === rk ? { ...r, [col.key]: this.normalizeValue(col, finalValue) } : r
    );

    this.rows = next;
    this.rowsChange.emit({ rows: next, idx, changedKey: col.key, changedValue: finalValue });
    this.editing = null;
    this.editValue = '';

    if (col.onBlur) col.onBlur(finalValue, idx);
  }

  cancelEdit(): void {
    this.editing = null;
    this.editValue = '';
  }

  normalizeValue(col: Column, v: any): any {
    const str = String(v).trim();

    if (col.inputType === 'number') {
      const n = parseFloat(str.replace(',', '.'));
      return Number.isFinite(n) ? n : 0;
    }

    if (col.inputType === 'price') {
      const decimals = Number.isInteger(col.decimalsCount) ? col.decimalsCount : 6;
      let n = parseFloat(str.replace(/[^\d.]/g, '') || '0');
      if (!Number.isFinite(n)) n = 0;
      return n.toFixed(decimals);
    }

    if (col.inputType === 'date') {
      return str || new Date().toISOString().split('T')[0];
    }

    return str;
  }

  // ============================================
  // DISPLAY VALUE
  // ============================================

  displayValue(col: Column, row: any): any {
    if (col.render) return col.render(row[col.key], row);
    if (col.inputType === 'select' && col.options) {
      const opt = col.options.find(o => String(o.value) === String(row[col.key]));
      return opt ? opt.label : row[col.key];
    }
    return row[col.key];
  }

  // ============================================
  // DRAWER MANAGEMENT
  // ============================================

  openFilterDrawer() {
    this.drawerOpen = true;
  }

  closeFilterDrawer(): void {
    this.drawerOpen = false;
    this.closeDrawer.emit(this.drawerOpen);
  }

  // ============================================
  // ACTIONS
  // ============================================

  onActionClick(action: TableAction): void {
    action.action();
  }

  onSingleActionClick(): void {
    if (this.singleAction) {
      this.singleAction();
    }
  }

  // ============================================
  // INLINE EDITING CONTINUED
  // ============================================

  onAutocompleteInput(event: any, col: Column, idx: number): void {
    const value = event.target.value;
    this.editValue = value;

    if (col.onSearch) {
      const results = col.onSearch(value, idx);
      if (results instanceof Promise) {
        results.then(res => {
          if (Array.isArray(res)) {
            col.options = res;
          }
        });
      } else if (Array.isArray(results)) {
        col.options = results;
      }

      const match = (col.options || []).find((opt: any) => opt.label === value);
      if (match && col.onSelection) {
        col.onSelection(match, idx);
      }
    }
  }

  onSelectChange(event: any, row: any, col: Column, idx: number): void {
    const value = event.target.value;
    this.commitEdit(row, col, idx, value);

    if (col.onSelection) {
      const option = col.options?.find(opt => String(opt.value) === String(value));
      if (option) {
        col.onSelection(option, idx);
      }
    }
  }

  onInputChange(event: any, col: Column): void {
    let val = event.target.value;

    if (col.inputType === 'price') {
      const decimals = Number.isInteger(col.decimalsCount) ? col.decimalsCount : 2;
      val = val.replace(/[^\d.]/g, '');

      if (decimals === 0) {
        val = val.replace(/\..*$/, '');
      } else {
        const [int, dec] = val.split('.');
        if (dec && dec.length > decimals) {
          val = `${int}.${dec.slice(0, decimals)}`;
        }
      }
    }

    this.editValue = val;
  }

  onEditKeyDown(event: KeyboardEvent, row: any, col: Column, idx: number): void {
    if (event.key === 'Enter') {
      this.commitEdit(row, col, idx);
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  getInputType(col: Column): string {
    switch (col.inputType) {
      case 'number': return 'number';
      case 'date': return 'date';
      default: return 'text';
    }
  }

  getInputStep(col: Column): string | undefined {
    if (col.inputType === 'price') {
      const decimals = Number.isInteger(col.decimalsCount) ? col.decimalsCount : 2;
      return decimals === 0 ? '1' : `0.${'0'.repeat(decimals - 1)}1`;
    }
    return undefined;
  }

  getInputPattern(col: Column): string | undefined {
    if (col.inputType === 'price') {
      const decimals = Number.isInteger(col.decimalsCount) ? col.decimalsCount : 2;
      return decimals === 0 ? '^\\d*$' : `^\\d*(\\.\\d{0,${decimals}})?$`;
    }
    return undefined;
  }

  // ============================================
  // ACTIONS POPOVER (simplified)
  // ============================================

  showActionsPopover: boolean = false;
  popoverPosition: { x: number; y: number } = { x: 0, y: 0 };

  openActionsPopover(event: MouseEvent): void {
    this.showActionsPopover = true;
    this.popoverPosition = {
      x: event.clientX,
      y: event.clientY
    };
  }

  closeActionsPopover(): void {
    this.showActionsPopover = false;
  }

  trackByColumnKey(index: number, column: Column): string {
    return column.key;
  }

  trackByRowKey(index: number, row: Record<string, any>): any {
    return row[this.keyTag] || index;
  }


}

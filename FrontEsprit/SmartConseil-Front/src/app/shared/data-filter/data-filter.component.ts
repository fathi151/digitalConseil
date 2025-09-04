import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FilterConfig, FilterField } from '../../services/filter.service';

@Component({
  selector: 'app-data-filter',
  templateUrl: './data-filter.component.html',
  styleUrls: ['./data-filter.component.css'],
  standalone: false
})
export class DataFilterComponent implements OnInit {
  @Input() config: FilterConfig = { searchFields: [] };
  @Input() data: any[] = [];
  @Output() filterChange = new EventEmitter<{ searchTerm: string, filters: any }>();

  searchTerm: string = '';
  filters: any = {};
  showAdvancedFilters: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Initialize filters object
    if (this.config.filterFields) {
      this.config.filterFields.forEach(field => {
        this.filters[field.key] = '';
      });
    }
  }

  onSearchChange(): void {
    this.emitFilterChange();
  }

  onFilterChange(): void {
    this.emitFilterChange();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  clearFilters(): void {
    this.searchTerm = '';
    if (this.config.filterFields) {
      this.config.filterFields.forEach(field => {
        this.filters[field.key] = '';
      });
    }
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    this.filterChange.emit({
      searchTerm: this.searchTerm,
      filters: this.filters
    });
  }

  getFilterOptions(field: FilterField): string[] {
    if (field.options) {
      return field.options;
    }
    
    // Generate options from data
    const values = this.data.map(item => this.getNestedValue(item, field.key))
      .filter(value => value !== null && value !== undefined && value !== '');
    return [...new Set(values)].sort();
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }
}

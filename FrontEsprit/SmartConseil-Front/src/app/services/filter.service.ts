import { Injectable } from '@angular/core';

export interface FilterConfig {
  searchFields: string[];
  filterFields?: FilterField[];
}

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text';
  options?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() { }

  /**
   * Filter data based on search term and filters
   */
  filterData<T>(data: T[], searchTerm: string, filters: any, config: FilterConfig): T[] {
    let filteredData = [...data];

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredData = filteredData.filter(item => {
        return config.searchFields.some(field => {
          const value = this.getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply additional filters
    if (config.filterFields && filters) {
      config.filterFields.forEach(filterField => {
        const filterValue = filters[filterField.key];
        if (filterValue && filterValue !== '') {
          filteredData = filteredData.filter(item => {
            const itemValue = this.getNestedValue(item, filterField.key);
            
            if (filterField.type === 'select') {
              return itemValue === filterValue;
            } else if (filterField.type === 'date') {
              // Basic date filtering - can be enhanced
              return itemValue && itemValue.toString().includes(filterValue);
            } else {
              return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
            }
          });
        }
      });
    }

    return filteredData;
  }

  /**
   * Get nested property value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  /**
   * Get unique values for a field (useful for generating filter options)
   */
  getUniqueValues<T>(data: T[], field: string): string[] {
    const values = data.map(item => this.getNestedValue(item, field))
      .filter(value => value !== null && value !== undefined && value !== '');
    return [...new Set(values)].sort();
  }

  /**
   * Sort data by field
   */
  sortData<T>(data: T[], field: string, direction: 'asc' | 'desc' = 'asc'): T[] {
    return [...data].sort((a, b) => {
      const aValue = this.getNestedValue(a, field);
      const bValue = this.getNestedValue(b, field);
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });
  }


  paginateData<T>(data: T[], page: number, pageSize: number): { data: T[], totalPages: number, totalItems: number } {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      data: data.slice(startIndex, endIndex),
      totalPages,
      totalItems
    };
  }
}

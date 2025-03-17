import React from 'react';
import { Button, Modal, Selector } from '@components';
import { EntityType } from '@api';
import { TABLE_FILTERS, FilterConfig } from '@config';
import styles from './style.module.scss';

interface FiltersProps {
  type: EntityType;
  isOpen: boolean;
  onClose: () => void;
  activeFilters: Record<string, any>;
  rangeFilters: Record<string, boolean>;
  onFilterChange: (field: string, value: any, isRange?: boolean) => void;
  onRangeToggle: (field: string) => void;
  onReset: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  type,
  isOpen,
  onClose,
  activeFilters,
  rangeFilters,
  onFilterChange,
  onRangeToggle,
  onReset,
}) => {
  const filters = TABLE_FILTERS[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Фильтры" size="md">
      <div className={styles.filtersModal}>
        {filters.map((filter: FilterConfig) => (
          <div key={filter.field} className={styles.filterField}>
            <label>{filter.label}</label>
            {filter.type === 'select' && (
              <Selector
                options={filter.options || []}
                value={activeFilters[filter.field] || ''}
                onChange={value => onFilterChange(filter.field, value)}
              />
            )}
            {(filter.type === 'date' || filter.type === 'number') && (
              <div className={styles.rangeFilter}>
                <div className={styles.rangeToggle}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={rangeFilters[filter.field] || false}
                      onChange={() => onRangeToggle(filter.field)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span>Диапазон</span>
                </div>
                {rangeFilters[filter.field] ? (
                  <div className={styles.rangeInputs}>
                    <div className={styles.rangeInput}>
                      <span>{filter.rangeLabels?.from}</span>
                      {filter.type === 'date' ? (
                        <input
                          type="date"
                          value={activeFilters[`${filter.field}From`] || ''}
                          onChange={e =>
                            onFilterChange(
                              filter.field,
                              {
                                from: e.target.value,
                                to: activeFilters[`${filter.field}To`] || '',
                              },
                              true,
                            )
                          }
                        />
                      ) : (
                        <input
                          type="number"
                          value={activeFilters[`${filter.field}From`] || ''}
                          onChange={e =>
                            onFilterChange(
                              filter.field,
                              {
                                from: e.target.value,
                                to: activeFilters[`${filter.field}To`] || '',
                              },
                              true,
                            )
                          }
                          min={filter.validation?.min}
                        />
                      )}
                    </div>
                    <div className={styles.rangeInput}>
                      <span>{filter.rangeLabels?.to}</span>
                      {filter.type === 'date' ? (
                        <input
                          type="date"
                          value={activeFilters[`${filter.field}To`] || ''}
                          onChange={e =>
                            onFilterChange(
                              filter.field,
                              {
                                from:
                                  activeFilters[`${filter.field}From`] || '',
                                to: e.target.value,
                              },
                              true,
                            )
                          }
                        />
                      ) : (
                        <input
                          type="number"
                          value={activeFilters[`${filter.field}To`] || ''}
                          onChange={e =>
                            onFilterChange(
                              filter.field,
                              {
                                from:
                                  activeFilters[`${filter.field}From`] || '',
                                to: e.target.value,
                              },
                              true,
                            )
                          }
                          min={filter.validation?.min}
                        />
                      )}
                    </div>
                  </div>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={activeFilters[filter.field] || ''}
                    onChange={e => onFilterChange(filter.field, e.target.value)}
                  />
                ) : (
                  <input
                    type="number"
                    value={activeFilters[filter.field] || ''}
                    onChange={e => onFilterChange(filter.field, e.target.value)}
                    min={filter.validation?.min}
                  />
                )}
              </div>
            )}
            {filter.type === 'text' && (
              <input
                type="text"
                value={activeFilters[filter.field] || ''}
                onChange={e => onFilterChange(filter.field, e.target.value)}
                pattern={filter.validation?.pattern?.source}
              />
            )}
          </div>
        ))}
        <div className={styles.filterActions}>
          <Button variant="outline" label="Сбросить" onClick={onReset} />
          <Button variant="primary" label="Применить" onClick={onClose} />
        </div>
      </div>
    </Modal>
  );
};

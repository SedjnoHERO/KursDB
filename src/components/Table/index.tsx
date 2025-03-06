import React, { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { Button, Modal, Skeleton } from '@components';
import { TableAPI, EntityType } from '@api';
import { TABLE_TRANSLATIONS } from '@config';
import { toast } from 'sonner';
import styles from './style.module.scss';

interface ITableProps {
  type: EntityType;
}

export const TableComponent: React.FC<ITableProps> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTableData = async () => {
    setIsLoading(true);
    toast.loading('Идет загрузка, пожалуйста подождите...', {
      position: 'bottom-right',
      duration: Infinity,
    });

    const fetchedData = await TableAPI.fetchData(type);
    if (fetchedData.length > 0) {
      setColumns(Object.keys(fetchedData[0]));
      setData(fetchedData);
    }

    setIsLoading(false);
    toast.dismiss();
  };

  useEffect(() => {
    fetchTableData();
  }, [type]);

  useEffect(() => {
    const filtered = data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
    setFilteredData(filtered);
  }, [data, searchQuery]);

  const handleAdd = async () => {
    const result = await TableAPI.createRecord(type, formData);
    if (result) {
      setIsAddModalOpen(false);
      setFormData({});
      fetchTableData();
    }
  };

  const handleEdit = async () => {
    if (!selectedRow) return;
    const result = await TableAPI.updateRecord(type, selectedRow.id, formData);
    if (result) {
      setIsEditModalOpen(false);
      setSelectedRow(null);
      setFormData({});
      fetchTableData();
    }
  };

  const handleDelete = async () => {
    if (!selectedRow) return;
    const result = await TableAPI.deleteRecord(type, selectedRow.id);
    if (result) {
      setIsDeleteModalOpen(false);
      setSelectedRow(null);
      fetchTableData();
    }
  };

  const renderForm = (onSubmit: () => void) => (
    <div className={styles.form}>
      {columns.map(column => {
        if (column === 'id' || column === 'created_at') return null;

        const columnLabel =
          TABLE_TRANSLATIONS[type]?.columns?.[column] || column;

        return (
          <div key={`field-${column}`} className={styles.field}>
            <label>{columnLabel}</label>
            <input
              type="text"
              value={formData[column] || ''}
              onChange={e =>
                setFormData({ ...formData, [column]: e.target.value })
              }
              placeholder={`Введите ${columnLabel.toLowerCase()}`}
            />
          </div>
        );
      })}
      <div className={styles.actions}>
        <Button variant="primary" label="Сохранить" onClick={onSubmit} />
        <Button
          variant="outline"
          label="Отмена"
          onClick={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setFormData({});
          }}
        />
      </div>
    </div>
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);

  return (
    <>
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          {isLoading ? (
            <Skeleton type="title" />
          ) : (
            <h2 className={styles.title}>{TABLE_TRANSLATIONS[type].name}</h2>
          )}
          <div className={styles.searchContainer}>
            <div className={styles.searchInput}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              leftIcon={<FaPlus />}
              label="Добавить"
              onClick={() => setIsAddModalOpen(true)}
              disabled={isLoading}
            />
            <div className={styles.filters}>
              <Button
                variant="outline"
                leftIcon={<FaFilter />}
                label="Фильтры"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                {columns.map(column => {
                  const columnLabel =
                    TABLE_TRANSLATIONS[type]?.columns?.[column] || column;
                  return (
                    <th key={`header-${column}`}>
                      {isLoading ? (
                        <Skeleton />
                      ) : (
                        <div className={styles.columnHeader}>
                          <span className={styles.columnLabel}>
                            {columnLabel}
                          </span>
                        </div>
                      )}
                    </th>
                  );
                })}
                <th key="actions-header">
                  <div className={styles.columnHeader}>
                    <span className={styles.columnLabel}>Действия</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={`skeleton-row-${index}`}>
                        {Array(columns.length + 1)
                          .fill(0)
                          .map((_, colIndex) => (
                            <td key={`skeleton-cell-${index}-${colIndex}`}>
                              <Skeleton />
                            </td>
                          ))}
                      </tr>
                    ))
                : filteredData.slice(startIndex, endIndex).map(row => (
                    <tr key={row.id}>
                      {columns.map(column => (
                        <td key={`${row.id}-${column}`}>{row[column]}</td>
                      ))}
                      <td className={styles.actions}>
                        <Button
                          variant="outline"
                          leftIcon={<FaEdit />}
                          label="Изменить"
                          onClick={() => {
                            setSelectedRow(row);
                            setFormData(row);
                            setIsEditModalOpen(true);
                          }}
                        />
                        <Button
                          variant="outline"
                          leftIcon={<FaTrash />}
                          label="Удалить"
                          onClick={() => {
                            setSelectedRow(row);
                            setIsDeleteModalOpen(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            {isLoading ? (
              <Skeleton style={{ width: '200px' }} />
            ) : (
              `Показано ${startIndex + 1}-${endIndex} из ${filteredData.length} записей`
            )}
          </div>
          <div className={styles.pageControls}>
            <Button
              variant="outline"
              label="Назад"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1 || isLoading}
            />
            <span className={styles.pageNumber}>
              {isLoading ? (
                <Skeleton style={{ width: '50px' }} />
              ) : (
                `${currentPage} из ${totalPages}`
              )}
            </span>
            <Button
              variant="outline"
              label="Вперёд"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages || isLoading}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData({});
        }}
        title={`Добавить ${TABLE_TRANSLATIONS[type].name.toLowerCase()}`}
      >
        {renderForm(handleAdd)}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRow(null);
          setFormData({});
        }}
        title={`Изменить ${TABLE_TRANSLATIONS[type].name.toLowerCase()}`}
      >
        {renderForm(handleEdit)}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRow(null);
        }}
        title="Подтверждение удаления"
      >
        <div className={styles.deleteConfirmation}>
          <p>Вы действительно хотите удалить эту запись?</p>
          <div className={styles.actions}>
            <Button variant="primary" label="Удалить" onClick={handleDelete} />
            <Button
              variant="outline"
              label="Отмена"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedRow(null);
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

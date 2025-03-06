import React, { useEffect, useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { Button, Modal } from '@components';
import { TableAPI, EntityType } from '@api';
import { TABLE_TRANSLATIONS } from '@config';
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

  const fetchTableData = async () => {
    const fetchedData = await TableAPI.fetchData(type);
    if (fetchedData.length > 0) {
      setColumns(Object.keys(fetchedData[0]));
      setData(fetchedData);
    }
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

  const renderForm = (onSubmit: () => void, initialData = {}) => (
    <div className={styles.form}>
      {columns.map(column => {
        if (column === 'id' || column === 'created_at') return null;

        const columnLabel =
          TABLE_TRANSLATIONS[type]?.columns?.[column] || column;

        return (
          <div key={column} className={styles.field}>
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
          <h2 className={styles.title}>{TABLE_TRANSLATIONS[type].name}</h2>
          <div className={styles.searchContainer}>
            <div className={styles.searchInput}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              variant="primary"
              leftIcon={<FaPlus />}
              label="Добавить"
              onClick={() => setIsAddModalOpen(true)}
            />
            <div className={styles.filters}>
              <Button
                variant="outline"
                leftIcon={<FaFilter />}
                label="Фильтры"
              />
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index}>
                    {TABLE_TRANSLATIONS[type].columns[column]}
                  </th>
                ))}
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(startIndex, endIndex).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>{row[column]}</td>
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
            Показано {startIndex + 1}-{endIndex} из {filteredData.length}{' '}
            записей
          </div>
          <div className={styles.pageControls}>
            <Button
              variant="outline"
              label="Назад"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
            />
            <span className={styles.pageNumber}>
              {currentPage} из {totalPages}
            </span>
            <Button
              variant="outline"
              label="Вперёд"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
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
        {renderForm(handleEdit, selectedRow)}
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

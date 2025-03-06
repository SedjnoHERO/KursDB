import React, { useEffect, useState } from 'react';
import { Supabase } from '@api';
import styles from './style.module.scss';
import { FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '@components';
import { toast } from 'sonner';

interface ITableProps {
  type: 'AIRPORT' | 'AIRPLANE' | 'AIRLINE' | 'FLIGHT' | 'TICKET' | 'PASSENGER';
}

export const TableComponent: React.FC<ITableProps> = ({ type }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [newData, setNewData] = useState<any>({});

  const fetchData = async () => {
    const { data, error } = await Supabase.from(type).select('*');
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data && data.length > 0) {
      setColumns(Object.keys(data[0]));
      setData(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;

    const { error } = await Supabase.from(type).delete().eq('id', id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Запись успешно удалена');
    fetchData();
  };

  const handleAdd = async () => {
    const { error } = await Supabase.from(type).insert(newData);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Запись успешно добавлена');
    setNewData({});
    fetchData();
  };

  const handleEdit = async (row: any) => {
    setSelectedRow(row);
    setEditData({ ...row });
    setIsEditing(true);
  };

  const handleUpdate = async () => {
    if (!selectedRow) return;

    const { error } = await Supabase.from(type)
      .update(editData)
      .eq('id', selectedRow.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Запись успешно обновлена');
    setIsEditing(false);
    setSelectedRow(null);
    fetchData();
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.tableHeader}>
        <h2 className={styles.title}>
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </h2>
        <div className={styles.actions}>
          <Button variant="outline" leftIcon={<FaSearch />} label="Поиск" />
          <Button
            variant="primary"
            leftIcon={<FaPlus />}
            label="Добавить"
            onClick={() => setIsEditing(false)}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(startIndex, endIndex).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>{row[column]}</td>
                ))}
                <td className={styles.actions}>
                  <Button
                    variant="outline"
                    leftIcon={<FaEdit />}
                    label="Изменить"
                    onClick={() => handleEdit(row)}
                  />
                  <Button
                    variant="outline"
                    leftIcon={<FaTrash />}
                    label="Удалить"
                    onClick={() => handleDelete(row.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.pageInfo}>
          Показано {startIndex + 1}-{endIndex} из {data.length} записей
        </div>
        <div className={styles.pageControls}>
          <Button
            variant="outline"
            label="Назад"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
          />
          <Button
            variant="outline"
            label="Вперёд"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
          />
        </div>
      </div>

      {isEditing && (
        <div className={styles.editForm}>
          {columns.map(
            (column, index) =>
              column !== 'id' &&
              column !== 'created_at' && (
                <div key={index}>
                  <label>{column}</label>
                  <input
                    type="text"
                    value={editData[column] || ''}
                    onChange={e =>
                      setEditData({ ...editData, [column]: e.target.value })
                    }
                  />
                </div>
              ),
          )}
          <Button variant="primary" label="Сохранить" onClick={handleUpdate} />
        </div>
      )}

      {!isEditing && (
        <div className={styles.addForm}>
          {columns.map(
            (column, index) =>
              column !== 'id' &&
              column !== 'created_at' && (
                <div key={index}>
                  <label>{column}</label>
                  <input
                    type="text"
                    value={newData[column] || ''}
                    onChange={e =>
                      setNewData({ ...newData, [column]: e.target.value })
                    }
                  />
                </div>
              ),
          )}
          <Button variant="primary" label="Добавить" onClick={handleAdd} />
        </div>
      )}
    </div>
  );
};

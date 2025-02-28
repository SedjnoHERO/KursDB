import React, { useEffect, useState } from 'react';
import { Supabase } from '@database/supabase';
import styles from './style.module.scss';

interface ITableProps {
  type: 'AIRPORT' | 'AIRPLANE' | 'AIRLINE' | 'FLIGHT' | 'TICKET' | 'PASSENGER';
}

export const TableComponent: React.FC<ITableProps> = ({ type }) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await Supabase.from(type).select('*');
      if (error) {
        console.error(error);
        return;
      }
      if (data && data.length > 0) {
        setColumns(Object.keys(data[0]));
        setData(data);
      }
    };

    fetchData();
  }, [type]);

  return (
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

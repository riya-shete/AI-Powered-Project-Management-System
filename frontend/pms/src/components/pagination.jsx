// components/Pagination.jsx
import React from 'react';
import { Pagination as RSuitePagination } from 'rsuite';

const Pagination = ({ 
  total, 
  limit, 
  page, 
  onChangePage,
  ...otherProps 
}) => {
  return (
    <RSuitePagination 
      total={total}
      limit={limit}
      activePage={page}
      onChangePage={onChangePage}
      {...otherProps}
    />
  );
};

export default Pagination;
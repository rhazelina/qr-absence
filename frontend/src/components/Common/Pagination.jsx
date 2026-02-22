import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  lastPage, 
  onPageChange, 
  total, 
  from, 
  to 
}) => {
  if (lastPage <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    
    if (lastPage <= showMax) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(lastPage, start + showMax - 1);
      
      if (end === lastPage) start = Math.max(1, end - showMax + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (start > 1) {
        if (start > 2) pages.unshift('...');
        pages.unshift(1);
      }
      
      if (end < lastPage) {
        if (end < lastPage - 1) pages.push('...');
        pages.push(lastPage);
      }
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Menampilkan <span>{from || 0}</span> - <span>{to || 0}</span> dari <span>{total || 0}</span> data
      </div>
      <div className="pagination-controls">
        <button 
          className="page-btn prev" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &laquo;
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            className={`page-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
            disabled={page === '...'}
            onClick={() => typeof page === 'number' && onPageChange(page)}
          >
            {page}
          </button>
        ))}
        
        <button 
          className="page-btn next" 
          disabled={currentPage === lastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default Pagination;

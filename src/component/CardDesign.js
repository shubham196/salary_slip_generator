import React, { useState } from 'react';

export default function CardDesign() {
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 2; // 1 image per row, so 2 images per page
  const lastIndex = currentPage * imagesPerPage;
  const firstIndex = lastIndex - imagesPerPage;
  // Sample image URLs
  const imageUrls = [
    "./assets/images/back_1.jpg",
    "./assets/images/back_2.jpg",
    "./assets/images/back_3.jpg",
    "./assets/images/back_2.jpg"

  ];
  const images = imageUrls.slice(firstIndex, lastIndex);

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prePage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container">
      <div className='card-container'>
        <h1>CARD DESIGNS</h1>
        {images.map((imageUrl, index) => (
          index % 2 === 0 && ( // Check if index is even
            <div key={index / 2} className="row">
              <div className="column">
                <img src={imageUrl} alt={`Image ${index + firstIndex + 1}`} />
                <p>Card Design {index + firstIndex + 1}</p>
              </div>
              {/* Check if there is a next image available */}
              {images[index + 1] && (
                <div className="column">
                  <img src={images[index + 1]} alt={`Image ${index + firstIndex + 2}`} />
                  <p>Card Design {index + firstIndex + 2}</p>
                </div>
              )}
            </div>
          )
        ))}
       <div className="pagination-container">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={prePage} disabled={currentPage === 1}>
                  Previous
                </button>
              </li>
              {Array.from({ length: Math.ceil(imageUrls.length / imagesPerPage) }, (_, index) => index + 1).map((pageNum) => (
                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                    {pageNum}
                  </button>
                </li>
              ))}
              <li className={`page-item ${lastIndex >= imageUrls.length ? 'disabled' : ''}`}>
                <button className="page-link" onClick={nextPage} disabled={lastIndex >= imageUrls.length}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

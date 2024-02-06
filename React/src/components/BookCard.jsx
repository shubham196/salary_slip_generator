import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

const BookCard = ({ book }) => { // Remove imageUrl from destructured props
console.log();

  return (
    <div className="card-container">
       <h2>
          <Link to={`/show-book/${book._id}`}>{book.name}</Link>
        </h2>
      <img src={`http://localhost:3000/uploads/${book.image}`} alt="Books" height={200} /> 
      <div className="desc">
        {/* <h3>{book.image}</h3> */}
        <h3>{book.name}</h3>
        <p>{book.designation}</p>
      </div>
    </div>
  );
};

export default BookCard;

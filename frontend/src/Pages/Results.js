import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Results() {
  
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/');
  }
  
  return (
    <div>
      <h1>Results</h1>
      <button onClick={handleButtonClick}>Return</button>
     </div>
  );
}

export default Results;
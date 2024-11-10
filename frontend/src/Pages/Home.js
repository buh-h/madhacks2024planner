import React, { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';

function Home() {

  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/Results');
  }

  const [start, setInput1] = useState('');
  const [end, setInput2] = useState('');

  const handleStart = (event) => {
    setInput1(event.target.value);
  };

  const handleEnd = (event) => {
    setInput2(event.target.value);
  };

  return (
    <div className="Home">
      <h1>Nearest Restuarants</h1>
      <br />
      <form>
        <label>
        Your Location:&nbsp;
          <input type="text" value={start} onChange={handleStart} />
        </label>
      </form>
      <br />
      <form>
        <label>
          Destination:&nbsp; 
          <input type="text" value={end} onChange={handleEnd}/>
        </label>
      </form>
      <br />
      <p>Start: {start} </p>
      <p>End: {end} </p>
      <br /> 
      <button onClick={handleButtonClick}>Enter</button>
    </div>
  );
}

export default Home;
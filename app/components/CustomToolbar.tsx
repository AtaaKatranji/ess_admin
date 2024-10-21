import React, { useState } from 'react';


interface CustomToolBarProps {
  onNavigate: (direction: string) => void;
}

const CustomToolbar: React.FC<CustomToolBarProps> = (props) => {
  const [viewState, setViewState] = useState('month');

  const goToBack = () => {
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const goToToday = () => {
    props.onNavigate('TODAY');
  };




  return (
    <div className="custom-toolbar space-x-11">
      <button onClick={goToBack}>‹</button>
      <button onClick={goToToday}>Today</button>
      <button onClick={goToNext}>›</button>

    </div>
  );
};

export default CustomToolbar;
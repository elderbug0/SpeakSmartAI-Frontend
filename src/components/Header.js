import React from 'react';

const Header = () => {
  return (
    <header className="w-full bg-gray-100 fixed top-0 left-0 right-0 z-10 shadow">
      <div className="w-full mx-auto py-4 px-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800" style={{ color: '#3F3F3F', marginLeft: '80px' }}>
          Speak Smart AI
        </h1>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import Navbar from './Components/Navbar/Navbar';
import Admin from './Pages/Admin/Admin'

const App = () => {
  console.log("App rendered");
  return (
    <div>
      <Navbar/>
      <Admin/>
    </div>
  );
};

export default App;

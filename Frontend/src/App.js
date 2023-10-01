import React from 'react';
import './App.css';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Start from './pages/Start';
import KundenPortal from './pages/Kunden-portal';
import HaenderPortal from './pages/Haendler-portal';
import MitarbeiterPortal from './pages/Mitarbeiter-Portal';
import AdminPrtal from './pages/Admin-Portal';
import { sectionContact, rolleContact } from './Contect';
import Passwortvergessen from './pages/Passwortvergessen';

function App() {
  
  const [section, setsection] = React.useState('')
  const [rolle, setrolle] = React.useState({
    a:'',
    id:Number,
    more:{}
  })

  return (
    <div className="App">
      <sectionContact.Provider value={{section, setsection}}>
        <rolleContact.Provider value={{rolle, setrolle}}>
        <BrowserRouter>
              <Routes>
                      <Route exact path='/' element={<Start/>} />
                      <Route exact path='/kunden-portal' element={<KundenPortal/>} />
                      <Route exact path='/mitarbeitern-portal' element={<MitarbeiterPortal/>} />
                      <Route exact path='/haendlern-portal' element={<HaenderPortal/>} />
                      <Route exact path='/admin-portal' element={<AdminPrtal/>} />
                      <Route exact path='/passwortvergessen' element={<Passwortvergessen />} />
                      <Route exact path='*' element={<Start/>} />
              </Routes>
        </BrowserRouter>
        </rolleContact.Provider>
        </sectionContact.Provider>
    </div>
  );
}

export default App;

// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/routes/Home';   
import Profiles from './components/routes/Profiles';
import GroupMessaging from './components/routes/GroupMessaging';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/group-messaging" element={<GroupMessaging />} />
      </Routes>
    </Router>
  );
};

export default App;

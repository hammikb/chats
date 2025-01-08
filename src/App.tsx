// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '.';
import Profiles from './routes/Profiles';
import GroupMessaging from './routes/GroupMessaging';

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

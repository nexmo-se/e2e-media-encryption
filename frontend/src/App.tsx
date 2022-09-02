import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SessionContextProvider } from 'contexts/session';
import Main from 'pages/Main';
import { MeContextProvider } from 'contexts/me';

function App() {
  return (
    <MeContextProvider>
      <SessionContextProvider containerId='cameraContainer'>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Main/>}></Route>
          </Routes>
        </BrowserRouter>
      </SessionContextProvider>
    </MeContextProvider>
  );
}

export default App;

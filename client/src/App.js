import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChatPage from './pages/ChatPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes> 
        <Route path='/' element={<LandingPage />}></Route>
        <Route path='/chat/:chatId' element={<ChatPage />}></Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;
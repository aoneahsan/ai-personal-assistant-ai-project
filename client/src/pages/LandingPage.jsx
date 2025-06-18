import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {

  const [email, setEmail] = useState(null);
  const [chatId, setChatId] = useState(null);

  const navigate = useNavigate();
  
  const joinChat = () => {
    if(email && chatId) {
      // Relocate to Chat page
      navigate(`/chat/${chatId}?email=${email}`);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '20px', maxWidth: '600px', margin: '0 auto' , gap: '10px'}}>
      <label htmlFor="email">Enter your email</label>
      <input placeholder="Example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="chatId">Enter a ChatID(It can be anything)</label>
      <input placeholder="Chat Room ID" value={chatId} onChange={(e) => setChatId(e.target.value)} />
      <button onClick={joinChat}>Join Chat</button>
    </div>
  );
};

export default LandingPage;
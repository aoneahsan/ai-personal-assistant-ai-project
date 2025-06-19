import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom'

const ChatPage = () => {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [AIMessages, setAIMessages] = useState([]);
  const [AIInput, setAIInput] = useState('');

  const api = 'http://localhost:3001/api'

  const fetchMessages = async () => {
    const response = await fetch(`${api}/chat/${chatId}`);
    const messages = await response.json();
    console.log("MESSAGES:", messages)
    setMessages(messages);
  }

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setInput('');

    try {
      await fetch(`${api}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatId, email, message: input})
      })

      // Fetch after sending
      await fetchMessages();
     } catch (error) {
        console.error('Error sending message:', error);
        setInput(input)
      }
    finally {
      setLoading(false);
    }
  };

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendAIMessage = async (e) => {
    e.preventDefault();
    await fetchMessages();

    if(!AIInput.trim() || loading) return;

    setLoading(true);
    const question = AIInput;
    setAIInput('');
    setAIMessages(prev => [...prev, {role:'You', message: question}])

    try {
      const response = await fetch(`${api}/chat/AI`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({chatId, email, question})
      })

      const data = await response.json()
      
      setAIMessages(prev => [...prev, { role:'AI', message: data.response }]);
      
    } catch (error) {
      console.error("Error with AI response:", error)
    } finally {
      setLoading(false);
    }

  }

  return (
    <>
      <div style={{ display: 'flex', padding: '20px', width: '1000px', margin: '0 auto', gap: '20px' }}>
        <h1 style={{ position: 'absolute', top: '10px', left: '20px' }}>ChatID: {chatId}</h1>
        
        {/* User Chat */}
        <div style={{ flex: 1 }}>
          <h3>User Chat</h3>
          <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <strong>{msg.email}:</strong> {msg.message}
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          
          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ width: '80%', padding: '10px' }}
              disabled={loading}
              />
            <button type="submit" disabled={loading || !input.trim()} style={{ padding: '10px' }}>
              Send
            </button>
          </form>
        </div>
      
        {/* AI Chat */}
        <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
          <h3>AI Assistant</h3>
          <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            {AIMessages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <strong>{msg.role}:</strong> {msg.message}
              </div>
            ))}
          </div>

          <form onSubmit={sendAIMessage}>
            <input
              type="text"
              value={AIInput}
              onChange={(e) => setAIInput(e.target.value)}
              placeholder="Type your message..."
              style={{ width: '80%', padding: '10px' }}
              disabled={loading}
              />
            <button type="submit" disabled={loading || !AIInput.trim()} style={{ padding: '10px' }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
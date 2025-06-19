import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom'

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const { chatId } = useParams();
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email');

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

  const summarize = async () => {
    if(messages.length <= 2 ) {
      window.alert("Must have more than 2 messages to summarize");
    }

    await fetchMessages();

    try {
      const response = await fetch(`${api}/chat/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({chatId})
      })

      const data = await response.json()
      console.log("SUMMARY", data.summary)
      
    } catch (error) {
      console.error("Error summarizing conversation:", error)
    }

  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>ChatID: {chatId}</h1>

      <button onClick={summarize}>Summarize Conversation</button>
      
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
  );
};

export default ChatPage;
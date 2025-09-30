"use client";
import { useState } from 'react';

export default function ChatComponent() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const ask = async () => {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Ask the PDF</h1>
      <input
        type="text"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask a question..."
        style={{ width: '100%', padding: '0.5rem' }}
      />
      <button onClick={ask} style={{ marginTop: '1rem' }}>Submit</button>
      <p style={{ marginTop: '2rem' }}><strong>Answer:</strong> {answer}</p>
    </main>
  );
}

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Editor from '../Editor';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState('');

  async function createNewPost(ev) {
    ev.preventDefault();
    setError('');

    if (!files?.[0]) {
      setError('Please select an image');
      return;
    }

    const data = new FormData();
    data.set('title', title);
    data.set('summary', summary);
    data.set('content', content);
    data.set('file', files[0]);

    try {
      const response = await fetch('http://localhost:4000/post', {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      const responseData = await response.json();

      if (response.ok) {
        setRedirect(true);
      } else {
        setError(responseData.error || 'Error creating post');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error creating post');
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }

  return (
    <form className="create-post" onSubmit={createNewPost}>
      <h1>Create Post</h1>
      {error && <div className="error">{error}</div>}
      <input 
        type="title" 
        placeholder={'Title'} 
        value={title} 
        onChange={ev => setTitle(ev.target.value)} 
        required
      />
      <input 
        type="summary" 
        placeholder={'Summary'} 
        value={summary} 
        onChange={ev => setSummary(ev.target.value)} 
        required
      />
      <input 
        type="file" 
        onChange={ev => setFiles(ev.target.files)} 
        required
      />
      <Editor value={content} onChange={setContent} />
      <button style={{marginTop:'5px'}}>Create post</button>
    </form>
  );
}

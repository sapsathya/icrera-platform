import React, { useEffect, useState } from 'react'
import axios from 'axios'

function authHeaders(){
  const token = localStorage.getItem('token')
  return token? { Authorization: 'Bearer '+token } : {}
}

export default function Dashboard(){
  const [me, setMe] = useState(null)
  const [files, setFiles] = useState([])
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [fileInput, setFileInput] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(()=>{
    async function load(){
      try{
        const res = await axios.get('/api/auth/me', { headers: authHeaders() })
        setMe(res.data)
        const myfiles = await axios.get('/api/uploads/mine', { headers: authHeaders() })
        setFiles(myfiles.data)
      }catch(e){
        console.log('not logged in')
      }
    }
    load()
  }, [])

  async function upload(e){
    e.preventDefault()
    if (!fileInput) return setMsg('Select file')
    try{
      // request presign
      const resp = await axios.post('/api/uploads/presign', { filename: fileInput.name, mimeType: fileInput.type }, { headers: authHeaders() })
      const { signedUrl, storageKey } = resp.data
      // upload to S3
      await axios.put(signedUrl, fileInput, { headers: { 'Content-Type': fileInput.type } })
      // register metadata
      const create = await axios.post('/api/uploads/files', { title, description: desc, tags: [], filename: fileInput.name, storageKey, mimeType: fileInput.type, size: fileInput.size }, { headers: authHeaders() })
      setFiles(prev=>[create.data.file, ...prev])
      setMsg('Uploaded')
    }catch(err){
      setMsg(err.response?.data?.error || 'Upload error')
    }
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {me ? <div>Welcome, {me.name || me.email} ({me.role})</div> : <div>Please login.</div>}
      <hr/>
      <h3>Upload</h3>
      <form onSubmit={upload}>
        <div><label>Title</label><br/><input value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><label>Description</label><br/><textarea value={desc} onChange={e=>setDesc(e.target.value)} /></div>
        <div><label>File</label><br/><input type="file" onChange={e=>setFileInput(e.target.files[0])} /></div>
        <button type="submit">Upload</button>
      </form>
      <div style={{marginTop:10}}>{msg}</div>
      <hr/>
      <h3>My Files</h3>
      <ul>
        {files.map(f=>(
          <li key={f.id}><strong>{f.title}</strong> — {f.filename} — {f.status}</li>
        ))}
      </ul>
    </div>
  )
}
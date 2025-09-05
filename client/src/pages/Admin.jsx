import React, { useEffect, useState } from 'react'
import axios from 'axios'

function authHeaders(){
  const token = localStorage.getItem('token')
  return token? { Authorization: 'Bearer '+token } : {}
}

export default function Admin(){
  const [queue, setQueue] = useState([])
  const [users, setUsers] = useState([])
  const [analytics, setAnalytics] = useState({})

  useEffect(()=>{
    async function load(){
      try{
        const q = await axios.get('/api/admin/review_queue', { headers: authHeaders() })
        setQueue(q.data)
        const u = await axios.get('/api/admin/users', { headers: authHeaders() })
        setUsers(u.data)
        const a = await axios.get('/api/admin/analytics', { headers: authHeaders() })
        setAnalytics(a.data)
      }catch(e){
        console.log('admin load error', e)
      }
    }
    load()
  }, [])

  async function approve(id){
    await axios.post(`/api/admin/files/${id}/approve`, {}, { headers: authHeaders() })
    setQueue(queue.filter(x=>x.id!==id))
  }
  async function reject(id){
    const reason = prompt('Reason for rejection:')
    if (!reason) return
    await axios.post(`/api/admin/files/${id}/reject`, { reason }, { headers: authHeaders() })
    setQueue(queue.filter(x=>x.id!==id))
  }

  return (
    <div>
      <h2>Admin Panel</h2>
      <h3>Analytics</h3>
      <div>Total users: {analytics.total_users} | Total files: {analytics.total_files} | Pending: {analytics.files_pending}</div>
      <hr/>
      <h3>Review Queue</h3>
      <ul>
        {queue.map(f=>(
          <li key={f.id}><strong>{f.title}</strong> — {f.filename} — <button onClick={()=>approve(f.id)}>Approve</button> <button onClick={()=>reject(f.id)}>Reject</button></li>
        ))}
      </ul>
      <hr/>
      <h3>Users</h3>
      <ul>
        {users.map(u=> <li key={u.id}>{u.email} ({u.name}) - {u.role}</li>)}
      </ul>
    </div>
  )
}
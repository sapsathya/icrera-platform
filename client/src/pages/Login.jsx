import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      const res = await axios.post('/api/auth/login', { email, password })
      const token = res.data.token
      localStorage.setItem('token', token)
      setMsg('Logged in')
      setTimeout(()=>nav('/dashboard'), 400)
    }catch(err){
      setMsg(err.response?.data?.error || 'Error')
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><label>Email</label><br/><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><label>Password</label><br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button type="submit">Login</button>
      </form>
      <div style={{marginTop:10}}>{msg}</div>
    </div>
  )
}
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    try{
      await axios.post('/api/auth/register', { name, email, password })
      setMsg('Registered. Please login.')
      setTimeout(()=>nav('/login'), 800)
    }catch(err){
      setMsg(err.response?.data?.error || 'Error')
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div><label>Name</label><br/><input value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><label>Email</label><br/><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><label>Password</label><br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button type="submit">Register</button>
      </form>
      <div style={{marginTop:10}}>{msg}</div>
    </div>
  )
}
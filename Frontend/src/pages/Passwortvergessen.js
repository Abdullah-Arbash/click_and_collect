import React, { useState } from 'react';
import {FormControl, TextField } from '@mui/material'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import fetchapi from '../module/fetchapi';
import { Navigate, useNavigate } from 'react-router-dom';




function Passwortvergessen() {

        const [email, setemail] = useState('') 
        const [fehelr, setfehelr] = useState('')
        const [ok, setok] = useState('')

        const navigate = useNavigate();
        
        function emialsenden(){
            fetchapi('POST',{'email':email}, '/passwort-vergessen').then((res)=>{
                console.log(res)
                if(res.status){
                  if(res.data.status){
                    setok(res.data.msg)
                  }else{
                    setfehelr(res.data.msg)
                  }
                }else{
                    setfehelr('einfeher ist aufgetreten')
                }
              })
        }

        function xx(event){
            setemail(event.target.value)
            setfehelr('')
            setok('')
        }

        function zurueckclick(){
          navigate("/Start")
        }

    return ( 
    <div>
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', height:'100vh'}}>
             {ok!== '' && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}>{ok}</Alert>}
             {fehelr!=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}> {fehelr} </Alert>}
            <FormControl className="my-2" style={{ maxWidth: '500px', backgroundColor:'wheat'}} fullWidth required>
               <TextField label="Email" variant="outlined" name='email' value={email} onChange={(event)=>{xx(event)}} autoComplete="email" required />
            </FormControl>
            <Button variant="success" name='anmelden' onClick={()=>{emialsenden()}}>Senden</Button>
            <Button variant='primary' onClick={zurueckclick}>zurück</Button>
        </div>
    </div>
     );
}

export default Passwortvergessen;
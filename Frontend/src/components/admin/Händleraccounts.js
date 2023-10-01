import React, { useEffect, useState } from 'react';
import { Table,Dropdown,Button } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import { Modal } from '@material-ui/core';
import Spinner from '../Spiner';
import fetchapi from '../../module/fetchapi';
import Alert from 'react-bootstrap/Alert';




function Händleraccounts() {
    const [data, setData] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [popap, setpopap] = useState('');
    const [nstatus, setnstatus] = useState('')
    const [nkaka, setnkaka] = useState('')
    const [popapsection, setpopapsection] = useState({})
    const [spiner, setspiner] = useState(false)
    const [fehler,setfehler] = useState('')
    const [okb, setokb] = useState('')
    const [datatype, setdatatype] = useState('alle')




    function status(x){
        setpopapsection('status')
        setpopap(x)
        setModalOpen(!modalOpen)
    }

    function katalog(x){
        setpopapsection('katalog')
        setpopap(x)
        setModalOpen(!modalOpen)
    }

    useEffect(()=>{
        if(modalOpen){
            setnstatus('');
            setnkaka('');
            setfehler('')
            setokb('')
        }
    },[modalOpen])


    function start(x, callback) {
        let input = {
            first: 'haendler',
            second: 'haendlerEinsehen',
            nurAusstehend: x
        }
        setspiner(true)
        fetchapi('POST', input, '/admin-functions').then((res) => {
            if (res.status) {
                if (res.data.status) {
                    setData(res.data.data)
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                } else {
                    setfehler(res.data.msg)
                }
            } else {
                setfehler('Ein Fehler ist aufgetreten!')
            }
            setspiner(false)
        })
    }


        useEffect(()=>{
          start(false)  
        },[])

        const nuraus = (x) => {
            setfehler('');
            setokb('');
            if (x === 'aus') {
                start(true, () => setdatatype('aus'));
            } else {
                start(false, () => setdatatype('alle'));
            }
        }
        

        function sendneuestatus(){
                let input={
                    first: 'haendler',
                    second: 'haendlerStatusFestlegen',
                    Status : nkaka,
                    MitarbeiterID: popap.MitarbeiterID
                }
                setspiner(true)
                fetchapi('POST', input, '/admin-functions').then((res)=>{
                if(res.status){
                    if(res.data.status){
                        console.log(res)
                        setokb(res.data.msg)
                        if(datatype === 'alle'){
                            start(false)
                        }
                        else{
                            start(true)
                        }
                    }else{
                    setfehler(res.data.msg)
                    }
                }else{
                    setfehler('Ein Fehler ist aufgetreten!')
                }
                setspiner(false)
                })
                setModalOpen(false)
        }

    return ( 
        <div>
            {spiner && <Spinner />}
            {okb && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}>{okb}</Alert>}
            {fehler !=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}>{fehler}</Alert>}
            <div style={{display:'flex',justifyContent:'end', alignItems:'center'}}>
            {datatype === 'alle' ? <Button variant="primary" onClick={()=>{nuraus('aus')}}>Nur ausstehende Anzeigen</Button> : <Button variant="primary" onClick={()=>{nuraus('alle')}}>Alle Anzeigen</Button> }
            </div>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Vorname</th>
                        <th>Shopname</th>
                        <th>Kategorie</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.MitarbeiterID}</td>
                            <td>{item.Name}</td>
                            <td>{item.Vorname}</td>
                            <td>{item.ShopName}</td>
                            <td>{item.Kategorie}   {/*<FaEdit style={{cursor:'pointer'}} onClick={() => katalog(item)}/>*/}</td>
                            <td>{item.Status}   <FaEdit style={{cursor:'pointer'}} onClick={() => status(item)}/></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}style={{display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                <div style={{ backgroundColor: 'white', padding: '20px', width: '30%', borderRadius:'5px' }}>
                   <h3 style={{color:'red'}}>{popap.name} {popap.Vorname}</h3>
                   {popapsection === 'status' && <> 
                   <p style={{margin:'0'}}>Der aktulle Status: {popap.Status}</p>
                   <span>Der neue Status: {nkaka}</span>
                   <div style={{display:'flex', alignItems: 'center',justifyContent: 'space-between'}}><Dropdown onSelect={(event)=>{setnkaka(event)}}>
                            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                                Status
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey='Ausstehend'>Ausstehend</Dropdown.Item>
                                <Dropdown.Item eventKey='Freigegeben'>Freigegeben</Dropdown.Item>
                                <Dropdown.Item eventKey='Gesperrt' >Gesperrt</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Button variant="primary" onClick={()=>{sendneuestatus()}}>Speichern</Button>
                        </div>
                   </>}

                   {popapsection === 'katalog' && <> 
                   <p style={{margin:'0'}}>Der aktulle Status: {popap.Kategorie}</p>
                   <p>Der neue Status: {nstatus}</p>
                   <div style={{display:'flex', alignItems: 'center',justifyContent: 'space-between'}}>
                   <Dropdown onSelect={(event)=>{setnstatus(event)}}>
                            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                            Kategorie
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey='Kunde'>K1</Dropdown.Item>
                                <Dropdown.Item eventKey='K2'>K2</Dropdown.Item>
                                <Dropdown.Item eventKey='K3'>K3</Dropdown.Item>
                                <Dropdown.Item eventKey='K4'>K4</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Button variant="primary" onClick={()=>{setModalOpen(false)}}>Speichern</Button>
                        </div>
                   </>}
                </div>
            </Modal>
        </div>
    );
}

export default Händleraccounts;
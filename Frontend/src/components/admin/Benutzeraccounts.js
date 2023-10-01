import React, { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { Modal, Button, Table, Dropdown } from 'react-bootstrap';
import fetchapi from '../../module/fetchapi';
import Alert from 'react-bootstrap/Alert';
import Spinner from '../Spiner';


function Benutzeraccounts() {
    const [data, setData] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [selectedData, setSelectedData] = useState({});

    const handleClose = () => setShowModal(false);
    
   /*const handleShow = (item) => {
        setSelectedData(item);
        setShowModal(true);
    }*/

    const [spiner, setspiner] = useState(false)
    const [fehler,setfehler] = useState('')
    const [okb, setokb] = useState('')


    useEffect(()=>{
        let input={
            first: 'benutzer',
            second: 'benutzerEinsehen',
        }
        setspiner(true)
        fetchapi('POST', input, '/admin-functions').then((res)=>{
          if(res.status){
            if(res.data.status){
              setData(res.data.data)
            }else{
              setfehler(res.data.msg)
            }
        }else{
            setfehler('Ein Fehler ist aufgetreten!')
        }
        setspiner(false)
        })
    },[])

    return (
        <div>
            {spiner && <Spinner />}
            {okb && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}>{okb}</Alert>}
            {fehler !=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}>{fehler}</Alert>}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Vorname</th>
                        <th>Email</th>
                        <th>Rolle</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.Name}</td>
                            <td>{item.Vorname}</td>
                            <td>{item.EmailAdresse}</td>
                            <td>
                               {item.Rolle === 'Kunde' && 'Kunde'}
                               {item.Rolle === 'Mitarbeiter' && item.istHaendler === 1 && 'Händler'}
                               {item.Rolle === 'Mitarbeiter' && item.istHaendler === 0 && 'Mitarbeiter'}
                               {/*<FaEdit style={{cursor:'pointer'}} onClick={() => handleShow(item)} />*/}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal show={showModal} onHide={handleClose} className='modal-dialog-centered'>
                    <Modal.Header closeButton>
                        <Modal.Title>Rolle ändern für {selectedData.name}, {selectedData.vorname}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Email: {selectedData.email}</p>
                        <p> Aktulle Rolle: {selectedData.rolle}</p>
                        <Dropdown>
                            <Dropdown.Toggle variant="primary" id="dropdown-basic">
                                Rollen
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item>Kunde</Dropdown.Item>
                                <Dropdown.Item>Händler</Dropdown.Item>
                                <Dropdown.Item>Admin</Dropdown.Item>
                                <Dropdown.Item>Mitarbeiter</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleClose}>Schließen</Button>
                        <Button variant="primary" onClick={handleClose}>Speichern</Button>
                    </Modal.Footer>
                </Modal>
            </div>
    );
}

export default Benutzeraccounts;
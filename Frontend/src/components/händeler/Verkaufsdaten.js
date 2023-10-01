import React, { useEffect, useState } from 'react';
import { Dropdown, Table, Button } from 'react-bootstrap';
import { BsDownload } from 'react-icons/bs';
import jsPDF from 'jspdf';
import fetchapi from '../../module/fetchapi';
import Alert from 'react-bootstrap/Alert'
import Spiner from '../Spiner'
import 'jspdf-autotable';


function Verkaufsdaten() {
    const [selectedPeriod, setSelectedPeriod] = useState('Jan-Mär');
    const [data, setData] = useState([]);

    const [fehler, setfeher] = useState('')
    const [spiner, setspiner] = useState(false)


    function Download() {
        const pdf = new jsPDF();
    
        // Tabelle hinzufügen
        pdf.autoTable({
            head: [['Monat', 'Umsatz']],
            body: data.map(item => [item.month, item.revenue]),
        });
    
        pdf.save(`Umsatz für ${selectedPeriod}`);
    }

    useEffect(()=>{
        let input={
            first:'verkaufsdaten',
            second:'umsatzImQuartal',
            quartal:selectedPeriod,
        }
        setspiner(true)
        fetchapi('POST',input, '/haendler-functions').then((res)=>{
            if(res.status){
                if(res.data.status){
                   setData(res.data.data) 
                }else{
                  setfeher(res.data.msg)
                }
              }else{
                setfeher('Ein Fehler ist aufgetreten');
              }
              setspiner(false)
          })
    },[selectedPeriod])

    return (
        <div>
            {spiner && <Spiner />}
            {fehler !== '' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehler}</Alert>}
            <Dropdown>
                <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    {selectedPeriod}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => setSelectedPeriod("Jan-Mär")}>Jan-Mär</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedPeriod("Apr-Jun")}>Apr-Jun</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedPeriod("Jul-Sep")}>Jul-Sep</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedPeriod("Okt-Dez")}>Okt-Dez</Dropdown.Item>
                    <Dropdown.Item onClick={() => setSelectedPeriod("Alle")}>Alle</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Monat</th>
                        <th>Umsatz</th>
                    </tr>
                </thead>
                <tbody>
                    {data.filter(d => {
                        if (selectedPeriod === 'Alle') {
                            return true;
                        } else if (selectedPeriod === 'Jan-Mär') {
                            return d.month === 'Januar' || d.month === 'Februar' || d.month === 'März';
                        } else if (selectedPeriod === 'Apr-Jun') {
                            return d.month === 'April' || d.month === 'Mai' || d.month === 'Juni';
                        } else if (selectedPeriod === 'Jul-Sep') {
                            return d.month === 'Juli' || d.month === 'August' || d.month === 'September';
                        } else if (selectedPeriod === 'Okt-Dez') {
                            return d.month === 'Oktober' || d.month === 'November' || d.month === 'Dezember';
                        }
                        return false;
                    }).map(d => (
                        <tr key={d.month}>
                            <td>{d.month}</td>
                            <td>{d.revenue}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button variant="success" onClick={Download}>Exportieren <BsDownload></BsDownload></Button>
        </div>
    )}

    export default Verkaufsdaten;
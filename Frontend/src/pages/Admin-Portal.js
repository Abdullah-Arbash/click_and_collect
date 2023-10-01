import React, {useEffect, useState} from 'react';
import {rolleContact, sectionContact} from '../Contect';
import { useContext } from 'react';
import NavM from '../components/NavM';
import ExtentionNav from '../components/ExtentionNav';
import Section from '../components/Section';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import fetchapi from '../module/fetchapi';
import { FormControl} from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import Händleraccounts from '../components/admin/Händleraccounts';
import Benutzeraccounts from '../components/admin/Benutzeraccounts';
import Reporting from '../components/admin/Reporting';
import { BsFillArrowRightCircleFill, BsFillArrowLeftCircleFill } from "react-icons/bs";
import {MdClose} from "react-icons/md";
import { Modal } from '@material-ui/core';
import Spinner from '../components/Spiner';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';



function AdminPrtal() {
    const {rolle} = useContext(rolleContact);
    const {section, setsection} = useContext(sectionContact)
    const [profildaten, setprofildaten] = useState({id:rolle.id,name:'',vorname:'',email:'',passwort:'',neuepasswort:''})
    const [profildrop, setprofildrop] = useState(false)
    const [bearbeitetbuttom, setbearbeitetbuttom] = useState(false)

    const [fehler,setfehler] = useState('')
    const [perfect,setperfect] = useState(false)
    const [worning, setworning] = useState(false)
    const [spiner, setspiner] = useState(false)
    const [okb, setokb] = useState('')
    const [success, setsuccess] = useState('');
    const [fail, setfail] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
        const [catalogs,setcatalogs] = useState([]);
        const catalogsPerPage = 3;

    const startIndex = (currentPage - 1) * catalogsPerPage;
    const endIndex = startIndex + catalogsPerPage;
    const catalogsToShow = catalogs.slice(startIndex, endIndex);   
        
    const [modalOpen, setModalOpen] = useState(false)

    const [neuekat, setneuekat] = useState('')

    const navigate = useNavigate()

    useEffect(()=>{
      if(bearbeitetbuttom){
          setworning(true)
      }
      if(profildrop){
          setspiner(true)
          fetchapi('POST',{}, '/view-profile').then((res)=>{
              if(res.status){
                  if(res.data.status){
                    setspiner(false)
                    setfehler('')
                    setprofildaten(res.data.details)
                  }else{
                    setspiner(false)
                    setfehler(res.data.msg)
                  }
                }else{
                  setspiner(false)
                  setfehler('Ein fehler ist aufgetreten!')
                }
          })
          
      }
},[bearbeitetbuttom, profildrop])

    function profilclick(){setprofildrop((prev)=>{ return !prev}) 
    setsection('')
    }

    function click(){setprofildrop(false)}

    function abschickenbuttom(){
        setworning(false)
             setspiner(true)
            fetchapi('POST',profildaten,'/change-profile' ).then((res)=>{
                 if(res.status){
                    if(res.data.status){
                        console.log(res.data)
                        setspiner(false)
                        setsuccess(res.data.msg)
                    }else {
                        setspiner(false)
                        setfail(res.data.msg)
                    }
                 }else{
                    setspiner(false)
                    setfehler('Einfehler ist aufgetreten')
                 }   
            })
    }

    function bearbeitenclick(){
        setbearbeitetbuttom(prev=>!prev)
            setperfect(false)
            setworning(false)
            setfehler('')
    }

    function datachange(event){      
        setprofildaten((prev)=>{return {...prev,[event.target.name]:event.target.value}})
  }

        const handleNextClick = () => {
            setCurrentPage(currentPage + 1);
        };

        const handlePrevClick = () => {
            setCurrentPage(currentPage - 1);
        };

        function addkategorie(){
            setfehler('')
            setokb('')
            setneuekat('')
            setModalOpen((prev)=>{return !prev})
        }

        function sendkategorie(){
            let input={
                first: 'shopkategorie',
                second: 'shopkategorieErstellen',
                name: neuekat
              }

              setspiner(true)
              fetchapi('POST', input, '/admin-functions').then((res)=>{
                if(res.status){
                  if(res.data.status){
                    setokb(res.data.msg)
                    startk()
                  }else{
                    setfehler(res.data.msg)
                  }
              }else{
                  setfehler('Ein Fehler ist aufgetreten!')
              }
              setspiner(false)
              })
            setModalOpen((prev)=>{return !prev})
        }

        function katloschen(x){
            setfehler('')
            setokb('')
            let input = {
                first: 'shopkategorie',
                second: 'shopkategorieEntfernen',
                name: x

            }
            setspiner(true)
            fetchapi('POST', input, '/admin-functions').then((res)=>{
              if(res.status){
                if(res.data.status){
                  setokb(res.data.msg)
                  startk()
                }else{
                  setfehler(res.data.msg)
                }
            }else{
                setfehler('Ein Fehler ist aufgetreten!')
            }
            setspiner(false)
            })
        }
        
        const startk = ()=>{
            setspiner(true)
            fetchapi('POST', {}, '/shopcategories').then((res)=>{
                if(res.status){
                  if(res.data.status){
                    let array = []
                    for(let i=0;i<res.data.data.length; i++){
                        array.push(res.data.data[i].shopkategorieName)
                    }
                    setcatalogs(array)
                  }else{
                    setfehler(res.data.msg)
                  }
              }else{
                setfehler('einsehelr ist aufgetreten')
              }
              })
              setspiner(false)
        }

        useEffect(()=>{
            startk()
        },[])

        function logoutclick(){
            localStorage.clear();
            navigate("/start")
       }

       function logex(){
            fetchapi('POST', {first: 'log', second: 'logEinsehen'}, '/admin-functions').then((res)=>{
                if(res.status){
                  if(res.data.status){
                    console.log(res)
                    const pdf = new jsPDF();
                    pdf.autoTable({
                        head: [['LogID', 'Log_Zeit', 'User_Email', 'Schwere','Operation']],
                        body: res.data.data.map(item => [item.LogID, item.Log_Zeit, item.User_Email, item.Schwere, item.Operation]),
                    });
                    pdf.save(`Log-Daten`);

                  }else{
                    setfehler(res.data.msg)
                  }
              }else{
                setfehler('einsehelr ist aufgetreten')
              }
            })
       }

       function x(){
         setsection('')
       }

    return ( 
        <div className='admin'>
            <NavM geschäftname='' name='' rolle='Admin' profilclick={profilclick} logoutclick={logoutclick} x={x}/>
            <div className='container'>
             <ExtentionNav aufgaben={['Händler Accounts', 'Benutzer Accounts','Reporting']} click={click}/> 

             <div>
                {spiner && <Spinner />}
                {okb && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}>{okb}</Alert>}
                {fehler !=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}>{fehler}</Alert>}
                <div style={{marginTop:'3rem',display:'flex',justifyContent:'space-between', alignItems:'center', flexWrap: 'wrap'}}>
                 <h4 style={{color:'green'}}>Shopkategorien: <span style={{color:'black', fontSize:'18px'}}>Sie haben insgesamt {catalogs.length} Kategorien </span></h4>
                 <Button variant="primary" onClick={addkategorie}>Neue Kategorie hinzufügen</Button>
                </div>
                <div className="slider-container">
                        <div className="catalogs-container">
                            {catalogsToShow.map((catalog, index) => (
                            <div className="catalog-item" key={index} style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                                <p style={{fontSize:'18px', color:'blue', fontWeight:'bold'}}>{catalog}</p>
                                <div><MdClose  style={{fontSize:'22', cursor:'pointer'}} onClick={()=>{katloschen(catalog)}}/>
                                </div>
                            </div>
                            ))}
                        </div>
                        <div className="controls-container">
                            <button style={{border:'none'}} onClick={handlePrevClick} disabled={currentPage === 1}>
                            <BsFillArrowLeftCircleFill style={{fontSize:'35'}} />
                            </button>
                            <button style={{border:'none'}} onClick={handleNextClick} disabled={endIndex >= catalogs.length}>
                            <BsFillArrowRightCircleFill style={{fontSize:'35'}} />
                            </button>
                        </div>
                        <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                          <Button variant="info" onClick={()=>{logex()}}>Logdaten Expotieren</Button>
                        </div>
                </div>
             </div>

             <Modal open={modalOpen} onClose={() => setModalOpen(false)}style={{display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
                <div style={{ backgroundColor: 'white', padding: '20px', width: '30%', borderRadius:'5px' }}>
                    <h4>Neue Shopkategorie:</h4>
                    <InputGroup style={{marginBottom:'7px'}}><FormControl value={neuekat} onChange={(event)=>{setneuekat(event.target.value)}} name='neuekateg' placeholder='Name'/></InputGroup>
                    <Button variant="primary" onClick={sendkategorie}>hinzufügen</Button>
                </div>
             </Modal>

                              
             {profildrop && 
                <Section name='Profil:'>
                    {worning && <Alert key='warning' variant='warning' style={{textAlign:'center'}}>Ihre Daten werden erst gespeichert erst nach dem Sie auf Abschicken gedrückt haben</Alert>}
                    {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
                    {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>Ihre daten wurden erfolgreich gespeichert</Alert>}
                    <div className='buttoms'>
                    {!bearbeitetbuttom && <Button variant="secondary" onClick={bearbeitenclick} style={{marginBottom:'3rem'}}>Bearbeiten</Button>}
                    {bearbeitetbuttom && <div><Button variant="primary" onClick={bearbeitenclick}  style={{marginBottom:'3rem',marginRight:'10px'}}>zurück</Button><Button variant="primary" onClick={abschickenbuttom}  style={{marginBottom:'3rem'}}>Abschicken</Button></div>}
                    </div>  
                    <div className='profil'>
                     {!bearbeitetbuttom && <> <div className='links'>
                            <div>
                            <ul style={{ listStyle: 'none'}}>
                            </ul>
                            </div>
                            <div>
                            </div>
                        </div>
                        <div className='rechts'>
                        <p className='data'>Name: <span className='data-wert'>{profildaten.name}</span></p>
                        <p className='data'>Vorname: <span className='data-wert'>{profildaten.vorname}</span></p>
                        <p className='data'>Email: <span className='data-wert'>{profildaten.email}</span></p>
                        <p className='data'>Passwort: <span className='data-wert'>&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span></p>
                        </div> </>}

                        {bearbeitetbuttom && <><div className='links'>

                        </div>

                        
                        <div className='rechts'>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.name} onChange={datachange} name='name' placeholder='Name:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.vorname} onChange={datachange} name='vorname' placeholder='Vorname:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.email} onChange={datachange} name='email' placeholder='Email:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.passwort} type="password" onChange={datachange} name='passwort' placeholder='Neues Passwort:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.neuespasswort} type="password" onChange={datachange} name='neuespasswort' placeholder='Passwort wiederholen:'/></InputGroup>
                        {fail && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fail}</Alert>}
                        {success && <Alert key='success' variant='success' style={{textAlign:'center'}}>{success}</Alert>}
                        </div> </>}
                    </div>   
                </Section>
                }

                {section!== '' && <Section name={`${section}:`}>

                {section === 'Händler Accounts' &&
                <div className='händler-accounts'>
                    <Händleraccounts />      
                </div>              
                }

                {section === 'Benutzer Accounts' &&
                <div className='benutzer-accounts'>
                  <Benutzeraccounts />       
                </div>              
                }

                {section === 'Reporting' &&
                <div className='reporting'>
                   <Reporting />
                </div>              
                }

                            
                </Section>}

            </div>
        </div>

     );
}

export default AdminPrtal;
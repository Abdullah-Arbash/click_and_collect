import React, { useState, useEffect } from 'react';
import { Form, Button, Row } from 'react-bootstrap';
import fetchapi from '../../module/fetchapi';
import ProduktHM from '../ProduktHM';
import Alert from 'react-bootstrap/Alert';
import Spinner from '../Spiner'
import {FormControl, TextField } from '@mui/material'



function Produktkategorie() {
    const [catalogues, setCatalogues] = useState([]);
    const [xx, setxx] = useState(0)

    const [products, setProducts] = useState([]);
    const [produkthinzufügenbuttom, setprodukthinzufügenbuttom] = useState(false)
    const [addProduct, setAddProduct] = useState({P_Name: '',Stückzahl: '',Preis: '',Beschreibung: '',Umsatzsteuer: '',Material: '',Marke: '',Kategoriename:'', Bild:''});
  
  
    const [searchTerm, setSearchTerm] = useState('');
    const [spiner, setspiner] = useState(false);
  
    const [Kbearbeitungclick, setKbearbeitungclick] = useState(false)
    const [neueK, setneueK] = useState('')
    const [fehlerK, setfehlerK] = useState('')
    const [okK, setok] = useState('')
  
    const [fehlerKb, setfehlerKb] = useState('')
    const [okb, setokb] = useState('')

    const [fehleraa, setfehleraa] = useState('')
    const [okaa, setokaa] = useState('')

    const feher = (data) => {
      console.log(data)
      setfehleraa(data)
    };
  
    const ok = (data) => {
      console.log(data)
      setokaa(data)
    };

  

  
    const handleChangeadd_P = event => {
  
      const target = event.target;
      if(target.type === 'file'){
          const file = target.files[0];
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = function() {
              const base64Image = reader.result;
              setAddProduct({...addProduct, Bild:base64Image});
          };
      }else{
          const value = target.value;
          const name = target.name;
          setAddProduct({ ...addProduct, [name]: value });
      }
    }
  
    const handleSubmitaddProduct = event => {
      event.preventDefault();
      console.log(addProduct)
      let input={
        "first": "mitarbeiter",
        "second": "produktAnlegen",
        data:addProduct
      }
      fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
        console.log(res)
      })
    }
  
  
  
    function K_Anzeigen(){
      let input={
        "first": "mitarbeiter",
        "second": "produktkategorieneinsehen"  
      }
      setspiner(true)
      fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
        setCatalogues(res.data.data)
        setspiner(false)
      })
    }
  
    useEffect(()=>{
      K_Anzeigen()
    },[])
  
    function handleCatalogueEdit(catalogueId) {
      setxx(0)
      setfehelrpp('')
      setokpp('')
      console.log(catalogueId)
      let input={
        "first": "mitarbeiter",
        "second": "produkteeinsehen",
        p_KategorieID:catalogueId
      }
      fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
        setProducts(res.data.data)
        console.log(res)
        setspiner(false)
      })
  
    }
  
    function handleProductAdd() {
      setprodukthinzufügenbuttom((prev)=>{
        return !prev;
      })
    }

    const [fehelrpp, setfehelrpp] = useState('');
    const [okpp, setokpp] = useState('');
    const [gesuchteprudukte, setgesuchtprudukte] = useState([])
    const [gesuchteanzeigen, setgesuchteanzigen] = useState(false)
  
    function handleProductsuche(){
      setxx(1)
      setgesuchteanzigen(false)
      console.log(searchTerm)
      const input={
        "first": "mitarbeiter",
        "second": "produktsuche",
         'suchfeld': searchTerm
      }
      fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
        if(res.status){
          if(res.data.status){
            setgesuchtprudukte(res.data.data)
            if(res.data.data.length>= 1){
              setgesuchteanzigen(true)
              setokpp(res.data.msg)
            }
          }else{
            setfehelrpp(res.data.msg)
          }
        }else{
          setfehelrpp('Einfehelr ist aufgetreten !!')
        }
      })
    }
  
    function handleSearchChange(event) {
      setfehelrpp('')
      setokpp('')
      setSearchTerm(event.target.value);
    }
  
  
    function kbuttomclick(){
      setKbearbeitungclick((prev)=>{
        return !prev;
      })
    }
  
  
    function kataloglöschen(x){
      let input={
        first: 'sortiment',
        second: 'Produktkategorieloeschen',
        name: x
      }
      setspiner(true)
      fetchapi('POST',input, '/haendler-functions').then((res)=>{
        if(res.status){
          if(res.data.status){
            setspiner(false)
            setfehlerKb('')
            setokb(res.data.msg)
            // hier muss nochmal den ganzen katalogen aus DB gefetcht werden.
          }else{
            setspiner(false)
            setokb('')
            setfehlerKb(res.data.msg)
          }
        }else{
          setspiner(false)
          setfehlerKb('Einfehler ist aufgetreten!')
        }
        setneueK('')
        K_Anzeigen()
      })
    }
  
    return (
            <div className="container-fluid">
              {spiner && <Spinner />}
              <div className="row">
              <div className="col-md-4">
              {/* Left column */}
              {!Kbearbeitungclick && <div>
              <ul className='listkataloge'>
                {catalogues.map(catalogue => (
                  <li key={catalogue.P_KategorieID} onClick={() => handleCatalogueEdit(catalogue.P_KategorieID)}>{catalogue.P_Kategoriename}</li>
                ))}
              </ul> </div>}
              {Kbearbeitungclick && <div>
                <Button variant="primary" style={{marginBottom:'10px'}} onClick={kbuttomclick}>Zurück</Button>
                {okb && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px'}}>{okb}</Alert>}
                {fehlerKb && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehlerKb}</Alert>}
                <ul style={{ listStyle: 'none' }}>
                  {catalogues.map((catalogue) => (
                    <li key={catalogue.P_KategorieID} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontWeight:500}}>
                      {catalogue.P_Kategoriename}
                      <Button variant="danger" onClick={()=>{kataloglöschen(catalogue.P_Kategoriename)}}>Löschen</Button>
                    </li>
                  ))}
                </ul>
                </div>}
      
        </div>
          <div className="col-md-8">
            {/* Right column */}
            <div className="row">
              <div className="col-md-12" style={{display:'flex', flexDirection:'column'}}>
              {fehelrpp !== "" && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehelrpp}</Alert>}
              {okpp && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}>{okpp}</Alert>}
              {okaa !=='' && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px'}}>{okaa}</Alert>}
              {fehleraa !=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehleraa}</Alert>}
                  <FormControl className="my-2" fullWidth>
                     <TextField label="Produkt ...." type="text" variant="outlined" name='passwort' value={searchTerm} onChange={handleSearchChange} />
                  </FormControl>
                    <Button variant="primary" onClick={handleProductsuche}>Suchen</Button>
              </div>
              <div className="col-md-12" style={{ textAlign: 'center' }}>
                    <Button variant="success" onClick={handleProductAdd} style={{marginTop:'5px'}}>{!produkthinzufügenbuttom ? 'Prudukt hinzufügen' : 'zurück'}</Button>
              </div>
             </div>

             {xx === 1 && <><div className="row" style={{ marginTop: '30px', justifyContent: 'center' }}>
              {gesuchteanzeigen && <h4>Ihre Suche ergab folgendes: </h4>}
              {gesuchteanzeigen &&
                gesuchteprudukte.map((x) => {
                  return <ProduktHM key={x.ProduktID} id={x.ProduktID} name={x.P_Name} preis={x.Preis} b={x.Beschreibung} bild={x.Bild} menge={x.Stückzahl} fehler={feher} ok={ok}/>;
                })   
              }
              </div></>}

             {produkthinzufügenbuttom ?  <div className='row' style={{ marginTop: '30px' }}>
             <Form onSubmit={handleSubmitaddProduct}>
             <Row style={{marginTop:'10px'}}>
        <Form.Group className="col-6">
          <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="P_Name" value={addProduct.P_Name}onChange={handleChangeadd_P}
          />
        </Form.Group>
        <Form.Group className="col-6">
          <Form.Label>Menge</Form.Label>
          <Form.Control type="number" name="Stückzahl" value={addProduct.Stückzahl} onChange={handleChangeadd_P}
          />
        </Form.Group>
        </Row>
        <Row style={{marginTop:'15px'}}>
        <Form.Group className="col-6">
          <Form.Label>Preis</Form.Label>
          <Form.Control type="number" name="Preis" value={addProduct.Preis} onChange={handleChangeadd_P}
          />
        </Form.Group>
        <Form.Group className="col-6">
          <Form.Label>Steuer</Form.Label>
          <Form.Control type="number" name="Umsatzsteuer" value={addProduct.Umsatzsteuer} onChange={handleChangeadd_P}
          />
        </Form.Group>
        </Row>
        <Form.Group style={{marginTop:'15px'}}>
          <Form.Label>Beschreibung</Form.Label>
          <Form.Control type="text" name="Beschreibung" value={addProduct.Beschreibung} onChange={handleChangeadd_P}
          />
        </Form.Group>
        <Row style={{marginTop:'15px'}}>
        <Form.Group className="col-6">
          <Form.Label>Material</Form.Label>
          <Form.Control type="text" name="Material" value={addProduct.Material} onChange={handleChangeadd_P}
          />
        </Form.Group>
        <Form.Group className="col-6">
          <Form.Label>Marke</Form.Label>
          <Form.Control type="text" name="Marke" value={addProduct.Marke} onChange={handleChangeadd_P}
          />
        </Form.Group>
        </Row>
        <Row style={{marginTop:'15px'}}>
        <Form.Group className="col-6">
          <Form.Label>Kategoriename</Form.Label>
          <Form.Control type="text" name="Kategoriename" value={addProduct.Kategoriename} onChange={handleChangeadd_P}
          />
        </Form.Group>
        <Form.Group className="col-6">
          <Form.Label>Produktbild</Form.Label>
          <Form.Control type="file" name="P_Bild" onChange={handleChangeadd_P}
          />
        </Form.Group>
        </Row>
        <Button variant="primary" type="submit">
          Speichern
        </Button>
      </Form>
            </div> : xx ===0 && <div className="row" style={{ marginTop: '30px', justifyContent: 'center' }}>
                {products.map((x) => {
                  return <ProduktHM key={x.ProduktID} id={x.ProduktID} name={x.P_Name} preis={x.Preis} b={x.Beschreibung} menge={x.Stückzahl} bild={x.Bild} fehler={feher} ok={ok}/>;
                })}
              </div>}
          </div>
        </div>
      </div>
    )
  }


export default Produktkategorie;
import React, { useState, useEffect } from 'react';
import { Form, Button, Row } from 'react-bootstrap';
import fetchapi from '../../module/fetchapi';
import ProduktHM from '../ProduktHM';
import Alert from 'react-bootstrap/Alert';
import Spinner from '../Spiner'

function SortimentK() {
 /* "const [catalogues, setCatalogues] = useState([]);

  const [products, setProducts] = useState([]);
  
  const [spiner, setspiner] = useState(false);

  const [Kbearbeitungclick, setKbearbeitungclick] = useState(false)
  const [neueK, setneueK] = useState('')
  const [fehlerK, setfehlerK] = useState('')
  const [okK, setok] = useState('')

  const [fehlerKb, setfehlerKb] = useState('')
  const [okb, setokb] = useState('')


  



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
    console.log(catalogueId)
    let input={
      "first": "mitarbeiter",
      "second": "produkteeinsehen",
      catalogueId:catalogueId
    }
    fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
      setProducts(res.data.data)
      setspiner(false)
    })

  }

 */

  return (
        <p>Produkte</p>
  )
}

export default SortimentK
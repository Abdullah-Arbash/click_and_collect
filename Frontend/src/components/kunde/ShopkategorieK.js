import React from 'react';
import { Card } from 'react-bootstrap';

function ShopkategorieK(props){

    const style = {
        maxWidth: '200px',
        margin: '5px 5px 5px 5px',
        cursor: 'pointer' // top, right, bottom, left
      };

    return(
        <Card style={style}>
              <Card.Body>
                 <Card.Text>{props.name}</Card.Text>
              </Card.Body>
        </Card>
    )
}

export default ShopkategorieK;
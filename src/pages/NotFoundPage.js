import { makeStyles } from '@material-ui/core';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const useStyles = makeStyles({
    root: {
      maxWidth: '1024px',
      margin: 'auto'
    },
    img: {
      maxHeight: '700px',
    },
  });
  
const NotFoundPage = () => {
    const classes = useStyles();
    const location = useLocation();
    const message = location.state?.message;
    const notFoundImage = `${process.env.PUBLIC_URL}/404.jpg`
    return (
        <div className={classes.root} >
            <Link to="/">
            <img src={notFoundImage} className={classes.img} alt='Not found'/>
                <a href="http://www.freepik.com">Designed by pikisuperstar / Freepik</a>

                <p>{message}</p>
            </Link>
            
        </div>
    )
}

export default NotFoundPage;
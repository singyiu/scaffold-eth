import React from 'react';
import { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
//import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import 'semantic-ui-css/semantic.min.css';
import { Grid, Container, Header, Button, Icon, Popup, Modal, Image, Form } from 'semantic-ui-react';
//import Chance from 'chance';
//import Moment from 'react-moment';
//const chance = new Chance()

const useStyles = makeStyles({
    root: {
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      border: 0,
      borderRadius: 3,
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      color: 'white',
      height: 48,
      padding: '0 30px',
    },
    avatar: {
        margin: 0,
      },
    bigAvatar: {
        margin: 0,
        width: 134,
        height: 134,
    },
});

const ContentCell = (props) => {
    const classes = useStyles();
    return (
        <div>
            <h1>Hello ContentCell</h1>
            <Avatar alt="Avatar" src={props.imageUrl} className={classes.bigAvatar} onClick={props.playFunc}/>
        </div>
    );
};

const AddButton = (props) => {
    const classes = useStyles();
    return (
        <div>
            <Popup content='Add new membership program' trigger={
            <Button circular color='green' icon='add' size='massive' onClick={props.playFunc}/>
            } />
        </div>
    );
};

const AddMPButton = (props) => {
    const [open, setOpen] = useState(false)
    const [daiApproved, setDaiApproved] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [linkUrl, setLinkUrl] = useState('')
    const [stakePrice, setStakePrice] = useState('')

    const funcApproveDai = (amountStr) => {
        setDaiApproved(true)
    };

    const funcOnOpen = () => {
        setOpen(true)
        setDaiApproved(false)
    };

    return (
        <Modal
        onClose={() => setOpen(false)}
        onOpen={() => funcOnOpen()}
        open={open}
        trigger={
            <Button circular color='green' icon='add' size='massive'/>
        }
      >
        <Modal.Header>Add a new membership program</Modal.Header>
        <Modal.Content image>
          <Image size='small' src='addButton.png' wrapped />
          <Modal.Description>            
            <Form>
              <Form.Field>
                <label>Title</label>
                <input placeholder='Title' onChange={e => setTitle(e.target.value)} />
              </Form.Field>
              <Form.Field>
                <label>Description</label>
                <input placeholder='Description' onChange={e => setDescription(e.target.value)} />
              </Form.Field>
              <Form.Field>
                <label>Image URL</label>
                <input placeholder='Image URL' onChange={e => setImageUrl(e.target.value)} />
              </Form.Field>
              <Form.Field>
                <label>Webpage URL</label>
                <input placeholder='Link to a detail webpage of the membership' onChange={e => setLinkUrl(e.target.value)} />
              </Form.Field>
              <Form.Field>
                <label>Stake Price</label>
                <input placeholder='Amount of DAI that user need to stake to join' onChange={e => setStakePrice(e.target.value)} />
              </Form.Field>
            </Form>  
            <div style={{width:600}}>
            <pre>{JSON.stringify({ title, description }, null, null)}</pre>
            </div>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={() => funcApproveDai(stakePrice)}>
            Approve {stakePrice} DAI
          </Button>
          <Button
            content="Create"
            labelPosition='right'
            icon='checkmark'
            onClick={() => setOpen(false)}
            positive
            disabled={!daiApproved}
          />
        </Modal.Actions>
      </Modal>
    );
};

export {
    ContentCell,
    AddMPButton,
};
import React from 'react';
import { useState, useEffect } from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
//import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import 'semantic-ui-css/semantic.min.css';
import { Grid, Container, Header, Button, Icon, Popup, Modal, Image, Form, Card, Label } from 'semantic-ui-react';
import { ethers } from "ethers";
import { abi as IErc20 } from '../views/abis/erc20.json'
import { parseUnits, formatUnits } from "@ethersproject/units";
import { notification } from "antd";
import { useExchangePrice, useGasPrice, useUserProvider, useContractLoader, useContractReader, useEventListener, useBalance, useExternalContractLoader } from "../hooks";

{/*
root: {
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: 3,
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
},
*/}

function openUrlInNewWindow(url) {
  const win = window.open(url, '_blank');
  if (win != null) {
    win.focus();
  }
}

const useStyles = makeStyles({
    avatar: {
        margin: 0,
      },
    bigAvatar: {
        margin: 0,
        width: 134,
        height: 134,
    },
    cardPadding: {
        padding: '30px 15px',
    },
    mpCard: {
        borderRadius: 30,
    }
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
    let createMStakePrice = "1"
    const [open, setOpen] = useState(false)
    const [daiApproved, setDaiApproved] = useState(false)
    const [approving, setApproving] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [linkUrl, setLinkUrl] = useState('')
    const [stakePrice, setStakePrice] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const funcOnOpen = () => {
        setOpen(true)
        setDaiApproved(false)
        setApproving(false)
        setStakePrice('')
        setIsCreating(false)
    };

    const approve = async (_amount) => {
      console.log("approving",_amount)
      try {
      setApproving(true)
      let tokenContract = new ethers.Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F", IErc20, props.signer);
      let amountToApprove = _amount==="0"?ethers.constants.MaxUint256:parseUnits(_amount,18)
      console.log("amountToApprove",amountToApprove)
      console.log("LmContract.address",props.writeContracts.LmContract.address)
      let approval = await tokenContract.approve(props.writeContracts.LmContract.address, amountToApprove)
      console.log('approval', approval)
      setApproving(false)
      setDaiApproved(true)
      notification.open({
        message: 'Token transfer approved',
        description:
        `Dropletpool can now move up to ${formatUnits(amountToApprove,18)} DAI`,
      }) } catch (e) {
        console.log(e)
        setApproving(false)
        setDaiApproved(false)
        notification.open({
          message: 'Approval failed',
          description:
          `DAI approval did not take place`,
        })
      }
    }
    
    const stakeAndCreateMembership = async (_amount) => {
        console.log("stakeAndCreateMembership")
        setIsCreating(true)
        try {
            let bigAmount = _amount==="0"?ethers.constants.MaxUint256:parseUnits(_amount,18)
            await props.tx( props.writeContracts.LmContract.stakeAndCreateMembership("0x6506Ddf82E3eC3712842AF424D0e7aE1d82227c7", title, description, imageUrl, linkUrl, bigAmount) )
            notification.open({
                message: 'stakeAndCreateMembership succeed',
                description: `Membership program ${title} created`,
            })
            setOpen(false)
        } catch (e) {
            notification.open({
                message: 'stakeAndCreateMembership failed',
                description: `stakeAndCreateMembership did not take place`,
            })
        }
        setIsCreating(false)
    }

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
                <input placeholder='Amount of DAI that user need to stake to join' disabled={daiApproved} onChange={e => setStakePrice(e.target.value)} />
              </Form.Field>
            </Form>  
            <div style={{width:600}}>
            {/* <pre>{JSON.stringify({ title, description }, null, null)}</pre> */}
            </div>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='orange' disabled={daiApproved | !stakePrice} loading={approving} onClick={() => approve(createMStakePrice)}>
            {daiApproved ? 'Approved' : 'Approve'} {createMStakePrice} DAI
          </Button>
          <Button
            content="Create"
            labelPosition='right'
            icon='checkmark'
            positive
            disabled={!daiApproved}
            loading={isCreating}
            onClick={() => stakeAndCreateMembership(stakePrice)}
          />
        </Modal.Actions>
      </Modal>
    );
};

const MpCell = (props) => {
    const classes = useStyles();
    const mp = useContractReader(props.readContracts,"LmContract", "mpMap", [props.mpId])
    const [isPicked, setIsPicked] = useState(false)
    const [isDaiApproved, setIsDaiApproved] = useState(false)
    const [isDaiApproving, setIsDaiApproving] = useState(false)
    const [isJoining, setIsJoining] = useState(false)

    const approveDai = async (_amount) => {
      console.log("approveDai",_amount)
      try {
      setIsDaiApproving(true)
      let tokenContract = new ethers.Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F", IErc20, props.signer);
      let approval = await tokenContract.approve(props.writeContracts.LmContract.address, _amount)
      console.log('approval', approval)
      setIsDaiApproving(false)
      setIsDaiApproved(true)
      notification.open({
        message: 'Token transfer approved',
        description:
        `Dropletpool can now move up to ${formatUnits(_amount,18)} DAI`,
      }) } catch (e) {
        console.log(e)
        setIsDaiApproving(false)
        setIsDaiApproved(false)
        notification.open({
          message: 'Approval failed',
          description:
          `DAI approval did not take place`,
        })
      }
    }
 
    const stakeAndJoinMembership = async () => {
        console.log("stakeAndJoinMembership")
        setIsJoining(true)
        try {
            await props.tx( props.writeContracts.LmContract.stakeAndJoinMembership(props.mpId) )
            notification.open({
                message: 'stakeAndJoinMembership succeed',
                description: `Membership program ${mp.title} joined`,
            })
            setIsPicked(false)
        } catch (e) {
            notification.open({
                message: 'stakeAndJoinMembership failed',
                description: `stakeAndJoinMembership did not take place`,
            })
        }
        setIsJoining(false)
    }

    return (
        <div className={classes.cardPadding}>
        {mp ?
            <Card>
              <Image src={mp.imageUrl} wrapped ui={false} />
              <Card.Content>
                <Card.Header>{mp.title}</Card.Header>
                <Card.Meta>
                  <span className='date'>Joined in 2015</span>
                </Card.Meta>
                <Card.Description>
                  {mp.description}
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Grid columns={2}>
                <Grid.Column>
                    <Button as='div' labelPosition='right' onClick={() => openUrlInNewWindow(mp.linkUrl)}>
                      <Button color='red'><Icon name='user' /></Button>
                      <Label as='a' basic color='red' pointing='left'>{mp.numOfMembers.toString()}</Label>
                    </Button>
                </Grid.Column>
                <Grid.Column>
                    <Button as='div' labelPosition='right' onClick={() => setIsPicked(!isPicked)}>
                      <Button color='green'><Icon name='dollar' /></Button>
                      <Label as='a' basic color='green' pointing='left'>{formatUnits(mp.stakePrice,18)}</Label>
                    </Button>
                </Grid.Column>
                {isPicked ? 
                <Grid.Row>
                <Grid.Column>
                    <Button color='orange' disabled={isDaiApproved} loading={isDaiApproving} onClick={() => approveDai(mp.stakePrice)}>
                      {isDaiApproved ? 'Approved' : 'Approve'} {formatUnits(mp.stakePrice,18)} DAI
                    </Button>
                </Grid.Column>
                <Grid.Column>
                    <Button
                      content="Join"
                      labelPosition='right'
                      icon='checkmark'
                      positive
                      disabled={!isDaiApproved}
                      loading={isJoining}
                      onClick={() => stakeAndJoinMembership(mp.stakePrice)}
                    />
                </Grid.Column>
                </Grid.Row>
                : null}
                </Grid>
              </Card.Content>
            </Card>
        : null }
        </div>
    );
};

export {
    AddMPButton,
    MpCell,
};
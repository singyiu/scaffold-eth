/* eslint-disable jsx-a11y/accessible-emoji */

//import _ from 'lodash'
import React from "react";
import { useState, useEffect } from "react";
import { Container, Label, Icon } from 'semantic-ui-react';
import { useContractReader } from "../hooks";
//import { useEventListener } from "../hooks";
import axios from "axios";

export default function DiscordBot(props) {
    const targetMpId = props.match.params.targetMpId;
    const guildId = props.match.params.guildId;
    const userId = props.match.params.userId;
    const roleId = props.match.params.roleId;
    const address = props.address;

    const [isAddRoleDone, setIsAddRoleDone] = useState(false)
    const [isRemoveRoleDone, setIsRemoveRoleDone] = useState(false)
    const isUserAMember = useContractReader(props.readContracts,"LmContract", "isUserAMember", [address, targetMpId])

    const postAddRoleRequest = () => {
        axios.post('http://localhost:4000/addrole/' + targetMpId + '/' + address + '/' + guildId + '/' + userId + '/' + roleId).catch(console.error)
        setIsAddRoleDone(true)
    }

    const postRemoveRoleRequest = () => {
        axios.post('http://localhost:4000/removerole/' + targetMpId + '/' + address).catch(console.error)
        setIsRemoveRoleDone(true)
    }

    /*
    const processMembershipUnsubscribeEvent = async (_event) => {
        if (_event[0]) {
          //console.log("processMembershipUnsubscribeEvent", _event)
          //console.log("processMembershipUnsubscribeEvent len", _event.length)
          //console.log("processMembershipUnsubscribeEvent event0", _event[0])
          //console.log("processMembershipUnsubscribeEvent mId", _event[0].mId)
          //console.log("processMembershipUnsubscribeEvent userAddress", _event[0].userAddress)
          const response = axios.post('http://localhost:4000/removerole/1/' + _event[0].userAddress)
          console.log('postRemoveRoleRequest', response.data)
        }
    }
    const membershipUnsubscribeEvent = useEventListener(readContracts, "LmContract", "MembershipUnsubscribeEvent", localProvider, 1)
    processMembershipUnsubscribeEvent(membershipUnsubscribeEvent)
    */

    useEffect(() => {
        if (isUserAMember && !isAddRoleDone) {
            postAddRoleRequest()
        }
        if (isAddRoleDone && !isUserAMember && !isRemoveRoleDone) {
            postRemoveRoleRequest()
        }
    })

    return (
        <Container>
        <Container style={{height:200}}></Container>
        <Container>
            {(isUserAMember && isAddRoleDone) ?
                <Label size='massive' color='green'>Authenticated. VIP roles added to your Discord user
                <span>&nbsp;&nbsp;</span>
                <Icon name='checkmark' />
                </Label>
            :
                <Label size='massive' color='orange'>To authenticate, please connect with the wallet that you had used to join the membership
                <span>&nbsp;&nbsp;</span>
                <Icon name='address card' />
                </Label>
            }
        </Container>
        </Container>
    );
}

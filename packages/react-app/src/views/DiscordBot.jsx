/* eslint-disable jsx-a11y/accessible-emoji */

//import _ from 'lodash'
import React from "react";
//import { useState } from "react";
import { Container, Label, Icon } from 'semantic-ui-react';
import { useContractReader } from "../hooks";
import axios from "axios";

export default function DiscordBot(props) {
    const targetMpId = props.match.params.targetMpId;
    const guildId = props.match.params.guildId;
    const userId = props.match.params.userId;
    const roleId = props.match.params.roleId;
    const address = props.address;
    //console.log("userId", userId)
    //console.log("targetMpId", targetMpId)
    //console.log("address", address);

    const isUserAMember = useContractReader(props.readContracts,"LmContract", "isUserAMember", [address, targetMpId])
    //console.log("isUserAMember", isUserAMember);

    const postAddRoleRequestIfMember = (_isUserAMember) => {
        if (isUserAMember) {
            const response = axios.post('http://localhost:4000/addrole/' + guildId + '/' + userId + '/' + roleId)
            console.log('postAddRoleRequestIfMember', response.data)
        }
        return isUserAMember
    }
    const isAuthenticated = postAddRoleRequestIfMember(isUserAMember)
    console.log("isAuthenticated", isAuthenticated);

    return (
        <Container>
        <Container style={{height:200}}></Container>
        <Container>
            {isAuthenticated ?
                <Label size='massive' color='green'>Authenticated. VIP roles added to your Discord user
                <span>&nbsp;&nbsp;</span>
                <Icon name='checkmark' />
                </Label>
            :
                <Label size='massive' color='orange'>To authenticate, Please connect with the wallet that you had used to join the membership
                <span>&nbsp;&nbsp;</span>
                <Icon name='address card' />
                </Label>
            }
        </Container>
        </Container>
    );
}

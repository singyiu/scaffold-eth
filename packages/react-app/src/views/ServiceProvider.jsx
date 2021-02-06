/* eslint-disable jsx-a11y/accessible-emoji */

import React from "react";
//import { useState, useEffect } from "react";
import { MpCell, AddMPButton } from '../components/ContentCell'
//import { notification } from "antd";
import { Card, Container } from 'semantic-ui-react';

export default function ServiceProvider({purpose, setPurposeEvents, address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, signer, daiContract, serviceProviderMpIds }) {

    return (
        <Container>
            <Container>
                <div style={{height:16}}></div>
                <AddMPButton writeContracts={writeContracts} signer={signer} tx={tx}/>
            </Container>
            <Card.Group centered itemsPerRow={5}>
            {serviceProviderMpIds ? serviceProviderMpIds.map((mpId) => {
              return (
                <MpCell
                key={mpId}
                readContracts={readContracts}
                mpId={mpId}
                writeContracts={writeContracts}
                signer={signer}
                tx={tx}
                address={address}
                />
              )
            }) : null}
            </Card.Group>
        </Container>
    );
}

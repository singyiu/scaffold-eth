/* eslint-disable jsx-a11y/accessible-emoji */

import React from "react";
//import { useState, useEffect } from "react";
import { MpCell, AddMPButton } from '../components/ContentCell'
//import { notification } from "antd";
import { Card, Container } from 'semantic-ui-react';

export default function ServiceProvider({purpose, setPurposeEvents, address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, signer, daiContract, serviceProviderMpIds }) {

    return (
        <Container>
            <Card.Group centered itemsPerRow={4}>
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
            <Container>
            <AddMPButton writeContracts={writeContracts} signer={signer} tx={tx}/>
            </Container>
        </Container>
    );
}

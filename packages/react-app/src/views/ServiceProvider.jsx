/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { ContentCell, AddMPButton } from '../components/ContentCell'

export default function ServiceProvider({purpose, setPurposeEvents, address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, signer, daiContract }) {
    return (
        <div>
        <ContentCell
        imageUrl="addButton.png"
        />
        <AddMPButton writeContracts={writeContracts} signer={signer} tx={tx}/>
        </div>
    );
}

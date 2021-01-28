/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useEffect } from "react";
import { MpCell, AddMPButton } from '../components/ContentCell'
import { notification } from "antd";

export default function ServiceProvider({purpose, setPurposeEvents, address, mainnetProvider, userProvider, localProvider, yourLocalBalance, price, tx, readContracts, writeContracts, signer, daiContract, serviceProviderMpIds }) {

    {/*
    const [mpIds, setMpIds] = useState();

    const getMyMembershipProgramIdList = async () => {
        console.log("getMyMembershipProgramIdList")
        try {
            let _mpIds = await tx (writeContracts.LmContract.getMyMembershipProgramIdList())
            setMpIds(mpIds)
        } catch(e) {
            notification.open({
                message: 'getMyMembershipProgramIdList failed',
                description: e,
            })
        }
        console.log("mpIds", mpIds)
    }

    useEffect(() => {
        getMyMembershipProgramIdList()
    });
    */}

    return (
        <div>
            {serviceProviderMpIds ? serviceProviderMpIds.map((mpId) => {
              return (
                <MpCell
                readContracts={readContracts}
                mpId={mpId}
                />
              )
            }) : null}
            <AddMPButton writeContracts={writeContracts} signer={signer} tx={tx}/>
        </div>
    );
}

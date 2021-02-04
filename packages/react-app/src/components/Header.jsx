import React from "react";
import { PageHeader } from "antd";
import { Container, Label, Icon } from 'semantic-ui-react';
import { formatUnits } from "@ethersproject/units";

export default function Header(props) {
  return (
    <Container>
    <a href="https://github.com/singyiu/dropletpool" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="DropletPool"
        subTitle="Lossless Membership"
        style={{ cursor: "pointer" }}
        avatar={{src:'logo192.png', size:'small'}}
      />
    </a>
    <Container textAlign='left'>
    <Label as='a' basic color='pink' >
    <Icon name='user' /> {formatUnits(props.numOfAllMembers,0)}
    </Label>
    <Label as='a' basic color='blue' >
    <Icon name='dollar' /> {formatUnits(props.allMembershipStakeSum,18)}
    </Label>
    <Label as='a' basic color='yellow' >
    <Icon name='dollar' /> {formatUnits(props.allCreateMStakeSum,18)}
    </Label>
    </Container>
    </Container>
  );
}

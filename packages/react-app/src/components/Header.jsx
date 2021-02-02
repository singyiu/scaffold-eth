import React from "react";
import { PageHeader } from "antd";

export default function Header() {
  return (
    <a href="https://github.com/singyiu/dropletpool" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="DropletPool"
        subTitle="Lossless Membership"
        style={{ cursor: "pointer" }}
        avatar={{src:'logo192.png', size:'small'}}
      />
    </a>
  );
}

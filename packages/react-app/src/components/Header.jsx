import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a
      href="https://github.com/Chris-Kag/scaffold-eth-examples/tree/crystals"
      target="_blank"
      rel="noopener noreferrer"
    >
      <PageHeader title="AI Crystals" subTitle="uniquely generated AI crystals" style={{ cursor: "pointer" }} />
    </a>
  );
}

import React from "react";

export default function StaticText({ children, className = "", tag = "span", style = {} }) {
  const Tag = tag;
  return (
    <Tag
      className={className}
      style={style}
    >
      {children}
    </Tag>
  );
}

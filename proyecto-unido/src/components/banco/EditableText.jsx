import React from "react";

export default function EditableText({ children, className = "", tag = "span", style = {} }) {
  const Tag = tag;
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      className={className}
      style={{
        outline: "none",
        cursor: "text",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
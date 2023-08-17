import React from "react";

const Custom404 = () => {
  return (
    <div>
      <div style={{ lineHeight: "48px" }}>
        <h1
          className="next-error-h1"
          style={{
            display: "inline-block;margin:0 20px 0 0",
            paddingRight: "23px",
          }}
        >
          404
        </h1>
        <div style={{ display: "inline-block" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 400, lineHeight: "28px" }}>
            This page could not be found
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Custom404;

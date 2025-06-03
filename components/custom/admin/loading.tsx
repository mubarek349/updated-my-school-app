import React from "react";

function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          border: "8px solid #c7d2fe",
          borderTop: "8px solid #2F68F9",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      {/* <h3
        style={{
          marginTop: 24,
          color: "#6366f1",
          // fontWeight: 600,
          // fontSize: 24,
          letterSpacing: 1,
        }}
      >
        Loading, please wait...
      </h3> */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
}

export default Loading;

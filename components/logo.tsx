export function Logo() {
  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: 28,
        background: "#3f4648",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }}
    >
      {/* símbolo */}
      <div
        style={{
          position: "relative",
          width: 50,
          height: 50
        }}
      >
        {/* pétalas */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 24,
              height: 40,
              background: "linear-gradient(145deg, #ff4d4d, #b91c1c)",
              borderRadius: "50% 50% 50% 50%",
              top: 5,
              left: "50%",
              transformOrigin: "bottom center",
              transform: `translateX(-50%) rotate(${i * 72}deg)`
            }}
          />
        ))}
      </div>

      {/* nome */}
      <span
        style={{
          marginTop: 10,
          color: "#e5e7eb",
          fontSize: 14,
          letterSpacing: 2,
          fontWeight: 500
        }}
      >
        FINEXA
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#020617",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        <p style={{ letterSpacing: "4px", color: "#60a5fa" }}>
          EXAMIA
        </p>

        <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>
          Learn Smart. Pass Strong.
        </h1>

        <p style={{ marginTop: "20px", color: "#cbd5f5" }}>
          EXAMIA is a controlled learning system that connects students
          to trusted teachers — without WhatsApp, without direct contact,
          and with full progress tracking.
        </p>

        <div style={{ marginTop: "30px" }}>
          <a href="/request" style={{
            padding: "12px 20px",
            backgroundColor: "#3b82f6",
            borderRadius: "10px",
            color: "white",
            textDecoration: "none",
            marginRight: "10px"
          }}>
            Request a Lesson
          </a>

          <a href="/lesson/demo" style={{
            padding: "12px 20px",
            border: "1px solid #475569",
            borderRadius: "10px",
            color: "white",
            textDecoration: "none"
          }}>
            Lesson Room Demo
          </a>
        </div>
      </div>
    </main>
  );
}
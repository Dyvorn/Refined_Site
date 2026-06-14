export default function About() {
  return (
    <main className="container" style={{ padding: '80px 24px', maxWidth: '800px' }}>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '40px' }}>About Me</h1>
      <div className="glass-panel">
        <p style={{ fontSize: '1.125rem', lineHeight: '1.7', marginBottom: '20px' }}>
          Hi, I'm Lennard. I'm a developer and creator focused on building amazing web experiences and sharing my journey on YouTube.
        </p>
        <p style={{ fontSize: '1.125rem', lineHeight: '1.7', marginBottom: '20px' }}>
          My tech stack includes Python, Next.js, and modern CSS. I believe in clean code and beautiful aesthetics.
        </p>
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Contact</h2>
          <a href="mailto:hello@example.com" style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>hello@example.com</a>
        </div>
      </div>
    </main>
  );
}

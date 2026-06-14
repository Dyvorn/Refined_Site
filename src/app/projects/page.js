export default function Projects() {
  return (
    <main className="container" style={{ padding: '80px 24px' }}>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '40px' }}>Projects Showcase</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Placeholder for project cards */}
        <div className="glass-panel hover-lift">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Project Alpha</h3>
          <p style={{ color: '#9ca3af', marginBottom: '16px' }}>An interactive web app demonstrating advanced UI concepts.</p>
          <a href="/projects/alpha" style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>View Interactive Demo →</a>
        </div>
        <div className="glass-panel hover-lift">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Project Beta</h3>
          <p style={{ color: '#9ca3af', marginBottom: '16px' }}>My latest data visualization tool built from scratch.</p>
          <a href="/projects/beta" style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Read Case Study →</a>
        </div>
      </div>
    </main>
  );
}

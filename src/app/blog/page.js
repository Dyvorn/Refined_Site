export default function Blog() {
  return (
    <main className="container" style={{ padding: '80px 24px' }}>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '40px' }}>Blog & Videos</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Placeholder for blog posts */}
        <article className="glass-panel hover-lift" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
             <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>How I built my new interactive portfolio</h2>
             <p style={{ color: '#9ca3af', marginBottom: '16px' }}>A deep dive into Next.js, Vanilla CSS, and modern web aesthetics.</p>
             <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>June 14, 2026</span>
          </div>
        </article>
      </div>
    </main>
  );
}

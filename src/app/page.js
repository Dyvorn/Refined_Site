import Link from 'next/link';

export default function Home() {
  return (
    <main className="container" style={{ padding: '80px 24px' }}>
      <section style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '24px' }}>
          Welcome to My Hub
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#9ca3af', maxWidth: '600px', margin: '0 auto 40px' }}>
          Exploring tech through YouTube, building interactive projects, and writing about my journey.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/projects" className="glass-panel hover-lift" style={{ padding: '12px 24px', fontWeight: 'bold', display: 'inline-block' }}>
            View Projects
          </Link>
          <Link href="/blog" style={{ padding: '12px 24px', fontWeight: 'bold', color: 'var(--accent-blue)', display: 'inline-block', alignContent: 'center' }}>
            Read the Blog →
          </Link>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <Link href="/projects/interactive-demo" className="glass-panel hover-lift">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Interactive Project Hub</h2>
          <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
            Deep-dive into my latest creations with dedicated interactive sub-sites that you can explore right here.
          </p>
          <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>Explore Projects →</span>
        </Link>
        
        <Link href="/blog/latest-video" className="glass-panel hover-lift">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Latest YouTube Video</h2>
          <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
            Watch my newest video and read the accompanying technical article detailing the build process.
          </p>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Watch Now →</span>
        </Link>
      </div>
    </main>
  );
}

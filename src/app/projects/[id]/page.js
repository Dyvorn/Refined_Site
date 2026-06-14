export default async function ProjectSubSite({ params }) {
  // Await params if using Next.js 15+ async page parameters
  const resolvedParams = await params;
  const id = resolvedParams?.id || 'unknown';

  return (
    <main className="container" style={{ padding: '80px 24px' }}>
      <a href="/projects" style={{ display: 'inline-block', marginBottom: '24px', color: '#9ca3af' }}>← Back to Projects</a>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '24px', textTransform: 'capitalize' }}>
        Interactive Project: {id.replace(/-/g, ' ')}
      </h1>
      <div className="glass-panel">
        <p style={{ color: '#9ca3af', marginBottom: '40px', fontSize: '1.125rem' }}>
          This is a dedicated sub-site for the project "{id}". Here you can embed an interactive canvas, demo, or detailed write-up.
        </p>
        <div style={{ height: '400px', backgroundColor: 'var(--glass-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--glass-border)' }}>
          <span style={{ color: '#6b7280', fontSize: '1.25rem' }}>Interactive Demo Canvas Placeholder</span>
        </div>
      </div>
    </main>
  );
}

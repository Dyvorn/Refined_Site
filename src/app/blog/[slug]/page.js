export default async function BlogPost({ params }) {
  // Await params if using Next.js 15+ async page parameters
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'unknown';

  return (
    <main className="container" style={{ padding: '80px 24px', maxWidth: '800px' }}>
      <a href="/blog" style={{ display: 'inline-block', marginBottom: '24px', color: '#9ca3af' }}>← Back to Blog</a>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '24px', textTransform: 'capitalize' }}>
        {slug.replace(/-/g, ' ')}
      </h1>
      <div className="glass-panel">
        <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'var(--glass-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--glass-border)', marginBottom: '40px' }}>
          <span style={{ color: '#6b7280', fontSize: '1.25rem' }}>YouTube Video Embed Placeholder</span>
        </div>
        <div style={{ color: '#e5e7eb', lineHeight: '1.8', fontSize: '1.125rem' }}>
          <p style={{ marginBottom: '20px' }}>
            This is the written article accompanying the video. You can easily author these posts using MDX, which allows you to write Markdown and seamlessly embed React components.
          </p>
          <p>
            Stay tuned for the full technical breakdown.
          </p>
        </div>
      </div>
    </main>
  );
}

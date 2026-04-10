import { useState } from 'react';
import { generateSummary, generateTags, generateTitle, suggestContent } from '../services/aiService';

/**
 * AIAssistPanel
 * Reusable AI assistant panel for the blog editor.
 *
 * Props:
 *   title       {string}   current post title value
 *   body        {string}   current post body value
 *   onUseTitle  {fn}       called with a chosen title string
 *   onUseSummary {fn}      called with the generated summary string
 *   onUseTags   {fn}       called with array of tag strings
 *   onInsertContent {fn}   called with a content idea string to append
 */
export default function AIAssistPanel({
  title = '',
  body = '',
  onUseTitle,
  onUseSummary,
  onUseTags,
  onInsertContent,
}) {
  const [open, setOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null); // 'title'|'ideas'|'summary'|'tags'
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const noKey = !import.meta.env.VITE_GEMINI_API_KEY;

  async function run(feature) {
    setActiveFeature(feature);
    setResult('');
    setError('');
    setLoading(true);

    try {
      let output = '';
      if (feature === 'title') output = await generateTitle(body);
      else if (feature === 'ideas') output = await suggestContent(title || body);
      else if (feature === 'summary') output = await generateSummary(body);
      else if (feature === 'tags') output = await generateTags(title, body);
      setResult(output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Parse numbered list "1. X\n2. Y\n3. Z" → array of strings
  function parseList(text) {
    return text
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  }

  // Parse comma tags "tech, life, coding" → array
  function parseTags(text) {
    return text
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  }

  return (
    <div className="ai-panel">
      {/* Toggle button */}
      <button
        type="button"
        className={`ai-panel-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="ai-sparkle">✦</span>
        <span>AI Writing Assistant</span>
        <span className="ai-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="ai-panel-body glass-panel">
          {noKey && (
            <div className="ai-no-key-notice">
              <span>⚠️</span>
              <span>
                Running in <strong>demo mode</strong>. Add{' '}
                <code>VITE_GEMINI_API_KEY</code> to your <code>.env</code> file for live AI.
              </span>
            </div>
          )}

          {/* Feature buttons */}
          <div className="ai-feature-grid">
            <button
              type="button"
              className={`ai-feature-btn ${activeFeature === 'title' ? 'active' : ''}`}
              onClick={() => run('title')}
              disabled={loading}
            >
              <span className="ai-feature-icon">✏️</span>
              <span className="ai-feature-label">Generate Title</span>
              <span className="ai-feature-desc">AI suggests 3 catchy titles</span>
            </button>

            <button
              type="button"
              className={`ai-feature-btn ${activeFeature === 'ideas' ? 'active' : ''}`}
              onClick={() => run('ideas')}
              disabled={loading}
            >
              <span className="ai-feature-icon">💡</span>
              <span className="ai-feature-label">Content Ideas</span>
              <span className="ai-feature-desc">Get 3 writing angles</span>
            </button>

            <button
              type="button"
              className={`ai-feature-btn ${activeFeature === 'summary' ? 'active' : ''}`}
              onClick={() => run('summary')}
              disabled={loading}
            >
              <span className="ai-feature-icon">📝</span>
              <span className="ai-feature-label">Auto Summary</span>
              <span className="ai-feature-desc">2–3 line post summary</span>
            </button>

            <button
              type="button"
              className={`ai-feature-btn ${activeFeature === 'tags' ? 'active' : ''}`}
              onClick={() => run('tags')}
              disabled={loading}
            >
              <span className="ai-feature-icon">🏷️</span>
              <span className="ai-feature-label">Smart Tags</span>
              <span className="ai-feature-desc">Auto-generate 5 tags</span>
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="ai-loading">
              <div className="ai-loader"></div>
              <span>AI is thinking...</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="ai-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            <div className="ai-results">
              <p className="ai-results-label">
                {activeFeature === 'title' && '✏️ Suggested Titles — click one to use it:'}
                {activeFeature === 'ideas' && '💡 Writing Ideas — click one to add to your story:'}
                {activeFeature === 'summary' && '📝 Generated Summary:'}
                {activeFeature === 'tags' && '🏷️ Suggested Tags — click to apply:'}
              </p>

              {/* Title results */}
              {activeFeature === 'title' &&
                parseList(result).map((item, i) => (
                  <div key={i} className="ai-result-row">
                    <span className="ai-result-text">{item}</span>
                    <button
                      type="button"
                      className="ai-use-btn"
                      onClick={() => onUseTitle?.(item)}
                    >
                      Use
                    </button>
                  </div>
                ))}

              {/* Ideas results */}
              {activeFeature === 'ideas' &&
                parseList(result).map((item, i) => (
                  <div key={i} className="ai-result-row">
                    <span className="ai-result-text">{item}</span>
                    <button
                      type="button"
                      className="ai-use-btn"
                      onClick={() => onInsertContent?.(item)}
                    >
                      Add
                    </button>
                  </div>
                ))}

              {/* Summary result */}
              {activeFeature === 'summary' && (
                <div className="ai-result-summary">
                  <p className="ai-result-summary-text">{result}</p>
                  <button
                    type="button"
                    className="ai-use-btn"
                    onClick={() => onUseSummary?.(result)}
                  >
                    Use as Summary
                  </button>
                </div>
              )}

              {/* Tags results */}
              {activeFeature === 'tags' && (
                <div className="ai-tags-row">
                  {parseTags(result).map((tag, i) => (
                    <button
                      key={i}
                      type="button"
                      className="ai-tag-chip"
                      onClick={() => onUseTags?.(parseTags(result))}
                      title="Click to apply all tags"
                    >
                      #{tag}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="ai-use-btn"
                    onClick={() => onUseTags?.(parseTags(result))}
                  >
                    Apply All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { generateSummary, generateTags, generateTitle, suggestContent } from '../services/aiService';

export default function AIAssistPanel({
  title = '',
  body = '',
  onUseTitle,
  onUseSummary,
  onUseTags,
  onInsertContent,
}) {
  const [open, setOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  function parseList(text) {
    return text
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  }

  function parseTags(text) {
    return text
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }

  return (
    <div className="ai-panel">
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
              <span className="ai-feature-desc">2-3 line post summary</span>
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

          {loading && (
            <div className="ai-loading">
              <div className="ai-loader"></div>
              <span>AI is thinking...</span>
            </div>
          )}

          {!loading && error && (
            <div className="ai-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          {!loading && result && (
            <div className="ai-results">
              <p className="ai-results-label">
                {activeFeature === 'title' && '✏️ Suggested Titles - click one to use it:'}
                {activeFeature === 'ideas' && '💡 Writing Ideas - click one to add to your story:'}
                {activeFeature === 'summary' && '📝 Generated Summary:'}
                {activeFeature === 'tags' && '🏷️ Suggested Tags - click to apply:'}
              </p>

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

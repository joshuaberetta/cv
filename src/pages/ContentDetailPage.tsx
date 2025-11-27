import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Content } from '../types/content';
import './globe-page.css';

interface ContentDetailPageProps {
  allContent: Content[];
}

const ContentDetailPage: React.FC<ContentDetailPageProps> = ({ allContent }) => {
  const { section, slug } = useParams<{ section: string; slug: string }>();
  const navigate = useNavigate();
  
  const content = allContent.find(
    item => item.section === section && item.slug === slug
  );

  if (!content) {
    return (
      <div className="content-detail-page">
        <div className="detail-not-found">
          <h1>Content Not Found</h1>
          <p>The requested {section} item could not be found.</p>
          <button onClick={() => navigate('/globe')} className="back-button">
            ← Back to Globe
          </button>
        </div>
      </div>
    );
  }

  const renderTags = () => {
    if ('tags' in content && content.tags) {
      return (
        <div className="detail-tags">
          {content.tags.map((tag, index) => (
            <span key={index} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderMetadata = () => {
    const metadata: Array<{ label: string; value: string }> = [];

    if ('url' in content && content.url) {
      metadata.push({ label: '🔗 Link', value: content.url });
    }
    if ('organization' in content && content.organization) {
      metadata.push({ label: '🏢 Organization', value: content.organization });
    }
    if ('company' in content && content.company) {
      metadata.push({ label: '🏢 Company', value: content.company });
    }
    if ('destination' in content && content.destination) {
      metadata.push({ label: '📍 Destination', value: content.destination });
    }
    if ('country' in content && content.country) {
      metadata.push({ label: '🌍 Country', value: content.country });
    }
    if ('location' in content && content.location) {
      metadata.push({ label: '📍 Location', value: content.location });
    }
    if ('purpose' in content && content.purpose) {
      metadata.push({ label: '🎯 Purpose', value: content.purpose });
    }
    if ('year' in content && content.year) {
      metadata.push({ label: '📅 Year', value: content.year });
    }
    if ('startDate' in content && content.startDate) {
      const endDate = 'endDate' in content ? content.endDate : 'Present';
      metadata.push({ label: '📅 Period', value: `${content.startDate} - ${endDate}` });
    }
    if ('language' in content && content.language) {
      metadata.push({ label: '🗣️ Language', value: content.language });
    }

    if (metadata.length === 0) return null;

    return (
      <div className="detail-metadata">
        {metadata.map((item, index) => (
          <div key={index} className="metadata-item">
            <span className="metadata-label">{item.label}</span>
            {item.label.includes('Link') ? (
              <a href={item.value} target="_blank" rel="noopener noreferrer" className="metadata-value metadata-link">
                {item.value}
              </a>
            ) : (
              <span className="metadata-value">{item.value}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="content-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate('/globe')} className="back-button">
          ← Back to Globe
        </button>
        <div className="detail-breadcrumb">
          <span className="breadcrumb-section">{section}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">{content.name}</span>
        </div>
      </div>
      
      <div className="detail-container">
        <h1 className="detail-title">{content.name}</h1>
        
        {renderTags()}
        {renderMetadata()}
        
        <div className="detail-body">
          <ReactMarkdown>{content.body}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ContentDetailPage;

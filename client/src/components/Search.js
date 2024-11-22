import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:4000/post/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const posts = await response.json();
      setSearchResults(posts);
      setShowDropdown(posts.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, handleSearch]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value.trim()) {
      setShowDropdown(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowDropdown(false);
      setSearchTerm('');
    }
  };

  const handleResultClick = (postId) => {
    setShowDropdown(false);
    setSearchTerm('');
    navigate(`/post/${postId}`);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          className="search-input"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && searchResults.length > 0 && setShowDropdown(true)}
        />
        <button type="submit" className="search-button">
          <SearchIcon />
        </button>
      </form>
      
      {showDropdown && searchResults.length > 0 && (
        <div className="search-results-dropdown">
          {searchResults.map(post => (
            <div 
              key={post._id} 
              className="search-result-item"
              onClick={() => handleResultClick(post._id)}
            >
              <div className="search-result-title">
                {post.title}
              </div>
              <div className="search-result-author">
                by {post.author.username}
              </div>
              <div className="search-result-summary">
                {post.summary}
              </div>
            </div>
          ))}
        </div>
      )}
      {isSearching && (
        <div className="search-loading">Searching...</div>
      )}
    </div>
  );
} 
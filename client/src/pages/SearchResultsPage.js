import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Post from '../Post';

export default function SearchResultsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = new URLSearchParams(location.search).get('q');

  const fetchSearchResults = useCallback(async () => {
    if (!searchQuery) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/post/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const fetchedPosts = await response.json();
      
      // Sort results
      const sortedPosts = fetchedPosts.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const searchLower = searchQuery.toLowerCase();
        
        // Exact matches first
        if (aTitle === searchLower && bTitle !== searchLower) return -1;
        if (bTitle === searchLower && aTitle !== searchLower) return 1;
        
        // Then starts with
        if (aTitle.startsWith(searchLower) && !bTitle.startsWith(searchLower)) return -1;
        if (bTitle.startsWith(searchLower) && !aTitle.startsWith(searchLower)) return 1;
        
        // Then by date
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Failed to fetch search results');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, navigate]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  if (!searchQuery) return null;

  return (
    <div className="search-results-page">
      <h1>Search Results for "{searchQuery}"</h1>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <p className="results-count">{posts.length} results found</p>
          {posts.length > 0 ? (
            posts.map(post => (
              <Post key={post._id} {...post} />
            ))
          ) : (
            <p className="no-results">No posts found matching your search.</p>
          )}
        </>
      )}
    </div>
  );
} 
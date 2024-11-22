import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Post from "../Post";

export default function SearchPage() {
  const [posts, setPosts] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');

  useEffect(() => {
    if (searchQuery) {
      fetch(`http://localhost:4000/search?q=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(posts => {
          setPosts(posts);
        });
    }
  }, [searchQuery]);

  return (
    <div className="search-results">
      <h2>Search Results for: "{searchQuery}"</h2>
      {posts.length === 0 ? (
        <p className="no-results">No posts found matching your search.</p>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <Post {...post} key={post._id} />
          ))}
        </div>
      )}
    </div>
  );
} 
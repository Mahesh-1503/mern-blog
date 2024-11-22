// Function to calculate relevance score for a post
export function calculateRelevance(post, searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  let score = 0;
  
  // Exact matches (highest weight)
  if (post.title.toLowerCase() === searchLower) {
    score += 50;
  }
  if (post.summary.toLowerCase() === searchLower) {
    score += 30;
  }
  
  // Title match (high weight)
  if (post.title.toLowerCase().includes(searchLower)) {
    score += 20;
    // Bonus for title starting with search term
    if (post.title.toLowerCase().startsWith(searchLower)) {
      score += 10;
    }
  }
  
  // Summary match (medium weight)
  if (post.summary.toLowerCase().includes(searchLower)) {
    score += 10;
  }
  
  // Content match (lower weight)
  if (post.content.toLowerCase().includes(searchLower)) {
    score += 5;
  }
  
  // Author match
  if (post.author.username.toLowerCase().includes(searchLower)) {
    score += 3;
  }
  
  // Recent posts bonus (posts from the last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const postDate = new Date(post.createdAt);
  if (postDate > oneWeekAgo) {
    score += 2;
  }
  
  return score;
}

// Function to sort posts by relevance
export function sortPostsByRelevance(posts, searchTerm) {
  return [...posts].sort((a, b) => {
    const scoreA = calculateRelevance(a, searchTerm);
    const scoreB = calculateRelevance(b, searchTerm);
    return scoreB - scoreA;  // Sort in descending order
  });
} 
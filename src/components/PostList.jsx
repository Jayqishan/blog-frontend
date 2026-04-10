import PostCard from './PostCard';

export default function PostList(props) {
  const { posts } = props;
  if (!posts.length) return null;

  return (
    <div className="posts-feed">
      {posts.map((post, index) => (
        <div key={post._id} className="posts-feed-item">
          <PostCard post={post} index={index} {...props} />
        </div>
      ))}
    </div>
  );
}

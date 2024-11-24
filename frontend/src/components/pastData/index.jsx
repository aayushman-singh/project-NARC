  import React, { useState } from "react";
  import { User, Image, Heart, MessageCircle } from "lucide-react";

  // Import the JSON data (assuming it's in a file named instagramData.json)
  import instagramData from "../data/Instagram.json";

  const GlassCard = ({ children }) => (
    <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl">
      {children}
    </div>
  );

  const UserCard = ({ user }) => (
    <GlassCard>
      <div className="flex items-center mb-4">
        <User className="w-12 h-12 text-blue-400 mr-4" />
        <div>
          <h3 className="text-xl font-semibold text-white">{user.username}</h3>
          <p className="text-sm text-gray-300">{user.full_name}</p>
        </div>
      </div>
      <p className="text-gray-300 mb-4">{user.biography}</p>
      <div className="flex justify-between text-sm text-gray-300">
        <span>Followers: {user.followers}</span>
        <span>Following: {user.following}</span>
      </div>
    </GlassCard>
  );

  const PostCard = ({ post }) => (
    <GlassCard>
      <Image className="w-full h-48 object-cover rounded-lg mb-4" />
      <p className="text-gray-300 mb-2">{post.caption}</p>
      <div className="flex justify-between text-sm text-gray-300">
        <span>
          <Heart className="inline w-4 h-4 mr-1" /> {post.likes}
        </span>
        <span>
          <MessageCircle className="inline w-4 h-4 mr-1" /> {post.comments}
        </span>
      </div>
    </GlassCard>
  );

  const InstagramDataDisplay = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const users = instagramData.Instagram.instagram;

    return (
      <section className="py-20 bg-gray-900 min-h-screen">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl sm:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-8">
            User Data
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 mt-4 max-w-3xl mx-auto text-center mb-12">
            Explore user profiles and posts from our comprehensive data
            collection.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className="cursor-pointer"
              >
                <UserCard user={user} />
              </div>
            ))}
          </div>

          {selectedUser && (
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Posts by {selectedUser.username}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {selectedUser.posts.slice(0, 6).map((post) => (
                  <PostCard key={post.post_id} post={post} />
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <a
              href="#"
              className="inline-block text-white px-7 py-3 text-lg font-semibold bg-blue-600 bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
            >
              Explore More Data
            </a>
          </div>
        </div>
      </section>
    );
  };

  export default InstagramDataDisplay;
  
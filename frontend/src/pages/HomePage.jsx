import React, { useEffect, useState } from "react";
import { fetchNews } from "../api/newsApi";
import NewsCard from "../components/NewsCard";
import Poll from "../components/Poll";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [user, setUser] = useState(null);
  const [openPoll, setOpenPoll] = useState(null); // ✅ Track which poll is open
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false); // ✅ Logout Confirmation Modal State
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const getNews = async () => {
      const newsData = await fetchNews();
      setNews(newsData);
    };
    getNews();

    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, [auth]);

  const togglePoll = (newsId) => {
    if (openPoll === newsId) {
      setOpenPoll(null); // ✅ Close poll if it's already open
    } else {
      setOpenPoll(newsId); // ✅ Open the selected poll
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // ✅ Clear user state
      navigate("/"); // ✅ Redirect to Home Page after logout
    } catch (error) {
      console.error("❌ Error logging out:", error);
    }
  };

  return (
    <div className="bg-lightbg dark:bg-darkbg min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">📰 Latest News</h1>

          {user ? (
            <div className="flex items-center gap-3">
              {/* ✅ Profile Button to Navigate to Profile Page */}
              <button
                onClick={() => navigate("/profile")}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition shadow-md"
              >
                Profile
              </button>

              {/* ✅ Logout Button */}
              <button
                onClick={() => setShowLogoutPrompt(true)} // ✅ Open Logout Confirmation Modal
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Sign In
            </button>
          )}
        </div>

        <div className="space-y-6">
          {news.map((article, index) => (
            <React.Fragment key={article._id}>
              {/* ✅ Ensure `NewsCard` does NOT fetch the poll */}
              <NewsCard article={article} onTogglePoll={() => togglePoll(article._id)} />

              {/* ✅ Poll should only appear BETWEEN news articles and be rendered ONCE */}
              {openPoll === article._id && (
                <div className="relative bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md transition-all animate-slide-up">
                  <Poll pollId={article._id} />
                  <button
                    onClick={() => togglePoll(null)}
                    className="absolute top-2 right-4 text-xl text-gray-700 dark:text-gray-300 hover:text-primary transition bg-transparent p-2 rounded-full"
                    style={{ background: "rgba(255, 255, 255, 0.5)" }}
                  >
                    ^
                  </button>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ✅ Logout Confirmation Modal */}
      {showLogoutPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Are you sure you want to log out?
            </h2>
            <div className="flex justify-between">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutPrompt(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
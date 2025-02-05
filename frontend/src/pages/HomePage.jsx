import React, { useEffect, useState } from "react";
import { fetchNews } from "../api/newsApi";
import NewsCard from "../components/NewsCard";
import Poll from "../components/Poll";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import profileIcon from "/assets/profile-icon.svg";

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [user, setUser] = useState(null);
  const [openPoll, setOpenPoll] = useState(null); // Track which poll is open
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

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    await signOut(auth);
    navigate("/auth");
  };

  const togglePoll = (newsId) => {
    setOpenPoll(openPoll === newsId ? null : newsId);
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
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Sign In
            </button>
          )}
        </div>

        <div className="space-y-6">
          {news.map((article, index) => (
            <React.Fragment key={article._id}>
              <NewsCard
                article={article}
                isPollOpen={openPoll === article._id}
                onTogglePoll={togglePoll}
              />

              {/* ✅ Poll appears between news articles */}
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
    </div>
  );
};

export default HomePage;

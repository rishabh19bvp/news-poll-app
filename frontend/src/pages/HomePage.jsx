import React, { useEffect, useState, useRef } from "react";
import { fetchNews } from "../api/newsApi";
import NewsCard from "../components/NewsCard";
import Poll from "../components/Poll";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [news, setNews] = useState(() => {
    return JSON.parse(sessionStorage.getItem("newsData")) || []; // ✅ Retrieve stored news
  });
  const [user, setUser] = useState(null);
  const [openPoll, setOpenPoll] = useState(null);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const [loading, setLoading] = useState(news.length === 0); // ✅ Only show loader if news is empty
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const newsContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInitialNews = async () => {
      if (news.length > 0) {
        setLoading(false); // ✅ Don't reload if news already exists
        return;
      }

      setLoading(true);
      try {
        const freshNews = await fetchNews(page, 10);
        setNews(freshNews);
        sessionStorage.setItem("newsData", JSON.stringify(freshNews)); // ✅ Store news data
      } catch (error) {
        console.error("❌ Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialNews();
  }, [page]); // ✅ Only fetch news if page number changes

  const loadMoreNews = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const moreNews = await fetchNews(page + 1, 10);
      setNews((prevNews) => [...prevNews, ...moreNews]);
      sessionStorage.setItem("newsData", JSON.stringify([...news, ...moreNews]));
      setPage(page + 1);
    } catch (error) {
      console.error("❌ Error loading more news:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const togglePoll = (newsId) => {
    setOpenPoll(openPoll === newsId ? null : newsId);
  };

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("❌ Error logging out:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        newsContainerRef.current &&
        window.innerHeight + window.scrollY >= newsContainerRef.current.clientHeight - 300
      ) {
        loadMoreNews();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-lightbg dark:bg-darkbg min-h-screen p-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">📰 Latest News</h1>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition shadow-md"
              >
                Profile
              </button>
              <button
                onClick={() => setShowLogoutPrompt(true)}
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

        <div ref={newsContainerRef} className="space-y-6">
          {loading
            ? [...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse bg-gray-300 dark:bg-gray-700 h-24 rounded-lg"></div>
              ))
            : news.map((article, index) => (
                <React.Fragment key={article._id}>
                  <NewsCard article={article} onTogglePoll={() => togglePoll(article._id)} />
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

        {loadingMore && (
          <p className="text-gray-500 text-center mt-4">Loading more news...</p>
        )}
      </div>

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
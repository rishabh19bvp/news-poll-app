import React, { useState } from "react";
import { fetchPollForNews } from "../api/newsApi";
import Poll from "./Poll";

const NewsCard = ({ article, isPollOpen, onTogglePoll }) => {
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleShowPoll = async () => {
        setLoading(true);
        try {
            const pollData = await fetchPollForNews(article._id);
            setPoll(pollData);
        } catch (error) {
            console.error("Error fetching poll:", error);
        }
        setLoading(false);
    };

    const handleClick = async () => {
        if (!poll) {
            await handleShowPoll(); // ✅ Fetch poll only if not already loaded
        }
        onTogglePoll(article._id); // ✅ Toggle poll visibility
    };

    return (
        <div className="relative bg-cardlight dark:bg-carddark shadow-lg rounded-lg p-4 transition-all hover:scale-[1.02]">
            <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover rounded-lg" />

            <div className="mt-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{article.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{article.description}</p>

                <div className="flex justify-between items-center mt-3">
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-semibold hover:underline"
                    >
                        Read More
                    </a>

                    <button
                        onClick={handleClick}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        {loading ? "Loading..." : "View Poll"}
                    </button>
                </div>

                {isPollOpen && poll && (
                    <div className="absolute left-0 bottom-0 w-full bg-gray-100 dark:bg-gray-800 p-4 rounded-t-lg shadow-md transition-all animate-slide-up">
                        <Poll pollId={article._id} poll={poll} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsCard;
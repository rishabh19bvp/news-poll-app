import React from "react";

const NewsCard = ({ article, onTogglePoll }) => {
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

                    {/* ✅ "View Poll" button only toggles poll visibility */}
                    <button
                        onClick={() => onTogglePoll(article._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        View Poll
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsCard;
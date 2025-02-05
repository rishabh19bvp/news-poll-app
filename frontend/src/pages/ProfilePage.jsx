import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import axios from "axios";

const ProfilePage = () => {
    const [votes, setVotes] = useState([]);
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        const fetchUserVotes = async () => {
            if (!user) return;
    
            try {
                const response = await axios.get(`http://localhost:5001/api/user/votes/${user.uid}`);
                setVotes(response.data);
            } catch (error) {
                console.error("Error fetching user votes:", error);
            }
        };
    
        fetchUserVotes();
    }, [user, votes]); // ✅ Re-fetch votes when they change

    return (
        <div className="min-h-screen flex items-center justify-center bg-lightbg dark:bg-darkbg px-6 py-10">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Votes</h1>

                {votes.length > 0 ? (
                    <ul className="space-y-4">
                        {votes.map((vote) => (
                            <li key={vote.pollId} className="border-b py-4 text-gray-700 dark:text-gray-300">
                                <strong>{vote.question}</strong> → You voted **{vote.choice}**
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-lg">No votes recorded.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
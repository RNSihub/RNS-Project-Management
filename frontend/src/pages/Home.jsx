import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [query, setQuery] = useState("");
  const [latestJobs, setLatestJobs] = useState([]); // Separate state for latest jobs
  const [allJobs, setAllJobs] = useState([]);       // Separate state for all jobs
  const [platform, setPlatform] = useState("freelancer.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [newJobNotification, setNewJobNotification] = useState(false);

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUsername(parsedUserData.username);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setLatestJobs([]); // Clear latest jobs from previous search
    setAllJobs([]); // Clear all jobs from previous search
    setNewJobNotification(false);

    try {
      //Include the username in the API request
      const response = await fetch(
        `http://localhost:8000/api/scrape_jobs?search_query=${query}&platform=${platform}&username=${username}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data || !data.jobs || !Array.isArray(data.jobs)) {
        setError("No jobs found for this search, or invalid API response.");
        return;
      }

      setLatestJobs(data.new_jobs); // Set latest jobs
      setAllJobs(data.jobs); // Set ALL jobs

      setNewJobNotification(data.new_job_found);
      if (data.new_job_found) {
        const audio = new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3');
        audio.play();
      }
    } catch (err) {
      setError(err.message || "Failed to fetch jobs. Please try again.");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const extractTechStack = (description) => {
    if (!description) {
      return { cleanedDescription: "", techStack: [] }; // Handle undefined description
    }
    const techStackPattern = /Tech Stack: (.+)/;
    const match = description.match(techStackPattern);
    if (match) {
      const techStack = match[1].split(", ").map((item) => item.trim());
      const cleanedDescription = description.replace(techStackPattern, "").trim();
      return { cleanedDescription, techStack };
    }
    return { cleanedDescription: description, techStack: [] };
  };
  

  //Filter All jobs to remove duplicates.
  const filteredAllJobs = allJobs.filter(job => {
    return !latestJobs.some(latestJob => latestJob.link === job.link);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Freelancer Job Search</h1>
        <div className="flex items-center space-x-4">
          <span className="font-semibold">
            {username ? `Hello, ${username}` : "Welcome, Guest"}
          </span>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center p-4">
        <form onSubmit={handleSearch} className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-4 mt-6">
          <div className="flex flex-col">
            <label htmlFor="platform-select" className="font-medium text-gray-700">
              Platform:
            </label>
            <select
              id="platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="freelancer.com">Freelancer.com</option>
              <option value="upwork.com">Upwork.com</option>
              <option value="fiverr.com">Fiverr.com</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="search-input" className="font-medium text-gray-700">
              Job Keyword:
            </label>
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter job keyword..."
              className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading || !query.trim()}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <div className="mt-4 text-red-600 font-semibold">{error}</div>}

        {/* New Job Notification */}
        {newJobNotification && (
          <div className="mt-4 p-3 bg-green-200 text-green-800 rounded-md">
            🎉 New job(s) found! An email has been sent to you.
          </div>
        )}

        {/* Latest Jobs Section */}
        {latestJobs.length > 0 && (
          <div className="mt-6 w-full max-w-4xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Latest Jobs:</h2>
            <JobList jobs={latestJobs} extractTechStack={extractTechStack} />
          </div>
        )}

        {/* All Jobs Section */}
        {filteredAllJobs.length > 0 && (
          <div className="mt-6 w-full max-w-4xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">All Jobs:</h2>
            <JobList jobs={filteredAllJobs} extractTechStack={extractTechStack} />
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Job List component
const JobList = ({ jobs, extractTechStack }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {jobs.map((job, index) => {
      const { cleanedDescription, techStack } = extractTechStack(job.description || job.summary);
      return (
        <div key={index} className="bg-white p-4 shadow-md rounded-lg flex flex-col">
          <div className="bg-blue-100 p-2 rounded-md mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
          </div>
          <div className="bg-gray-100 p-2 rounded-md mb-4 flex-grow">
            <p className="text-gray-600">{cleanedDescription}</p>
          </div>
          {techStack.length > 0 && (
            <div className="bg-yellow-100 p-2 rounded-md mb-4">
              <strong>Tech Stack:</strong> {techStack.join(", ")}
            </div>
          )}
          <div className="flex justify-center">
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium"
            >
              View Job
            </a>
          </div>
        </div>
      );
    })}
  </div>
);

export default Home;
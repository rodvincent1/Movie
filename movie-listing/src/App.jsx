import { useEffect, useState } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

function App() {
    const [movies, setMovies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minRating, setMinRating] = useState(0);
    const [releaseYear, setReleaseYear] = useState("");
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [trailerKey, setTrailerKey] = useState("");
    const [userRatings, setUserRatings] = useState({});

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
                setMovies(response.data.results);
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
                setCategories(response.data.genres);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchMovies();
        fetchCategories();

        // Load saved ratings
        const savedRatings = JSON.parse(localStorage.getItem("userRatings")) || {};
        setUserRatings(savedRatings);
    }, []);

    const filteredMovies = movies.filter(movie =>
        (selectedCategory ? movie.genre_ids.includes(parseInt(selectedCategory)) : true) &&
        movie.vote_average >= minRating &&
        (releaseYear ? movie.release_date.startsWith(releaseYear) : true)
    );

    const fetchTrailer = async (movieId) => {
        try {
            const response = await axios.get(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
            const trailers = response.data.results.filter(video => video.type === "Trailer");
            setTrailerKey(trailers.length > 0 ? trailers[0].key : "");
        } catch (error) {
            console.error("Error fetching trailer:", error);
            setTrailerKey("");
        }
    };

    const openMovieDetails = (movie) => {
        setSelectedMovie(movie);
        fetchTrailer(movie.id);
    };

    const closeModal = () => {
        setSelectedMovie(null);
        setTrailerKey("");
    };

    const handleUserRating = (movieId, rating) => {
        const newRatings = { ...userRatings, [movieId]: rating };
        setUserRatings(newRatings);
        localStorage.setItem("userRatings", JSON.stringify(newRatings));
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <h1>Movie Listing</h1>

            {/* Filters */}
            <div style={{ marginBottom: "20px" }}>
                <label>Category: </label>
                <select onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">All</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>

                <label style={{ marginLeft: "10px" }}>Min Rating: </label>
                <input 
                    type="number" 
                    min="0" 
                    max="10" 
                    step="0.1" 
                    value={minRating} 
                    onChange={(e) => setMinRating(e.target.value)} 
                />

                <label style={{ marginLeft: "10px" }}>Release Year: </label>
                <input 
                    type="text" 
                    placeholder="e.g., 2020" 
                    value={releaseYear} 
                    onChange={(e) => setReleaseYear(e.target.value)} 
                />
            </div>

            {/* Movie List */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {filteredMovies.length > 0 ? (
                    filteredMovies.map((movie) => (
                        <div key={movie.id} style={{ width: "200px", textAlign: "center", cursor: "pointer" }} onClick={() => openMovieDetails(movie)}>
                            <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title} width="100%" />
                            <h3>{movie.title}</h3>
                            <p>⭐ {movie.vote_average} | 📅 {movie.release_date}</p>
                            <p>📊 User Rating: {userRatings[movie.id] || "Not rated"}</p>
                        </div>
                    ))
                ) : (
                    <p>No movies found.</p>
                )}
            </div>

            {/* Movie Details Modal */}
            {selectedMovie && (
                <div 
                    style={{ 
                        position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", 
                        display: "flex", alignItems: "center", justifyContent: "center", color: "white" 
                    }}
                >
                    <div style={{ background: "#222", padding: "20px", borderRadius: "10px", width: "80%", maxWidth: "600px" }}>
                        <h2>{selectedMovie.title}</h2>
                        <p>{selectedMovie.overview}</p>
                        <p>⭐ {selectedMovie.vote_average} | 📅 {selectedMovie.release_date}</p>

                        {/* User Rating */}
                        <label>Rate this movie: </label>
                        <input 
                            type="number" 
                            min="1" 
                            max="10" 
                            value={userRatings[selectedMovie.id] || ""} 
                            onChange={(e) => handleUserRating(selectedMovie.id, e.target.value)} 
                        />

                        {trailerKey ? (
                            <iframe 
                                width="100%" height="315" 
                                src={`https://www.youtube.com/embed/${trailerKey}`} 
                                title="Movie Trailer" 
                                frameBorder="0" 
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <p>No trailer available.</p>
                        )}

                        <button 
                            style={{ marginTop: "10px", padding: "10px", background: "red", color: "white", border: "none", cursor: "pointer" }} 
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;





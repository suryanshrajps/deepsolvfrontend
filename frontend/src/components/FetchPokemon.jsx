import React, { useState, useEffect } from 'react';  
import axios from 'axios';  
import './FetchPokemon.css';  
import './details.css'; // New CSS for detail view styling  

const FetchPokemon = () => {  
    const [pokemonList, setPokemonList] = useState([]);  
    const [filteredPokemon, setFilteredPokemon] = useState([]);  
    const [loading, setLoading] = useState(false);  
    const [error, setError] = useState(null);  
    const [search, setSearch] = useState('');  
    const [selectedType, setSelectedType] = useState('');  
    const [page, setPage] = useState(1);  
    const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);  
    const [selectedPokemon, setSelectedPokemon] = useState(null);  
    const [detailViewActive, setDetailViewActive] = useState(false);  

    const ITEMS_PER_PAGE = 20;  
    const API_BASE_URL = 'https://pokeapi.co/api/v2';  

    useEffect(() => {  
        const fetchData = async () => {  
            setLoading(true);  
            setError(null);  

            try {  
                const offset = (page - 1) * ITEMS_PER_PAGE;  
                const response = await axios.get(`${API_BASE_URL}/pokemon?offset=${offset}&limit=${ITEMS_PER_PAGE}`);  

                const detailedData = await Promise.all(  
                    response.data.results.map(async (pokemon) => {  
                        const details = await axios.get(pokemon.url);  
                        return {  
                            id: details.data.id,  
                            name: pokemon.name,  
                            image: details.data.sprites.front_default,  
                            types: details.data.types.map((type) => type.type.name),  
                            stats: details.data.stats,  
                            abilities: details.data.abilities,  
                            height: details.data.height, // Height in decimeters  
                            weight: details.data.weight, // Weight in hectograms  
                        };  
                    })  
                );  

                setPokemonList(detailedData);  
                setFilteredPokemon(detailedData);  
            } catch (err) {  
                setError('Failed to fetch Pokémon data.');  
            } finally {  
                setLoading(false);  
            }  
        };  

        fetchData();  
    }, [page]);  

    useEffect(() => {  
        localStorage.setItem('favorites', JSON.stringify(favorites));  
    }, [favorites]);  

    const handleSearch = (event) => {  
        setSearch(event.target.value);  
        filterPokemon(event.target.value, selectedType);  
    };  

    const handleTypeFilter = (event) => {  
        setSelectedType(event.target.value);  
        filterPokemon(search, event.target.value);  
    };  

    const filterPokemon = (searchTerm, typeFilter) => {  
        let filtered = pokemonList;  

        if (searchTerm) {  
            filtered = filtered.filter((pokemon) => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()));  
        }  

        if (typeFilter) {  
            filtered = filtered.filter((pokemon) => pokemon.types.includes(typeFilter));  
        }  

        setFilteredPokemon(filtered);  
    };  

    const toggleFavorite = (pokemon) => {  
        const isFavorited = favorites.some((fav) => fav.id === pokemon.id);  

        if (isFavorited) {  
            setFavorites(favorites.filter((fav) => fav.id !== pokemon.id));  
        } else {  
            setFavorites([...favorites, pokemon]);  
        }  
    };  

    const openDetailView = (pokemon) => {  
        setSelectedPokemon(pokemon);  
        setTimeout(() => setDetailViewActive(true), 50);  
    };  

    const closeDetailView = () => {  
        setDetailViewActive(false);  
        setTimeout(() => setSelectedPokemon(null), 300);  
    };  

    return (  
        <div className="fetch-pokemon">  
            <header>  
                <h1>Pokémon List</h1>  
                <div className="filters">  
                    <input  
                        type="text"  
                        placeholder="Search Pokémon..."  
                        value={search}  
                        onChange={handleSearch}  
                    />  
                    <select value={selectedType} onChange={handleTypeFilter}>  
                        <option value="">All Types</option>  
                        <option value="fire">Fire</option>  
                        <option value="water">Water</option>  
                        <option value="grass">Grass</option>  
                        <option value="electric">Electric</option>  
                        {/* Add more types as needed */}  
                    </select>  
                </div>  
            </header>  

            {loading && <p>Loading...</p>}  
            {error && <p>{error}</p>}  

            <div className="pokemon-grid">  
                {filteredPokemon.map((pokemon) => (  
                    <div key={pokemon.id} className="pokemon-card" style={{ animationDelay: `${pokemon.id * 50}ms` }}>  
                        <img src={pokemon.image} alt={pokemon.name} />  
                        <h3>{pokemon.name}</h3>  
                        <p>Type: {pokemon.types.join(', ')}</p>  
                        <button onClick={() => toggleFavorite(pokemon)}>  
                            {favorites.some((fav) => fav.id === pokemon.id) ? 'Unfavorite' : 'Favorite'}  
                        </button>  
                        <button onClick={() => openDetailView(pokemon)}>View Details</button>  
                    </div>  
                ))}  
            </div>  

            <div className="pagination">  
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>  
                    Previous  
                </button>  
                <button onClick={() => setPage(page + 1)}>Next</button>  
            </div>  

            {selectedPokemon && (  
                <div className={`pokemon-detail ${detailViewActive ? 'active' : ''}`}>  
                    <div className="detail-content">  
                        <button className="close-btn" onClick={closeDetailView}>X</button>  
                        <div className="pokemon-info">  
                            <img src={selectedPokemon.image} alt={selectedPokemon.name} className="pokemon-image" />  
                            <div className="info">  
                                <h2 className="pokemon-name">{selectedPokemon.name}</h2>  
                                <p className="pokemon-type">{selectedPokemon.types.join(', ')}</p>  
                                <p className="pokemon-number">#{selectedPokemon.id}</p>  
                                <p><strong>Height:</strong> {selectedPokemon.height / 10} m</p>  
                                <p><strong>Weight:</strong> {selectedPokemon.weight / 10} kg</p>  
                                <p><strong>Abilities:</strong> {selectedPokemon.abilities.map(a => a.ability.name).join(', ')}</p>  
                            </div>  
                        </div>  
                        <h3>Stats</h3>  
                        <div className="stats">  
                            {selectedPokemon.stats.map(stat => (  
                                <div key={stat.stat.name} className="stat">  
                                    <span>{stat.stat.name}</span>  
                                    <div className="progress-bar">  
                                        <div  
                                            className="progress"  
                                            style={{ width: `${stat.base_stat / 2}%` }} // Adjust bar length based on stat value  
                                        ></div>  
                                    </div>  
                                    <span>{stat.base_stat}</span>  
                                </div>  
                            ))}  
                        </div>  
                    </div>  
                </div>  
            )}  
        </div>  
    );  
};  

export default FetchPokemon;
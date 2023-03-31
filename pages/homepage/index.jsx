import Search from "../../components/search";
import React, { useCallback, useContext, useEffect, useReducer, useState, useMemo } from "react";
import './style.css';
import RecipeItem from "../../components/recipe-item";
import FavoriteItem from "../../components/favorite-item";
import { ThemeContext } from "../../App";

const dummydata = 'dummydata'

const reducer = (state, action) => {

    switch (action.type) {
        case 'filterFavorites':
            console.log(action);
            return {
                ...state,
                filteredValue: action.value,
            }

        default:
            return state
    }
}

const initalState = {
    filteredValue: ''
}

const Homepage = () => {
    //loading state

    const [loadingState, setLoadingState] = useState(false)

    //save result that we recieved from api

    const [recipes, setRecipes] = useState([])

    //favourites data state
    const [apiCalledSuccess, setApiCalledSuccess] = useState(false)

    //state for api is successful or not

    const [favorites, setFavourites] = useState([])

    //use reducer function

    const [filteredState, dispatch] = useReducer(reducer, initalState)
    const { theme } = useContext(ThemeContext)


    const getDataFromSearchComponent = (getData) => {

        // kepp loading state as true before calling api
        setLoadingState(true);

        //calling the api

        async function getRecipes() {
            const apiResponse = await fetch(`https://api.spoonacular.com/recipes/complexSearch?apiKey=2ae0ba28396a41cb9ba12ac2fe65ca83&query=${getData}`);
            const result = await apiResponse.json();
            const { results } = result;

            if (results && results.length > 0) {
                //set loading state as false again
                //set recipes state

                setLoadingState(false)
                setRecipes(results)
                setApiCalledSuccess(true)
            }

        }

        getRecipes()
    };

    const addToFavorites = useCallback((getCurrentRecipeItem)=>{
        let cpyFavorites = [...favorites];

        const index = cpyFavorites.findIndex(item => item.id === getCurrentRecipeItem.id)
        if (index === -1) {
            cpyFavorites.push(getCurrentRecipeItem)
            setFavourites(cpyFavorites)

            //save the favorites in local storage

            localStorage.setItem('favorites', JSON.stringify(cpyFavorites))
            window.scrollTo({top : '0', behavior : 'smooth'})
        } else {
            alert('Item is already a favorite')
        }
    }, [favorites])


    const removeFromFavorites = (getCurrentId) => {

        let cpyFavorites = [...favorites]
        cpyFavorites = cpyFavorites.filter(item => item.id !== getCurrentId)

        setFavourites(cpyFavorites)
        localStorage.setItem("favorites", JSON.stringify(cpyFavorites))
    }


    useEffect(() => {
        const extractFavoritesFromLocalStorageOnPageLoad = JSON.parse(localStorage.getItem('favorites')) || []
        setFavourites(extractFavoritesFromLocalStorageOnPageLoad)
    }, [])

    console.log(filteredState, 'filteredState')

    //filter favorites

    const filteredFavouritesItems = favorites.length > 0 ? favorites.filter((item) =>
        item.title.toLowerCase().includes(filteredState.filteredValue)
    ) : [];

    const renderRecipes = useCallback(() => {

        if (recipes && recipes.length > 0) {
            return (
                recipes.map((item) => (
                    <RecipeItem
                        addToFavorites={() => addToFavorites(item)}
                        id={item.id}
                        image={item.image}
                        title={item.title}
                    />
                ))
            )
        }
    }, [recipes, addToFavorites])

    return (
        <div className="homepage">
            <Search getDataFromSearchComponent={getDataFromSearchComponent}
                dummydata={dummydata}
                apiCalledSuccess={apiCalledSuccess}
                setApiCalledSuccess={setApiCalledSuccess}

            />

            {/*show favotite items*/}

            <div className="favorites-wrapper">

                <h1 style={theme ? { color: "#12343b" } : {}} className="favourites-title"> Favourites</h1>

                <div className="search-favorites">

                    <input
                        onChange={(event) =>
                            dispatch({ type: 'filterFavorites', value: event.target.value })}
                        value={filteredState.filteredValue}
                        name="searchfavorites" placeholder="Search Favorites" />

                </div>

                <div className="favorites">
                {
                    !filteredFavouritesItems.length && 
                    <div style={{display : 'flex', justifyContent : 'center', width : '100%'}} className="no-items">No Favorites Chosen Yet</div>
                }
                    {filteredFavouritesItems && filteredFavouritesItems.length > 0
                        ? filteredFavouritesItems.map(item => (
                            <FavoriteItem
                                removeFromFavorites={() => removeFromFavorites(item.id)}
                                id={item.id}
                                image={item.image}
                                title={item.title}
                            />
                        ))
                        : null}
                </div>
            </div>


            {/*show loading state */}

            {
                loadingState && <div className="loading">Loading recipes, Please wait!</div>
            }

            {/*show loading state */}


            {/*map through all the recipes*/}

            <div className="items">

                {/*
                    renderRecipes()
                */}

                {
                    useMemo(()=>(

                      !loadingState && recipes && recipes.length > 0 ? 
                      recipes.map((item) => (
                            <RecipeItem
                                addToFavorites={() => addToFavorites(item)}
                                id={item.id}
                                image={item.image}
                                title={item.title}
                            />
                        )) : null

                    ), [loadingState, recipes, addToFavorites])
                }

                {/*
                    recipes && recipes.length > 0 ?
                        recipes.map((item) => (
                            <RecipeItem
                                addToFavorites={() => addToFavorites(item)}
                                id={item.id}
                                image={item.image}
                                title={item.title}
                            />
                        )) : null
                */}
            </div>

            {/*map through all the recipes*/}


            {
                !loadingState && !recipes.length && 
                <div className="no-items">No Recipe Was Found</div>
            }


        </div>
    );
};

export default Homepage;
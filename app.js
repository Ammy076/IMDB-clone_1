const OMDB_API_URL = 'http://www.omdbapi.com/?apikey=YOUR_API_KEY&';

const searchForm = document.querySelector('form');
const searchBox = document.querySelector('#search-box');
const searchType = document.querySelector('#search-type');
const resultsDiv = document.querySelector('#results');
const realtimeSearchDiv = document.querySelector('#realtime-search');

function checkSearchType(value) {
	const obj = {};

	switch (value) {
		case 'titles':
			obj.param = 't';
			obj.type = 'm';
			break;
		case 'episode':
			obj.param = 't';
			obj.type = 'episode';
			break;
		case 'series':
			obj.param = 't';
			obj.type = 'series';
			break;
		case 'imdbs':
			obj.param = 'i';
			obj.type = '';
			break;
		default:
			obj.param = 's';
			obj.type = '';
	}

	return obj;
}

function buildURL() {
	const params = checkSearchType(searchType.value);
	return `${OMDB_API_URL}${params.param}=${searchBox.value}&type=${params.type}`;
}

function buildRandomURL() {
	const randomID = `tt0${Math.floor(Math.random() * 1000000)}`;
	return `${OMDB_API_URL}i=${randomID}`;
}

function loadRandomMovieDropdown() {
	const randomMovieImg = document.querySelector('#random-movie-img');
	const randomMovieTitle = document.querySelector('#random-movie-title');
	const randomMovieRating = document.querySelector('#random-movie-rating');
	const RANDOM_URL = buildRandomURL();

	fetch(RANDOM_URL)
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
			throw new Error('Network response was not OK');
		})
		.then((resp) => {
			fetch(resp.Poster, { mode: 'cors' })
				.then((poster) => {
					if (poster.ok) {
						randomMovieImg.setAttribute('src', poster.url);
						randomMovieImg.setAttribute('alt', resp.Title);
					} else {
						randomMovieImg.alt = 'No Image!';
					}
				})
				.catch((errorPoster) => {
					randomMovieImg.alt = 'IMDb Restricted Image!';
					console.error(errorPoster);
				});

			randomMovieTitle.innerText = resp.Title;
			randomMovieTitle.setAttribute('title', resp.Title);
			randomMovieTitle.addEventListener('click', () => {
				startTheSearch(null, RANDOM_URL);
			});

			randomMovieRating.innerText = `IMDb rating: ${resp.imdbRating}/10 from ${resp.imdbVotes} IMDb user votes`;
			randomMovieRating.setAttribute('title', resp.Title);
			randomMovieRating.addEventListener('click', () => {
				startTheSearch(null, RANDOM_URL);
			});
		})
		.catch((err) => console.error('An error occurred:', err));
}

function createElement(elem, content, src) {
	const element = document.createElement(elem);

	if (elem === 'img') {
		element.setAttribute('src', src);
		element.setAttribute('alt', content);
		element.setAttribute('width', '200px');
		element.setAttribute('height', '300px');
	} else if (elem === 'div') {
		element.classList.add(content);
		if (src) {
			element.id = src;
		}
	} else {
		element.innerText = content;
	}

	return element;
}

function realtimeSearch(e) {
	const FULL_OMDB_URL = buildURL();

	fetch(FULL_OMDB_URL)
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
			throw new Error('Network response was not OK!');
		})
		.then((resp) => {
			if (resp.Response === 'True') {
				realtimeSearchDiv.innerText = '';
				realtimeSearchDiv.classList.remove('hidden');
				realtimeSearchDiv.classList.add('visible');

				realtimeSearchDiv.appendChild(createElement('h3', `Number of results: ${resp.totalResults}`));
			} else if (resp.Response === 'False') {
				realtimeSearchDiv.classList.add('hidden');
				realtimeSearchDiv.classList.remove('visible');
			}
		})
		.catch((err) => console.error(`Event ${e} caused an error`, err));
}

function startTheSearch(e, value) {
	if (e) {
		e.preventDefault();
	}

	const FULL_OMDB_URL = value || buildURL();

	fetch(FULL_OMDB_URL)
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
			throw new Error('Network response was not OK!');
		})
		.then((resp) => {
			if (resp.Response === 'True') {
				resultsDiv.innerText = '';
				resultsDiv.style.visibility = 'visible';

				realtimeSearchDiv.classList.add('hidden');
				realtimeSearchDiv.classList.remove('visible');
				realtimeSearchDiv.innerText = '';

				if (resp.totalResults) {
					resultsDiv.appendChild(createElement('h3', `Number of results: ${resp.totalResults}`));
				}

				resultsDiv.appendChild(createElement('div', 'movie-results'));
				const movieResults = document.querySelector('.movie-results');

				if (resp.Search) {
					let i = 0;
					resp.Search.forEach((movie) => {
						movieResults.appendChild(createElement('div', 'movie-result', `movie-result-${i}`));
						const movieResult = document.querySelector(`#movie-result-${i}`);
						movieResult.appendChild(createElement('img', movie.Title, movie.Poster));
						movieResult.appendChild(createElement('p', movie.Title));
						i += 1;
					});
				} else {
					movieResults.appendChild(createElement('div', 'movie-result', 'movie-result'));
					const movieResult = document.querySelector('#movie-result');
					movieResult.appendChild(createElement('img', resp.Title, resp.Poster));
					movieResult.appendChild(createElement('p', resp.Title));
				}
			}
		})
		.catch((err) => console.error(err));
}

searchBox.addEventListener('input', realtimeSearch);
searchForm.addEventListener('submit', startTheSearch);
document.addEventListener('DOMContentLoaded', loadRandomMovieDropdown);

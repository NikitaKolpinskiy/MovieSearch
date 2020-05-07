const movieSlides                     = document.querySelector('#movie-slides');
const bullets                         = document.querySelector('#slide-bullets');
const bullet                          = document.querySelector('#bullet').cloneNode();
const searchPanel                     = document.querySelector('#search-panel');
const searchButton                    = document.querySelector('#search-button');
const invalidRequest                  = document.querySelector('#invalid-request');
const clearField                      = document.querySelector('#clear-field');
const movieCardContainerTemplate      = document.querySelector('#movieCardContainerTemplate');
const movieCardTemplate               = document.querySelector('#movieCardTemplate');
const busyIndicator                   = document.querySelector('#busyIndicator');

const urlApi                          = 'https://www.omdbapi.com/';
const keyApi                          = 'apikey=841a117d';
const searchApi                       = 's=';
const idApi                           = 'i=';    
const errorText                       = 'No results for';

let slideIndex = 1; 


body.addEventListener('keydown', (e) => {

})

bullets.addEventListener('click', (e) => {
    e.stopPropagation();
    currentSlide(e.target);
})


searchButton.addEventListener('click', (e)=> {
    e.preventDefault();
    searchMovie();
})

clearField.addEventListener('click', (e) => {
    searchPanel.value = '';
    invalidRequest.firstElementChild.innerText = '';
})

function sendRequest(method, url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open(method, url);
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.status >= 400) {
                reject(xhr.response)
                
            } else {
                resolve(xhr.response)
            }
            
            xhr.onerror = () => {
                reject(xhr.response)
            }  
        }  
        xhr.send()  
    })
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(target) {
    showSlides(slideIndex = getElementIndex(target) + 1);
}
  
function showSlides(n) {
    const bulletsArray  = [...bullets.children];
    const movieCards    = [...movieSlides.children];

    if (n > movieCards.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = movieCards.length}

    movieCards.forEach((e) => {
        e.classList.remove('flex');
        e.classList.add('hidden');
    })

    for (let i = 0; i < bulletsArray.length; i++) {
        bulletsArray[i].classList.remove('slider-bullet_active');
    }

    movieCards[slideIndex - 1].classList.add('flex') 
    bulletsArray[slideIndex - 1].classList.add('slider-bullet_active');
}

function searchMovie() {
    showBusyIndicator();
    sendRequest('GET', `${urlApi}?${keyApi}&${searchApi}${searchPanel.value}`)
        .then(data => {
            if(!data.Search) {
                throw new Error(data.Error)
            } else {
                return Promise.all(
                  data.Search.map((movie) => sendRequest('GET',`${urlApi}?${keyApi}&${idApi}${movie.imdbID}`))
                )
            } 
        })
        .then(data => {
            let movieCardContainerTemplateClone = movieCardContainerTemplate.cloneNode();
            invalidRequest.firstElementChild.innerText = '';
            movieSlides.innerHTML = '';
            bullets.innerHTML = '';
            data.forEach((movie, index, arr) => {
                let movieCardClone = movieCardTemplate.cloneNode(true);
                movieCardClone.querySelector('.movie-title').innerText = movie.Title;
                movieCardClone.querySelector('.movie-container-image').src = movie.Poster;
                movieCardClone.querySelector('.movie-year').innerText = movie.Year;
                movieCardClone.querySelector('.movie-rate').lastElementChild.innerText = movie.imdbRating;
                movieCardContainerTemplateClone.appendChild(movieCardClone);
                if (index && (index + 1) % 3 === 0 || index === arr.length - 1) {
                    bullets.appendChild(bullet.cloneNode());
                    movieSlides.appendChild(movieCardContainerTemplateClone);
                    movieCardContainerTemplateClone = movieCardContainerTemplate.cloneNode();
                }
            })
            bullets.firstElementChild.classList.add('slider-bullet_active');   
            hideBusyIndicator();      
        })
        .catch(e => {
            hideBusyIndicator(); 
            console.error(e);
            invalidRequest.firstElementChild.innerText = `${errorText} ${searchPanel.value}`
        })

}

function getElementIndex(elem) {
    let i = 0;
    while((elem = elem.previousElementSibling) != null) ++i;
    return i;
}

function showBusyIndicator() {
    busyIndicator.classList.add('flex')
}

function hideBusyIndicator() {
    busyIndicator.classList.remove('flex')
}

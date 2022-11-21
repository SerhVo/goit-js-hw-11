import axios from 'axios';
import { Notify } from 'notiflix';
import { Spinner } from 'spin.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

axios.defaults.baseURL = 'https://pixabay.com/api/';

const refs = {
  // list: document.querySelector('.js-gallery'),
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.js-more'),
  backdrop: document.querySelector('.js-backdrop'),
  spiner: document.querySelector('#spiner'),
  btnLoad: document.querySelector('.load-more'),
};

class PixabayApi {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '31445682-be1580fcfd9d640b0fdf19e0d';
  #page = 1;
  #totalPhotos = 0;
  #searchQuery = '';
  #per_page = 1;
  // #searchParams = new URLSearchParams({
  //   key: this.#API_KEY,
  //   q: this.#searchQuery,
  //   image_type: 'photo',
  //   safesearch: true,
  //   orientation: 'horizontal',
  // });

  async getPhotos() {
    const url = `${this.#BASE_URL}?key=${this.#API_KEY}&q=${
      this.#searchQuery
    }&image_type=photo&orientation=horizontal&
    safesearch=true&page=${this.page}&per_page=40`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.status);
    }
    return await response.json();
  }

  get searchQuery() {
    return this.#searchQuery;
  }
  set searchQuery(newSearchQuery) {
    this.#searchQuery = newSearchQuery;
  }
  incrementPage() {
    this.#page += 1;
  }
  resetPage() {
    this.#page = 1;
  }
  setTotal(newTotal) {
    this.#totalPhotos = newTotal;
  }

  hasMorePhotos() {
    return this.#page < Math.ceil(this.#totalPhotos / this.#per_page);
  }
}
const pixabay = new PixabayApi();

const handleSubmit = event => {
  event.preventDefault();
  const {
    elements: { searchQuery },
  } = event.target;
  const searchString = searchQuery.value.trim();
  if (!searchString) {
    Notify.failure('Input query!!!');
    return;
  }
  if (pixabay.searchQuery === searchString) {
    Notify.info('Repeated request!');
  }
  pixabay.searchQuery = searchString;

  console.log(searchString);

  pixabay.getPhotos().then(({ total, hits }) => {
    console.log(hits);
    const markup = createMarkup(hits);
  });

  event.target.reset();
};

refs.form.addEventListener('submit', handleSubmit);
// refs.btnLoad.addEventListener('click', onLoadMore);

// function scrollingPage() {
//   const { height: cardHeight } = document
//     .querySelector('.gallery')
//     .firstElementChild.getBoundingClientRect();

//   window.scrollBy({
//     top: cardHeight * 2,
//     behavior: 'smooth',
//   });
// }

function createMarkup(photos) {
  const markup = photos
    .map(photo => {
      console.log(photo);
      return `<div class="photo-card">
  <a href="${photo.webformatURL}">
  <img class="image" src="${photo.largeImageURL}" alt="${photo.tags}" loading="lazy" width="200"/>
  </a>
  <div class="info">
    <p class="info-item">${photo.likes}
      <b>Likes</b>
    </p>
    <p class="info-item">${photo.views}
      <b>Views</b>
    </p>
    <p class="info-item">${photo.comments}
      <b>Comments</b>
    </p>
    <p class="info-item">${photo.downloads}
      <b>Downloads</b>
    </p>
  </div>
</div>`;
    })
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}
function cleanGallery() {
  gallery.innerHTML = '';
  page = 1;
}
function stopImages(photos) {
  if (photos.data.hits.length < 40) {
    btnLoad.style.display = 'none';
  }
}

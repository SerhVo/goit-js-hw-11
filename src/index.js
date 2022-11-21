import ImageApiService from './api-service';
import LoadMoreBtn from './load-more-btn';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('#search-form'),
  btnEl: document.querySelector('button'),
  gallery: document.querySelector('.gallery'),
};

const imageApiService = new ImageApiService();
const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

let totalPages = null;

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', fetchGallery);

async function onSearch(e) {
  e.preventDefault();

  if (e.currentTarget.elements.searchQuery.value.trim() === '') {
    return Notiflix.Notify.warning('Field cannot be emply');
  }

  imageApiService.query = e.currentTarget.elements.searchQuery.value;

  loadMoreBtn.show();
  loadMoreBtn.disable();
  imageApiService.resetPage();

  try {
    const images = await imageApiService.fetchImage();
    totalPages = images.totalPages;
    Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);
    clearGallery();
    renderGallery(images);
    loadMoreBtn.enable();
  } catch (error) {
    fetchError();
  }

  return totalPages;
}

async function fetchGallery() {
  loadMoreBtn.disable();

  try {
    imageApiService.incrementPage();
    const images = await imageApiService.fetchImage();
    totalPages = images.totalPages;
    renderGallery(images);
    loadMoreBtn.enable();

    if (imageApiService.page > totalPages) {
      loadMoreBtn.hide();
      return Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    fetchError();
  }
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function fetchError(error) {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function renderGallery({ images }) {
  const markUp = images
    .map(image => {
      return `
      <div class="photo-card">
      <a href="${image.largeImageURL}">
            <img src="${image.webformatURL}" class="image" alt="${image.tags}" loading="lazy" /></a>
            <div class="info">
                <p class="info-item">
                    Likes <b>${image.likes}</b>
                </p>
                <p class="info-item">
                    Views <b>${image.views}</b>
                </p>
                <p class="info-item">
                    Comments <b>${image.comments}</b>
                </p>
                <p class="info-item">
                    Downloads <b>${image.downloads}</b>
                </p>
            </div>        
        </div>`;
    })
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markUp);
}
function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

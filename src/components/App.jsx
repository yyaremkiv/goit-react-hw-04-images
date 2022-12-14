import { useState, useEffect } from 'react';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import NewsApiService from './services/image-api';
import { Searchbar } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { LoadMoreBtn } from './Button/Button';
import { Loader } from './Loader/Loader';
import { ImageGalleryItem } from './ImageGalleryItem/ImageGalleryItem';
import { Modal } from './Modal/Modal';
import { ErrorMessage } from './ErrorMessage/ErrorMessage';

const newsApiService = new NewsApiService();
const Status = {
  IDLE: 'idle',
  PENDING: 'pending',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export const App = () => {
  const perPage = 12;
  const [searchName, setSearchName] = useState('');
  const [imageGallery, setImageGallery] = useState([]);
  const [page, setPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(Status.IDLE);
  const [imageModal, setImageModal] = useState('');
  const [imageModalAlt, setImageModalAlt] = useState('');

  useEffect(() => {
    if (!searchName) {
      return;
    }

    setStatus(Status.PENDING);
    fetch();
    // eslint-disable-next-line
  }, [searchName, page]);

  async function fetch() {
    try {
      const response = await newsApiService.getResponse(
        searchName,
        page,
        perPage
      );

      const { total, hits } = response.data;

      if (total === 0) {
        setStatus(Status.IDLE);
        Notify.info(
          `Nothing was found for "${searchName}". Please try again by changing the search entry`
        );
        return;
      }

      if (!imageGallery.length) {
        setImageGallery(hits);
        setStatus(Status.RESOLVED);
        setTotalImages(total);
        return;
      }

      if (imageGallery.length) {
        setImageGallery(prevState => [...prevState, ...hits]);
        setStatus(Status.RESOLVED);
        setTotalImages(total);
        return;
      }
    } catch (error) {
      setError(Status.REJECTED);
      return;
    }
  }

  const handleLoadMore = () => {
    setPage(prevState => prevState + 1);
  };

  const changePage = () => {
    setPage(1);
  };

  const onSubmitForm = searchName => {
    setSearchName(searchName);
    setImageGallery([]);
  };

  const openModal = e => {
    setImageModal(e.target.dataset.url);
    setImageModalAlt(e.target.alt);
  };

  const closeModal = () => {
    setImageModal(null);
  };

  const visibleLoadMoreButton =
    totalImages > page * perPage && status === 'resolved';

  return (
    <>
      <Searchbar
        onSubmit={onSubmitForm}
        prevSearchName={searchName}
        changePage={changePage}
      />
      <ImageGallery>
        {imageGallery && (
          <ImageGalleryItem imageGallery={imageGallery} onClick={openModal} />
        )}
      </ImageGallery>

      {status === 'pending' && <Loader />}

      {visibleLoadMoreButton && <LoadMoreBtn onClick={handleLoadMore} />}

      {imageModal && (
        <Modal url={imageModal} alt={imageModalAlt} onCloseModal={closeModal} />
      )}

      {status === 'rejected' && <ErrorMessage onError={error} />}
    </>
  );
};

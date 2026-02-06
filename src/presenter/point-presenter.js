import RoutePointView from '../view/route-point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { replace, remove, render } from '../framework/render.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  FAVOURITES: 'EDITING',
};

export default class PointPresenter {
  #pointListContainer = null;
  #pointComponent = null;
  #pointEditComponent = null;
  #point = null;
  #destination = null;
  #offers = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #mode = Mode.DEFAULT;

  constructor({ pointListContainer, onDataChange, onModeChange }) {
    this.#pointListContainer = pointListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point, destination, offers) {
    const prevTaskEditComponent = this.#pointEditComponent;
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers;

    this.#pointComponent = new RoutePointView({
      point: this.#point,
      destination: this.#destination,
      offers: this.#offers,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#pointEditComponent = new EditFormView({
      point: this.#point,
      destination: this.#destination,
      offers: this.#offers,
      onFormSubmit: this.#handleFormSubmit,
    });

    if (this.#mode === Mode.DEFAULT) {
      render(this.#pointComponent, this.#pointListContainer);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointEditComponent, prevTaskEditComponent);
    }

    remove(prevTaskEditComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToPoint();
    }
  }

  #replacePointToForm() {
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  };

  #handleFavoriteClick = () => {
    const newIsFavorite = !this.#point.isFavorite;
    this.#point.isFavorite = newIsFavorite;
    this.#handleDataChange({ ...this.#point, isFavorite: newIsFavorite });

    const newPointComponent = new RoutePointView({
      point: this.#point,
      destination: this.#destination,
      offers: this.#offers,
      onEditClick: this.#handleEditClick.bind(this),
      onFavoriteClick: this.#handleFavoriteClick.bind(this),
    });

    replace(newPointComponent, this.#pointComponent);
    this.#pointComponent = newPointComponent;
  };

  #handleEditClick = () => {
    this.#replacePointToForm();
  };

  #handleFormSubmit = (point) => {
    this.#handleDataChange(point);
    this.#replaceFormToPoint();
  };
}

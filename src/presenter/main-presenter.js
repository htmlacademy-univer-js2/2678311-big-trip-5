import TripInfoView from '../view/trip-info-view.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import PointPresenter from './point-presenter.js';
import { render, RenderPosition } from '../framework/render.js';

export default class MainPresenter {
  #tripModel = null;
  #pointListComponent = new PointListView();
  #tripInfoComponent = new TripInfoView();
  #filtersComponent = new FiltersView();
  #sortComponent = new SortView();
  #pointPresenters = new Map();
  #mainPoint = [];

  constructor(tripModel) {
    this.tripMainContainer = document.querySelector('.trip-main');
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.tripEventsContainer = document.querySelector('.trip-events');

    this.#tripModel = tripModel;
  }

  init() {
    const { points, destination, offers } = this.#tripModel;

    this.#renderTripInfo();
    this.#renderFilters();
    this.#renderSort();
    this.#renderPointList();

    points.forEach((point) => {
      this.#renderPoint(point, destination, offers);
    });
  }

  #renderSort() {
    render(this.#sortComponent, this.tripEventsContainer, RenderPosition.AFTERBEGIN);
  }

  #renderTripInfo() {
    render(this.#tripInfoComponent, this.tripMainContainer, RenderPosition.AFTERBEGIN);
  }

  #renderFilters() {
    render(this.#filtersComponent, this.filtersContainer);
  }

  #renderPointList() {
    render(this.#pointListComponent, this.tripEventsContainer);
  }

  #renderPoint(point, destination, offers) {

    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointListComponent.element,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange,
      destination,
      offers
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #handlePointChange = (updatedPoint) => {
    if (!updatedPoint || !updatedPoint.id) {
      return;
    }
    const index = this.#tripModel.points.findIndex((point) => point && point.id === updatedPoint.id);
    this.#tripModel.points[index] = updatedPoint;
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };
}

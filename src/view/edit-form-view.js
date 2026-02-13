import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';

function createTypeSelector(currentType) {
  const types = [
    'Taxi', 'Bus', 'Train', 'Ship', 'Drive',
    'Flight', 'Check-in', 'Sightseeing', 'Restaurant'
  ];

  return types.map((type) => {
    const lowerType = type.toLowerCase().replace('-', '');
    const isChecked = type === currentType;
    return `
      <div class="event__type-item">
        <input
          id="event-type-${lowerType}-1"
          class="event__type-input visually-hidden"
          type="radio"
          name="event-type"
          value="${lowerType}"
          ${isChecked ? 'checked' : ''}
        >
        <label class="event__type-label event__type-label--${lowerType}" for="event-type-${lowerType}-1">
          ${type}
        </label>
      </div>
    `;
  }).join('');
}

function createDestinationsList(destinations) {
  return destinations.map((d) => `<option value="${d.name}">`).join('');
}

function findDestinationByName(destinations, name) {
  return destinations.find((d) => d.name === name) || destinations[0] || null;
}

function createOffersList(offersByType, pointType, selectedOfferIds) {
  const offers = offersByType[pointType] || [];
  return offers.map((offer) => {
    const isChecked = selectedOfferIds.includes(offer.id);
    return `
      <div class="event__offer-selector">
        <input
          class="event__offer-checkbox visually-hidden"
          id="offer-${offer.id}"
          type="checkbox"
          name="offer-${offer.id}"
          ${isChecked ? 'checked' : ''}
        >
        <label class="event__offer-label" for="offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `;
  }).join('');
}

function formatDateTime(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function createEditFormTemplate(state) {
  const { point, destination, offers } = state;
  const isCreating = !point;

  const currentType = isCreating ? 'Flight' : point.type;
  const typeSelector = createTypeSelector(currentType);

  const destinationsList = createDestinationsList(destination);

  const selectedDest = isCreating
    ? destination[0] || null
    : destination.find((d) => d.id === point.destinationId) || destination[0] || null;

  const selectedDestName = selectedDest ? selectedDest.name : '';
  const description = selectedDest ? selectedDest.description : '';
  // const pictures = selectedDest ? selectedDest.pictures || [] : [];

  const now = new Date();
  const startTime = isCreating
    ? formatDateTime(now)
    : formatDateTime(point.startTime);
  const endTime = isCreating
    ? formatDateTime(new Date(now.getTime() + 2 * 60 * 60 * 1000))
    : formatDateTime(point.endTime);

  const price = isCreating ? '' : point.basePrice;

  const selectedOffers = isCreating ? [] : (point.offers || []);
  const offersList = createOffersList(offers, currentType, selectedOffers);

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img
                class="event__type-icon"
                width="17"
                height="17"
                src="img/icons/${currentType.toLowerCase()}.png"
                alt="Event type icon"
              >
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${typeSelector}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${currentType}
            </label>
            <input
              class="event__input event__input--destination"
              id="event-destination-1"
              type="text"
              name="event-destination"
              value="${selectedDestName}"
              list="destination-list-1"
            >
            <datalist id="destination-list-1">
              ${destinationsList}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-1"
              type="text"
              name="event-start-time"
              value="${startTime}"
            >
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-1"
              type="text"
              name="event-end-time"
              value="${endTime}"
            >
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-1"
              type="text"
              name="event-price"
              value="${price}"
            >
          </div>
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${isCreating ? 'Cancel' : 'Delete'}</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offersList}
            </div>
          </section>
          <section class="event__section event__section--destination">
            <h3 class="event__section-title event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${description}</p>
            ${(selectedDest?.pictures || []).map((pictureUrl) => `
              <div class="event__photo-wrapper">
                <img class="event__photo" src="${pictureUrl}" alt="Destination photo">
              </div>
            `).join('')}
          </section>
        </section>
      </form>
    </li>
  `;
}

export default class EditFormView extends AbstractStatefulView {
  #handleFormSubmit = null;
  #handleFormClose = null;

  constructor({ point, destination, offers, onFormSubmit, onFormClose }) {
    super();
    this._setState({ point, destination, offers });
    this.#handleFormSubmit = onFormSubmit;
    this.#handleFormClose = onFormClose;

    this._restoreHandlers();
  }

  get template() {
    return createEditFormTemplate(this._state);
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#formCloseHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__available-offers').addEventListener('change', this.#offerChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);
  }

  reset(point) {
    this.updateElement({
      point: { ...point }
    });
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(this._state.point);
  };

  #formCloseHandler = () => {
    this.#handleFormClose();
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();

    this.updateElement({
      point: {
        ...this._state.point,
        type: evt.target.value,
        offers: []
      }
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const newDestination = findDestinationByName(this._state.destination, evt.target.value);

    if (newDestination) {
      this.updateElement({
        point: {
          ...this._state.point,
          destinationId: newDestination.id
        }
      });
    }
  };

  #offerChangeHandler = (evt) => {
    evt.preventDefault();
    const offerId = evt.target.id.replace('offer-', '');

    const currentOffers = this._state.point?.offers || [];
    const newOffers = evt.target.checked
      ? [...currentOffers, offerId]
      : currentOffers.filter((id) => id !== offerId);

    this.updateElement({
      point: {
        ...this._state.point,
        offers: newOffers
      }
    });
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      point: {
        ...this._state.point,
        basePrice: evt.target.value
      }
    });
  };
}

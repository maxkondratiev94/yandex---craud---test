export default class Slider {
    constructor(container, options = {}) {
        this.container = container; // Контейнер, в котором находится слайдер
        this.options = options; // Опции, передаваемые при инициализации слайдера
        this.initialized = false; // Флаг для предотвращения повторной инициализации
        this.autoPlayTimer = null; // Таймер для автоматического воспроизведения слайдов
    }

    // Приватные поля
    #maxWidthPercent = 100; // Максимальная ширина слайда в процентах
    #defaultSholdPart = 0.25; // Порог переключения слайда (25% от ширины слайда)
    #startElementIndex = 0; // Индекс начального слайда
    #draggingBoolean = false; // Флаг для отслеживания состояния перетаскивания
    #startCoordX = 0; // Начальная координата X для перетаскивания
    #currentTranslate = 0; // Текущее значение смещения трека слайдов
    #prevTranslate = 0; // Предыдущее значение смещения трека слайдов
    #animationID = 0; // Идентификатор анимации (для отмены анимации)

    init() {
        if (this.initialized) return; // Если слайдер уже инициализирован, выходим из метода
        this.track = this.container.querySelector('.slider-track'); // Трек, на котором расположены слайды
        this.slides = Array.from(this.container.querySelectorAll('.slide')); // Массив слайдов
        this.prevButton = this.container.querySelector('.slider-button.prev'); // Кнопка "назад"
        this.nextButton = this.container.querySelector('.slider-button.next'); // Кнопка "вперед"
        this.counter = this.container.querySelector('.slider-counter'); // Элемент счетчика
        this.indicatorsContainer = this.container.querySelector('.slider-indicators'); // Контейнер для индикаторов

        // Настройки слайдера, передаваемые при инициализации
        this.slideCount = this.options.slideCount || 3; // Количество видимых слайдов
        this.autoPlay = this.options.autoPlay || false; // Автоматическое воспроизведение слайдов
        this.loop = this.options.loop || false; // Циклическое прокручивание
        this.autoPlayInterval = this.options.autoPlayInterval || 3000; // Интервал автоматического воспроизведения
        this.showIndicators = this.options.showIndicators !== undefined ? this.options.showIndicators : true; // Показ индикаторов

        // Устанавливаем начальные значения для переменных
        this.currentIndex = this.#startElementIndex; // Начальный индекс слайда
        this.dragging = this.#draggingBoolean; // Флаг состояния перетаскивания
        this.startX = this.#startCoordX; // Начальная координата X для перетаскивания
        this.currentTranslate = this.#currentTranslate; // Текущее значение translateX
        this.prevTranslate = this.#prevTranslate; // Предыдущее значение translateX
        this.animationID = this.#animationID; // Идентификатор анимации
        this.threshold = this.#defaultSholdPart; // Порог переключения слайда

        if (this.showIndicators) { 
            this.createIndicators(); // Создаем индикаторы, если включена опция
        }
        this.updateSlider(); // Обновляем слайдер
        this.addEventListeners(); // Добавляем слушатели событий

        if (this.autoPlay) {
            this.startAutoPlay(); // Запускаем автоматическое воспроизведение, если включена опция
        }

        this.initialized = true; // Устанавливаем флаг инициализации
    }

    createIndicators() {
        this.indicatorsContainer.innerHTML = ''; // Очищаем контейнер индикаторов
        this.slides.forEach((slide, index) => { 
            slide.style.flex = `0 0 ${this.#maxWidthPercent / this.slideCount}%`; // Устанавливаем ширину слайда в зависимости от количества слайдов
            const indicator = document.createElement('div'); // Создаем элемент индикатора
            indicator.classList.add('slider-indicator'); // Добавляем класс для стилизации индикатора
            if (index === this.currentIndex) {
                indicator.classList.add('active'); // Активируем индикатор для текущего слайда
            }
            indicator.addEventListener('click', () => { 
                this.currentIndex = index; // Устанавливаем текущий индекс при клике на индикатор
                this.updateSlider(); // Обновляем слайдер
            });
            this.indicatorsContainer.appendChild(indicator); // Добавляем индикатор в контейнер
        });
        this.indicators = Array.from(this.indicatorsContainer.querySelectorAll('.slider-indicator')); // Сохраняем массив индикаторов
    }

    updateSlider() {
        const trackWidth = this.track.clientWidth; // Получаем ширину трека слайдов
        const translateX = -this.currentIndex * (trackWidth / this.slideCount); // Рассчитываем значение translateX для текущего слайда
        this.track.style.transition = 'transform 0.3s ease-out'; // Устанавливаем плавный переход для анимации
        this.track.style.transform = `translateX(${translateX}px)`; // Применяем смещение к треку слайдов

        if (this.showIndicators) {
            this.indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === this.currentIndex); // Обновляем состояние индикаторов
            });
        }

        this.counter.textContent = `${this.currentIndex + 1} / ${this.slides.length}`; // Обновляем счетчик
    }

    goToNextSlide() {
        if (this.loop) {
            this.currentIndex = (this.currentIndex + 1) % this.slides.length; // Переходим к следующему слайду с циклическим повторением
        } else {
            this.currentIndex = Math.min(this.currentIndex + 1, this.slides.length - 1); // Переходим к следующему слайду без циклического повторения
        }
        this.updateSlider(); // Обновляем слайдер
    }

    goToPrevSlide() {
        if (this.loop) {
            this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length; // Переходим к предыдущему слайду с циклическим повторением
        } else {
            this.currentIndex = Math.max(this.currentIndex - 1, 0); // Переходим к предыдущему слайду без циклического повторения
        }
        this.updateSlider(); // Обновляем слайдер
    }

    addEventListeners() {
        this.prevButton.addEventListener('click', this.prevHandler = () => this.goToPrevSlide()); // Добавляем слушатель на кнопку "назад"
        this.nextButton.addEventListener('click', this.nextHandler = () => this.goToNextSlide()); // Добавляем слушатель на кнопку "вперед"
        window.addEventListener('resize', this.resizeHandler = () => this.updateSlider()); // Добавляем слушатель на событие изменения размера окна

        // Добавляем слушатели для перетаскивания и касания
        this.track.addEventListener('mousedown', this.dragStartHandler = (e) => this.onDragStart(e)); // Начало перетаскивания мышью
        this.track.addEventListener('touchstart', this.touchStartHandler = (e) => this.onDragStart(e), { passive: true }); // Начало касания на сенсорных устройствах
        window.addEventListener('mouseup', this.dragEndHandler = () => this.onDragEnd()); // Завершение перетаскивания мышью
        window.addEventListener('mousemove', this.dragMoveHandler = (e) => this.onDragMove(e)); // Перемещение мышью при перетаскивании
        window.addEventListener('touchend', this.touchEndHandler = () => this.onDragEnd()); // Завершение касания на сенсорных устройствах
        window.addEventListener('touchmove', this.touchMoveHandler = (e) => this.onDragMove(e)); // Перемещение при касании на сенсорных устройствах
    }

    startAutoPlay() {
        this.autoPlayTimer = setInterval(() => this.goToNextSlide(), this.autoPlayInterval); // Запускаем автоматическое воспроизведение слайдов
    }

    // Универсальный метод для начала перетаскивания или касания
    onDragStart(e) {
        this.track.style.transition = 'none'; // Отключаем анимацию во время перетаскивания
        this.isDragging = true; // Устанавливаем флаг перетаскивания
        this.startX = e.type === 'touchstart' ? e.touches[0].clientX : e.pageX; // Определяем начальную координату X
        this.prevTranslate = this.getTranslateX(); // Получаем текущее значение translateX
        this.currentTranslate = this.prevTranslate; // Устанавливаем текущее значение translateX
    }

    // Универсальный метод для перетаскивания или перемещения при касании
    onDragMove(e) {
        if (!this.isDragging) return; // Если не перетаскиваем, выходим из метода
        const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.pageX; // Определяем текущую координату X
        const deltaX = currentX - this.startX; // Рассчитываем смещение по X
        this.currentTranslate = this.prevTranslate + deltaX; // Вычисляем новое значение translateX
        this.track.style.transform = `translateX(${this.currentTranslate}px)`; // Применяем смещение к треку слайдов
    }

    // Метод для завершения перетаскивания или касания
    onDragEnd() {
        if (!this.isDragging) return; // Если не перетаскиваем, выходим из метода
        this.isDragging = false; // Сбрасываем флаг перетаскивания

        const trackWidth = this.track.clientWidth; // Получаем ширину трека слайдов
        const moveBy = this.currentTranslate - this.prevTranslate; // Вычисляем смещение трека
        const slideWidth = trackWidth / this.slides.length; // Вычисляем ширину одного слайда

        // Если перемещение больше порога, переключаем слайд
        if (moveBy > slideWidth * this.threshold) {
            this.goToPrevSlide(); // Переходим к предыдущему слайду
        } else if (moveBy < -slideWidth * this.threshold) {
            this.goToNextSlide(); // Переходим к следующему слайду
        } else {
            this.updateSlider(); // Возвращаем трек в исходное положение
        }
    }

    // Получаем текущее значение translateX
    getTranslateX() {
        const style = window.getComputedStyle(this.track); // Получаем стили трека
        const matrix = new WebKitCSSMatrix(style.transform); // Получаем матрицу трансформаций
        return matrix.m41; // Возвращаем значение translateX
    }

    destroy() {
        if (!this.initialized) return; // Если слайдер не инициализирован, выходим из метода

        // Удаляем все слушатели событий
        this.prevButton.removeEventListener('click', this.prevHandler);
        this.nextButton.removeEventListener('click', this.nextHandler);
        window.removeEventListener('resize', this.resizeHandler);

        // Удаляем слушатели для перетаскивания и касания
        this.track.removeEventListener('mousedown', this.dragStartHandler);
        this.track.removeEventListener('touchstart', this.touchStartHandler);
        window.removeEventListener('mouseup', this.dragEndHandler);
        window.removeEventListener('mousemove', this.dragMoveHandler);
        window.removeEventListener('touchend', this.touchEndHandler);
        window.removeEventListener('touchmove', this.touchMoveHandler);

        // Очищаем индикаторы
        if (this.showIndicators) {
            this.indicatorsContainer.innerHTML = '';
        }

        // Останавливаем автопрокрутку
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }

        // Сбрасываем позицию слайдера
        this.track.style.transform = '';

        this.initialized = false; // Сбрасываем флаг инициализации
    }
}

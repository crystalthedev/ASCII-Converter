![Optimization](https://img.shields.io/badge/Optimization-black?style=for-the-badge&labelColor=white&color=black)
- **Debouncing** - задержка обновления при изменении настроек
- **willReadFrequently** - оптимизация чтения canvas
- **requestAnimationFrame** - плавная обработка видео
- **Отключение обработки при паузе** - экономия ресурсов

![Algorithm](https://img.shields.io/badge/Algorithm-red?style=for-the-badge)
  - **1. Изображение делится на блоки (pixel size)
  - **2. Для каждого блока берется центральный пиксель
  - **3. Вычисляется яркость пикселя (luminance)
  - **4. Применяются контраст и яркость
  - **5. Выбирается **случайный символ** из набора
  - **6. Символ окрашивается в зависимости от режима:
   - **Mono**: переменная прозрачность
   - **Colored**: оригинальный цвет пикселя
   - **Greyscale**: оттенок серого

/**
 * Testimonials Section Component
 * Responsive testimonial carousel with cleaner data and corrected slide behavior.
 */

const testimonialsData = [
  {
    name: 'Ibu Rina',
    role: 'Pengelola Kantin SMPN 1',
    initials: 'R',
    tone: 'is-teal',
    result: 'Transaksi lebih ramai',
    text: 'Begitu tampilannya lebih jelas, siswa lebih cepat ikut dan pembelian di kantin ikut terdorong tanpa bikin kasir kewalahan.'
  },
  {
    name: 'Pak Adi',
    role: 'Koordinator Operasional SMAN 8',
    initials: 'A',
    tone: 'is-sky',
    result: 'Aktivasi lebih cepat',
    text: 'Semua komponen penting langsung terlihat, jadi tim kami cepat paham dan lebih yakin untuk lanjut aktivasi.'
  },
  {
    name: 'Ibu Sinta',
    role: 'Bendahara Koperasi Sekolah',
    initials: 'S',
    tone: 'is-mint',
    result: 'Mudah dibaca pimpinan',
    text: 'Dashboard terasa profesional dan informasinya padat. Tim kami bisa membaca performa promo tanpa penjelasan panjang.'
  },
  {
    name: 'Pak Damar',
    role: 'Pengelola Kantin SMKN 2',
    initials: 'D',
    tone: 'is-amber',
    result: 'Redeem lebih tertib',
    text: 'Proses scan sampai voucher dipakai jadi lebih tertib. Ini penting sekali saat jam istirahat dan antrian sedang ramai.'
  },
  {
    name: 'Ibu Mela',
    role: 'Admin Sekolah SDN 5',
    initials: 'M',
    tone: 'is-cyan',
    result: 'Lebih meyakinkan di mobile',
    text: 'Versi mobile lebih nyaman, jadi kepala sekolah tetap bisa melihat ringkasan dan cepat memberi keputusan tanpa membuka laptop.'
  },
  {
    name: 'Pak Faris',
    role: 'Penanggung Jawab Koperasi',
    initials: 'F',
    tone: 'is-slate',
    result: 'Lebih siap dipresentasikan',
    text: 'Alur aktivasi dan paket sekarang jauh lebih mudah dijelaskan. Kami jadi lebih percaya diri saat membawanya ke pihak sekolah.'
  }
];

const generateStars = () => Array.from({ length: 5 }, () => '<i class="fas fa-star"></i>').join('');

const getInitialItemsPerSlide = () => {
  if (typeof window === 'undefined') return 1;
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1180) return 2;
  return 3;
};

const generateTestimonialCard = (testimonial, index = 0) => `
  <article class="testimonial-card ${testimonial.tone} landing-fade" style="--fade-delay: ${160 + ((index % 3) * 70)}ms;">
    <div class="testimonial-card__top">
      <span class="testimonial-card__result">${testimonial.result}</span>
      <span class="testimonial-card__stars">${generateStars()}</span>
    </div>
    <p class="testimonial-card__quote">"${testimonial.text}"</p>
    <div class="testimonial-card__footer">
      <div class="testimonial-card__avatar">${testimonial.initials}</div>
      <div>
        <strong>${testimonial.name}</strong>
        <span>${testimonial.role}</span>
      </div>
    </div>
  </article>
`;

const generateSlides = (itemsPerSlide) => {
  const slides = [];

  for (let index = 0; index < testimonialsData.length; index += itemsPerSlide) {
    const items = testimonialsData.slice(index, index + itemsPerSlide);
    slides.push(`
      <div class="testimonial-slide">
        <div class="testimonial-grid">
          ${items.map((item, itemIndex) => generateTestimonialCard(item, index + itemIndex)).join('')}
        </div>
      </div>
    `);
  }

  return slides.join('');
};

const generateDots = (itemsPerSlide) => {
  const totalSlides = Math.ceil(testimonialsData.length / itemsPerSlide);
  let dotsHTML = '';

  for (let index = 0; index < totalSlides; index += 1) {
    dotsHTML += `
      <button
        class="testimonial-dot ${index === 0 ? 'active' : ''}"
        data-index="${index}"
        aria-label="Buka testimoni ${index + 1}"
      ></button>
    `;
  }

  return dotsHTML;
};

const TestimonialCarousel = {
  currentIndex: 0,
  itemsPerSlide: 1,
  autoPlayInterval: null,
  autoPlayDelay: 5500,
  isAnimating: false,
  isDragging: false,
  startX: 0,
  currentX: 0,
  dragThreshold: 50,

  init() {
    this.updateItemsPerSlide();
    this.bindEvents();
    this.bindTouchEvents();
    this.startAutoPlay();
    this.updateCarousel();

    window.addEventListener('resize', () => {
      const previous = this.itemsPerSlide;
      this.updateItemsPerSlide();

      if (previous !== this.itemsPerSlide) {
        this.regenerateSlides();
      }
    });
  },

  updateItemsPerSlide() {
    const width = window.innerWidth;

    if (width < 768) {
      this.itemsPerSlide = 1;
    } else if (width < 1180) {
      this.itemsPerSlide = 2;
    } else {
      this.itemsPerSlide = 3;
    }
  },

  getTotalSlides() {
    return Math.ceil(testimonialsData.length / this.itemsPerSlide);
  },

  regenerateSlides() {
    const track = document.getElementById('testimonial-track');
    const dotsContainer = document.getElementById('testimonial-dots');
    if (!track || !dotsContainer) return;

    track.innerHTML = generateSlides(this.itemsPerSlide);
    dotsContainer.innerHTML = generateDots(this.itemsPerSlide);
    this.currentIndex = Math.min(this.currentIndex, this.getTotalSlides() - 1);
    this.bindDots();
    this.updateCarousel();
  },

  bindDots() {
    document.querySelectorAll('.testimonial-dot').forEach((dot) => {
      dot.addEventListener('click', (event) => {
        const index = Number(event.currentTarget.dataset.index);
        this.goToSlide(index);
      });
    });
  },

  bindEvents() {
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    const carouselContainer = document.getElementById('testimonial-carousel');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prev());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.next());
    }

    this.bindDots();

    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
      carouselContainer.addEventListener('mouseleave', () => this.startAutoPlay());
    }
  },

  bindTouchEvents() {
    const carousel = document.getElementById('testimonial-carousel');
    const track = document.getElementById('testimonial-track');
    if (!carousel || !track) return;

    carousel.addEventListener('touchstart', (event) => this.handleTouchStart(event), { passive: true });
    carousel.addEventListener('touchmove', (event) => this.handleTouchMove(event), { passive: false });
    carousel.addEventListener('touchend', () => this.handleTouchEnd());

    carousel.addEventListener('mousedown', (event) => this.handleMouseDown(event));
    window.addEventListener('mousemove', (event) => this.handleMouseMove(event));
    window.addEventListener('mouseup', () => this.handleMouseUp());

    track.addEventListener('dragstart', (event) => event.preventDefault());
  },

  handleTouchStart(event) {
    this.startX = event.touches[0].clientX;
    this.currentX = this.startX;
    this.isDragging = true;
    this.stopAutoPlay();
  },

  handleTouchMove(event) {
    if (!this.isDragging) return;
    event.preventDefault();
    this.currentX = event.touches[0].clientX;
  },

  handleTouchEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const diff = this.startX - this.currentX;
    if (Math.abs(diff) > this.dragThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }

    this.startAutoPlay();
  },

  handleMouseDown(event) {
    this.startX = event.clientX;
    this.currentX = this.startX;
    this.isDragging = true;
    this.stopAutoPlay();
    document.body.style.cursor = 'grabbing';
  },

  handleMouseMove(event) {
    if (!this.isDragging) return;
    this.currentX = event.clientX;
  },

  handleMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    document.body.style.cursor = '';

    const diff = this.startX - this.currentX;
    if (Math.abs(diff) > this.dragThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }

    this.startAutoPlay();
  },

  prev() {
    const totalSlides = this.getTotalSlides();
    this.currentIndex = this.currentIndex === 0 ? totalSlides - 1 : this.currentIndex - 1;
    this.updateCarousel();
  },

  next() {
    const totalSlides = this.getTotalSlides();
    this.currentIndex = (this.currentIndex + 1) % totalSlides;
    this.updateCarousel();
  },

  goToSlide(index) {
    if (index >= 0 && index < this.getTotalSlides() && !this.isAnimating) {
      this.currentIndex = index;
      this.updateCarousel();
    }
  },

  updateCarousel() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const track = document.getElementById('testimonial-track');
    const dots = document.querySelectorAll('.testimonial-dot');
    if (!track) {
      this.isAnimating = false;
      return;
    }

    track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
      const isActive = index === this.currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    window.setTimeout(() => {
      this.isAnimating = false;
    }, 320);
  },

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = window.setInterval(() => this.next(), this.autoPlayDelay);
  },

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      window.clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
};

export const TestimonialsSection = {
  render: () => `
    <section id="testimonials" class="landing-section landing-anchor testimonials-section" data-nav-section>
      <div class="landing-shell">
        <div class="landing-section-head landing-section-head--single">
          <div class="landing-fade" style="--fade-delay: 40ms;">
            <span class="landing-eyebrow landing-fade" style="--fade-delay: 80ms;">
              <span class="landing-eyebrow__dot"></span>
              Bukti sosial yang membuat sekolah lebih yakin
            </span>
            <h2 class="landing-heading">
              Testimoni yang menunjukkan alasan
              <span class="landing-heading__accent">kenapa sekolah berani lanjut aktivasi</span>
            </h2>
          </div>
        </div>

        <div id="testimonial-carousel" class="testimonial-carousel">
          <div id="testimonial-track" class="testimonial-track">
            ${generateSlides(getInitialItemsPerSlide())}
          </div>

          <button id="testimonial-prev" class="testimonial-nav testimonial-nav--prev" aria-label="Testimoni sebelumnya">
            <i class="fas fa-arrow-left"></i>
          </button>
          <button id="testimonial-next" class="testimonial-nav testimonial-nav--next" aria-label="Testimoni berikutnya">
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>

        <div id="testimonial-dots" class="testimonial-dots">
          ${generateDots(getInitialItemsPerSlide())}
        </div>
      </div>
    </section>
  `,

  afterRender() {
    TestimonialCarousel.init();
  }
};

export default TestimonialsSection;

/**
 * Testimonials Section Component
 * Customer testimonials for landing page with carousel slider
 */

// Testimonial data - single source of truth
const testimonialsData = [
  {
    name: 'Bpk. Budi',
    role: 'Kantin SMPN 1',
    initials: 'B',
    gradient: 'from-indigo-500 to-purple-500',
    text: '"Sekarang kantin kami rame banget! Siswa-siswa pada excited sama Lucky Wheel-nya. Penjualan naik 30% dalam sebulan!"'
  },
  {
    name: 'Ibu Siti',
    role: 'Kantin SDN Jakarta',
    initials: 'S',
    gradient: 'from-pink-500 to-rose-500',
    text: '"Mudah banget setup-nya. Hanya butuh 5 menit langsung jadi. Tanya jawab sama admin juga responsif banget!"'
  },
  {
    name: 'Pak Agus',
    role: 'Kantin SMAN Bandung',
    initials: 'A',
    gradient: 'from-blue-500 to-cyan-500',
    text: '"Siswa-siswa jadi lebih semangat makan di kantin. Voucher-nya juga canggih, guru bisa monitoring easily."'
  },
  {
    name: 'Ibu Ratna',
    role: 'Kantin SDN Surabaya',
    initials: 'R',
    gradient: 'from-green-500 to-emerald-500',
    text: '"Aplikasi ini luar biasa! Siswa-siswa antusias sekali menunggu giliran spin. Tocong kami sekarang selalu rame!"'
  },
  {
    name: 'Bpk. Hadi',
    role: 'Kantin SMKN 2',
    initials: 'H',
    gradient: 'from-orange-500 to-red-500',
    text: '"Fitur vouchernya lengkap dan mudah digunakan. Siswa mudah memahami cara pakainya."'
  },
  {
    name: 'Ibu Dewi',
    role: 'Kantin SMA 3',
    initials: 'D',
    gradient: 'from-purple-500 to-pink-500',
    text: '"Best investment untuk kantin sekolah! ROI-nya jelas terlihat dalam hitungan minggu."'
  },
  {
    name: 'Pak Mahmud',
    role: 'Kantin MTSN 1',
    initials: 'M',
    gradient: 'from-cyan-500 to-blue-500',
    text: '"Dashboard-nya intuitif dan mudah dipahami. Tidak perlu培训 khusus untuk党组书记 menggunakan."'
  },
  {
    name: 'Ibu Lina',
    role: 'Kantin SDN 5',
    initials: 'L',
    gradient: 'from-violet-500 to-purple-500',
    text: '"SpinX membuat kantin sekolah kami berbeda dari yang lain. Siswa jadi lebih suka makan di sekolah!"'
  }
];

// Generate testimonial card HTML
const generateTestimonialCard = (t) => `
  <div class="testimonial-card rounded-2xl p-4 sm:p-6">
    <div class="flex items-center gap-1 mb-3 sm:mb-4">
      ${Array(5).fill('<i class="fas fa-star text-yellow-400 text-xs"></i>').join('')}
    </div>
    <p class="text-gray-300 mb-4 sm:mb-6 text-sm">${t.text}</p>
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm">${t.initials}</div>
      <div>
        <div class="text-white font-medium text-sm">${t.name}</div>
        <div class="text-gray-500 text-xs">${t.role}</div>
      </div>
    </div>
  </div>
`;

// Carousel state management
const TestimonialCarousel = {
  currentIndex: 0,
  itemsPerSlide: 1,
  autoPlayInterval: null,
  autoPlayDelay: 5000,
  isAnimating: false,
  
  // Touch/Mouse drag state
  isDragging: false,
  startX: 0,
  currentX: 0,
  dragThreshold: 50,

  // Initialize carousel
  init() {
    this.updateItemsPerSlide();
    this.bindEvents();
    this.bindTouchEvents();
    this.startAutoPlay();
    this.updateCarousel();
    
    // Update on resize
    window.addEventListener('resize', () => {
      const oldItemsPerSlide = this.itemsPerSlide;
      this.updateItemsPerSlide();
      
      // Regenerate slides only if itemsPerSlide changed
      if (oldItemsPerSlide !== this.itemsPerSlide) {
        this.regenerateSlides();
      }
    });
  },

  // Update items per slide based on screen width
  // Mobile (<768px): 1 item
  // Tablet (768px - 1024px): 2 items
  // Desktop (>1024px): 3 items
  updateItemsPerSlide() {
    const width = window.innerWidth;
    if (width < 768) {
      this.itemsPerSlide = 1;
    } else if (width < 1024) {
      this.itemsPerSlide = 2;
    } else {
      this.itemsPerSlide = 3;
    }
  },

  // Get total number of slides
  getTotalSlides() {
    return Math.ceil(testimonialsData.length / this.itemsPerSlide);
  },

  // Regenerate slides based on current itemsPerSlide
  regenerateSlides() {
    const track = document.getElementById('testimonial-track');
    const dotsContainer = document.querySelector('#testimonials .flex.justify-center');
    
    if (!track) return;

    // Create slides based on current itemsPerSlide
    const slides = [];
    for (let i = 0; i < testimonialsData.length; i += this.itemsPerSlide) {
      const slideItems = testimonialsData.slice(i, i + this.itemsPerSlide);
      const cardsHTML = slideItems.map(t => generateTestimonialCard(t)).join('');
      
      slides.push(`
        <div class="testimonial-slide min-w-full">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2">
            ${cardsHTML}
          </div>
        </div>
      `);
    }

    track.innerHTML = slides.join('');

    // Regenerate dots
    if (dotsContainer) {
      const totalSlides = this.getTotalSlides();
      let dotsHTML = '';
      for (let i = 0; i < totalSlides; i++) {
        dotsHTML += `<button class="testimonial-dot w-3 h-3 rounded-full bg-white/30 hover:bg-white/50 transition-all ${i === 0 ? 'active bg-white' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`;
      }
      dotsContainer.innerHTML = dotsHTML;
      
      // Rebind dot events
      dotsContainer.querySelectorAll('.testimonial-dot').forEach(dot => {
        dot.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          TestimonialCarousel.goToSlide(index);
        });
      });
    }
    
    // Reset current index to 0 after regeneration
    this.currentIndex = 0;
    this.updateCarousel();
  },

  // Bind click events
  bindEvents() {
    // Prev button
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prev());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.next());
    }

    // Pause on hover
    const carouselContainer = document.getElementById('testimonial-carousel');
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', () => this.stopAutoPlay());
      carouselContainer.addEventListener('mouseleave', () => this.startAutoPlay());
    }
  },

  // Bind touch and mouse drag events
  bindTouchEvents() {
    const carousel = document.getElementById('testimonial-carousel');
    const track = document.getElementById('testimonial-track');
    
    if (!carousel || !track) return;

    // Touch events
    carousel.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    carousel.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    carousel.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    // Mouse drag events
    carousel.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    
    // Prevent default drag behavior
    track.addEventListener('dragstart', (e) => e.preventDefault());
  },

  // Touch handlers
  handleTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.isDragging = true;
    this.stopAutoPlay();
  },

  handleTouchMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    this.currentX = e.touches[0].clientX;
  },

  handleTouchEnd(e) {
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

  // Mouse drag handlers
  handleMouseDown(e) {
    this.startX = e.clientX;
    this.isDragging = true;
    this.stopAutoPlay();
    document.body.style.cursor = 'grabbing';
  },

  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.clientX;
  },

  handleMouseUp(e) {
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

  // Go to previous slide
  prev() {
    const totalSlides = this.getTotalSlides();
    this.currentIndex = this.currentIndex === 0 ? totalSlides - 1 : this.currentIndex - 1;
    this.updateCarousel();
  },

  // Go to next slide
  next() {
    const totalSlides = this.getTotalSlides();
    this.currentIndex = (this.currentIndex + 1) % totalSlides;
    this.updateCarousel();
  },

  // Go to specific slide
  goToSlide(index) {
    if (index >= 0 && index < this.getTotalSlides() && !this.isAnimating) {
      this.currentIndex = index;
      this.updateCarousel();
    }
  },

  // Update carousel display
  updateCarousel() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const track = document.getElementById('testimonial-track');
    const dots = document.querySelectorAll('.testimonial-dot');
    
    if (!track) {
      this.isAnimating = false;
      return;
    }

    const totalSlides = this.getTotalSlides();
    const translateX = -(this.currentIndex * (100 / totalSlides));
    
    track.style.transform = `translateX(${translateX}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });

    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  },

  // Start auto play
  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.next(), this.autoPlayDelay);
  },

  // Stop auto play
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
};

// Generate initial slides based on current screen size
const generateInitialSlides = () => {
  // Determine initial items per slide
  let initialItemsPerSlide = 1;
  const width = window.innerWidth;
  if (width >= 1024) {
    initialItemsPerSlide = 3;
  } else if (width >= 768) {
    initialItemsPerSlide = 2;
  }
  
  const slides = [];
  for (let i = 0; i < testimonialsData.length; i += initialItemsPerSlide) {
    const slideItems = testimonialsData.slice(i, i + initialItemsPerSlide);
    const cardsHTML = slideItems.map(t => generateTestimonialCard(t)).join('');
    
    slides.push(`
      <div class="testimonial-slide min-w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2">
          ${cardsHTML}
        </div>
      </div>
    `);
  }
  return slides.join('');
};

// Generate initial dots based on current screen size
const generateInitialDots = () => {
  // Determine initial items per slide
  let initialItemsPerSlide = 1;
  const width = window.innerWidth;
  if (width >= 1024) {
    initialItemsPerSlide = 3;
  } else if (width >= 768) {
    initialItemsPerSlide = 2;
  }
  
  const totalSlides = Math.ceil(testimonialsData.length / initialItemsPerSlide);
  let dotsHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    dotsHTML += `<button class="testimonial-dot w-3 h-3 rounded-full bg-white/30 hover:bg-white/50 transition-all ${i === 0 ? 'active bg-white' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`;
  }
  return dotsHTML;
};

export const TestimonialsSection = {
  render: () => {
    return `
      <section id="testimonials" class="section-padding bg-gray-900/50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12 sm:mb-16">
            <span class="inline-block px-4 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium mb-4">TESTIMONI</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Apa Kata Mereka?</h2>
            <p class="text-gray-400 max-w-2xl mx-auto">Kepuasan pelanggan adalah prioritas utama kami</p>
          </div>
          
          <!-- Carousel Container -->
          <div id="testimonial-carousel" class="testimonial-carousel relative overflow-hidden">
            <!-- Track -->
            <div id="testimonial-track" class="testimonial-track flex transition-transform duration-500 ease-out">
              ${generateInitialSlides()}
            </div>
            
            <!-- Navigation Arrows - hidden on mobile (<768px), shown on tablet+ (≥768px) -->
            <button id="testimonial-prev" class="testimonial-nav testimonial-prev absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10 hidden md:flex" aria-label="Previous">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button id="testimonial-next" class="testimonial-nav testimonial-next absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10 hidden md:flex" aria-label="Next">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <!-- Pagination Dots -->
          <div class="flex justify-center gap-2 mt-6 sm:mt-8 flex-wrap">
            ${generateInitialDots()}
          </div>
        </div>
      </section>
    `;
  },

  // Initialize after render
  afterRender() {
    // Initialize carousel
    TestimonialCarousel.init();
  }
};

export default TestimonialsSection;


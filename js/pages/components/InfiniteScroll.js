export class InfiniteScroll {
  constructor(container, loadMoreFn) {
    this.container = container;
    this.loadMoreFn = loadMoreFn;
    this.observer = null;
    this.sentinel = null;
    this.init();
  }

  init() {
    this.sentinel = document.createElement('div');
    this.sentinel.id = 'infinite-scroll-sentinel';
    this.sentinel.className = 'h-1 opacity-0';
    this.container.appendChild(this.sentinel);

    this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
      threshold: 0.1
    });
    this.observer.observe(this.sentinel);
  }

  handleIntersect(entries) {
    if (entries[0].isIntersecting) {
      this.loadMoreFn();
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.sentinel && this.sentinel.parentNode) {
      this.sentinel.parentNode.removeChild(this.sentinel);
    }
  }
}


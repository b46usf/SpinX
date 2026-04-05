const applyClasses = (element, classes, enabled) => {
  if (!element || !classes) return;
  const classList = Array.isArray(classes) ? classes : [classes];
  classList.forEach((className) => {
    if (!className) return;
    element.classList.toggle(className, enabled);
  });
};

export const switchSection = (
  section,
  {
    navSelector = '.bottom-nav-item',
    sectionSelector = '.section-content',
    activeClasses = ['active'],
    inactiveClasses = [],
    sectionPrefix = 'section-',
    animationClass = 'animate-fade-in-up',
    hiddenClass = 'hidden'
  } = {}
) => {
  document.querySelectorAll(navSelector).forEach((item) => {
    const isActive = item.dataset.section === section;
    applyClasses(item, activeClasses, isActive);
    applyClasses(item, inactiveClasses, !isActive);
  });

  document.querySelectorAll(sectionSelector).forEach((sectionNode) => {
    const isActive = sectionNode.id === `${sectionPrefix}${section}`;
    sectionNode.classList.toggle(hiddenClass, !isActive);

    if (isActive && animationClass) {
      sectionNode.classList.add(animationClass);
    }
  });
};

export const initSectionNavigation = (
  onSectionChange,
  {
    navSelector = '.bottom-nav-item'
  } = {}
) => {
  document.querySelectorAll(navSelector).forEach((item) => {
    item.addEventListener('click', (event) => {
      const section = event.currentTarget.dataset.section;
      if (!section) return;
      if (typeof onSectionChange === 'function') {
        onSectionChange(section);
      }
    });
  });
};

export const switchTab = (
  tab,
  {
    tabSelector = '.reward-tab-btn',
    contentSelector = '.reward-content',
    activeClasses = ['active'],
    inactiveClasses = [],
    contentPrefix = 'reward-',
    hiddenClass = 'hidden'
  } = {}
) => {
  document.querySelectorAll(tabSelector).forEach((button) => {
    const isActive = button.dataset.tab === tab;
    applyClasses(button, activeClasses, isActive);
    applyClasses(button, inactiveClasses, !isActive);
  });

  document.querySelectorAll(contentSelector).forEach((content) => {
    const isActive = content.id === `${contentPrefix}${tab}`;
    content.classList.toggle(hiddenClass, !isActive);
  });
};

export const initTabNavigation = (
  onTabChange,
  {
    tabSelector = '.reward-tab-btn'
  } = {}
) => {
  document.querySelectorAll(tabSelector).forEach((button) => {
    button.addEventListener('click', (event) => {
      const tab = event.currentTarget.dataset.tab;
      if (!tab) return;
      if (typeof onTabChange === 'function') {
        onTabChange(tab);
      }
    });
  });
};

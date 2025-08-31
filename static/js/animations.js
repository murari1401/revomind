document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateImageBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateImageOnly);
  }

  const ideaInput = document.getElementById('ideaInput');
  if (ideaInput) {
    ideaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        generateImageOnly();
      }
    });
  }

  const Animations = {
    init() {
      gsap.registerPlugin(ScrollTrigger);
      this.initializeHeroAnimations();
      this.initializeScrollAnimations();
      this.initializeButtonAnimations();
      this.initializeCardAnimations();
    },

    initializeHeroAnimations() {
      gsap.from('.hero-content', {
        opacity: 0,
        y: 100,
        duration: 1,
        ease: 'power3.out'
      });

      gsap.from('.hero-content > *', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });
    },

    initializeScrollAnimations() {
      gsap.utils.toArray('.scroll-reveal').forEach(element => {
        gsap.from(element, {
          scrollTrigger: {
            trigger: element,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
          },
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power3.out'
        });
      });
    },

    initializeButtonAnimations() {
      document.querySelectorAll('.btn-3d').forEach(button => {
        button.addEventListener('mousemove', e => {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          gsap.to(button, {
            '--mouse-x': `${x}px`,
            '--mouse-y': `${y}px`,
            duration: 0.1
          });
        });
      });
    },

    initializeCardAnimations() {
      document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const rotateY = gsap.utils.mapRange(0, rect.width, -10, 10, x);
          const rotateX = gsap.utils.mapRange(0, rect.height, 10, -10, y);

          gsap.to(card, {
            rotateY,
            rotateX,
            scale: 1.05,
            duration: 0.5,
            ease: 'power2.out'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out'
          });
        });
      });
    }
  };

  // Initialize animations when DOM is loaded
  Animations.init();
});
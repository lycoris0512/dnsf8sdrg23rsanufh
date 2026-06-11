(() => {
    const root = document.documentElement;
    const header = document.querySelector(".site-header");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth <= 768 || (window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(pointer: fine)").matches);

    let cursorTimeout;
    const updateCursor = (e) => {
        if (cursorTimeout) clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(() => {
            root.style.setProperty("--cursor-x", `${e.clientX}px`);
            root.style.setProperty("--cursor-y", `${e.clientY}px`);
        }, 16);
    };
    if (!prefersReducedMotion && !isMobile) {
        document.addEventListener("pointermove", updateCursor, { passive: true });
    }

    const updateHeader = () => {
        if (!header) return;
        header.classList.toggle("not-top", window.scrollY > 12);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    const revealItems = document.querySelectorAll(".reveal, .skill-pill");
    revealItems.forEach((item, index) => {
        item.style.transitionDelay = `${Math.min(index * 38, 420)}ms`;
    });

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.14, rootMargin: "0px 0px -60px" });

        revealItems.forEach((item) => observer.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }

    const initMarquee = () => {
        document.querySelectorAll(".marquee-track").forEach((track) => {
            const inner = track.querySelector(".marquee-inner");
            if (!inner) return;

            const baseItems = Array.from(inner.children)
                .filter((item) => item.dataset.marqueeClone !== "true");
            if (!baseItems.length) return;

            inner.querySelectorAll("[data-marquee-clone='true']").forEach((item) => item.remove());

            const baseWidth = baseItems.reduce((width, item) => width + item.getBoundingClientRect().width, 0);
            const gap = Number.parseFloat(window.getComputedStyle(inner).columnGap) || 0;
            const segmentWidth = baseWidth + gap * Math.max(baseItems.length - 1, 0);
            if (!segmentWidth) return;

            const cloneSets = Math.max(1, Math.ceil((track.clientWidth * 2) / segmentWidth));
            for (let setIndex = 0; setIndex < cloneSets; setIndex += 1) {
                baseItems.forEach((item) => {
                    const clone = item.cloneNode(true);
                    clone.dataset.marqueeClone = "true";
                    inner.appendChild(clone);
                });
            }

            inner.style.setProperty("--marquee-distance", `${segmentWidth + gap}px`);
            inner.style.animation = "none";
            inner.offsetHeight;
            inner.style.animation = "";
        });
    };

    initMarquee();
    let marqueeResizeFrame = null;
    window.addEventListener("resize", () => {
        if (marqueeResizeFrame) cancelAnimationFrame(marqueeResizeFrame);
        marqueeResizeFrame = requestAnimationFrame(initMarquee);
    }, { passive: true });

    const scrollPanels = Array.from(document.querySelectorAll(".content-panel, .skill-block, .project-card, .pay-card, .contact-card"));
    scrollPanels.forEach((panel, index) => {
        panel.classList.add("scroll-panel", index % 2 === 0 ? "from-right" : "from-left");
        panel.style.setProperty("--panel-delay", `${Math.min((index % 4) * 85, 255)}ms`);
    });

    if ("IntersectionObserver" in window) {
        const panelObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const panel = entry.target;
                if (entry.isIntersecting) {
                    panel.classList.remove("is-leaving");
                    panel.classList.add("is-visible");
                    return;
                }

                panel.classList.remove("is-visible");
                panel.classList.add("is-leaving");
            });
        }, {
            threshold: 0.22,
            rootMargin: "-8% 0px -10% 0px"
        });

        scrollPanels.forEach((panel) => panelObserver.observe(panel));
    } else {
        scrollPanels.forEach((panel) => panel.classList.add("is-visible"));
    }

    if (!prefersReducedMotion && !isMobile) {
        document.querySelectorAll("[data-tilt]").forEach((card) => {
            card.addEventListener("pointermove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(900px) rotateX(${y * -7}deg) rotateY(${x * 7}deg) translateY(-2px)`;
            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        });
    }

    const activeSectionLinks = Array.from(document.querySelectorAll(".header-nav a[href^='#']"));
    const sections = activeSectionLinks
        .map((link) => ({
            link,
            section: document.querySelector(link.getAttribute("href"))
        }))
        .filter((item) => item.section);
    let activeFrame = null;
    let clickLockUntil = 0;

    const setActiveLink = (hash) => {
        activeSectionLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === hash);
        });
    };

    const updateActiveLink = () => {
        activeFrame = null;
        if (!sections.length) return;
        if (Date.now() < clickLockUntil) return;

        const headerOffset = (header?.offsetHeight || 72) + 42;
        const scrollLine = window.scrollY + headerOffset + 8;
        const firstTop = sections[0].section.offsetTop;
        let current = null;

        if (scrollLine < firstTop - 90) {
            setActiveLink("");
            return;
        }

        sections.forEach((item) => {
            if (item.section.offsetTop <= scrollLine) {
                current = item;
            }
        });

        setActiveLink(current ? current.link.getAttribute("href") : "");
    };

    const queueActiveUpdate = () => {
        if (activeFrame) return;
        activeFrame = requestAnimationFrame(updateActiveLink);
    };

    activeSectionLinks.forEach((link) => {
        link.addEventListener("click", () => {
            clickLockUntil = Date.now() + 950;
            setActiveLink(link.getAttribute("href"));
            window.setTimeout(queueActiveUpdate, 980);
        });
    });

    updateActiveLink();
    window.addEventListener("scroll", queueActiveUpdate, { passive: true });
    window.addEventListener("resize", queueActiveUpdate);

    const heartLayer = document.querySelector("[data-heart-rain]");
    const heartColors = ["#ff5c8a", "#ff799e", "#ffb1c8", "#f05d7c"];
    let heartTimer = null;

    const spawnHeart = () => {
        if (!heartLayer) return;
        const heart = document.createElement("span");
        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const heartSize = 10 + Math.random() * 8;
        const startLeft = Math.min(
            viewportWidth - heartSize - 8,
            Math.max(8, viewportWidth * (0.68 + Math.random() * 0.24))
        );
        const driftX = -(80 + Math.random() * Math.min(220, viewportWidth * 0.54));
        heart.className = "falling-heart";
        heart.textContent = "♥";
        heart.style.setProperty("--heart-left", `${startLeft}px`);
        heart.style.setProperty("--heart-size", `${heartSize}px`);
        heart.style.setProperty("--heart-x", `${driftX}px`);
        heart.style.setProperty("--heart-y", `${window.innerHeight + 80 + Math.random() * 120}px`);
        heart.style.setProperty("--heart-rotate", `${-28 + Math.random() * 56}deg`);
        heart.style.setProperty("--heart-duration", `${4.4 + Math.random() * 2.4}s`);
        heart.style.setProperty("--heart-color", heartColors[Math.floor(Math.random() * heartColors.length)]);
        heartLayer.appendChild(heart);
        heart.addEventListener("animationend", () => heart.remove(), { once: true });
        window.setTimeout(() => heart.remove(), 9000);
    };

    const spawnHearts = () => {
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i += 1) {
            spawnHeart();
        }
    };

    const scheduleHeart = () => {
        heartTimer = window.setTimeout(() => {
            spawnHearts();
            scheduleHeart();
        }, 1800 + Math.random() * 600);
    };

    // Chỉ chạy heart rain trên PC, tắt trên mobile
    if (!isMobile) {
        scheduleHeart();
    }
    window.addEventListener("beforeunload", () => {
        if (heartTimer) window.clearTimeout(heartTimer);
    });
})();

(() => {
    const root = document.documentElement;
    const body = document.body;

    if (!body || !body.classList.contains("home-page")) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
    const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    root.classList.add("premium-ui");

    const setPointerVars = (event) => {
        const x = clamp((event.clientX / window.innerWidth) * 100, 0, 100);
        const y = clamp((event.clientY / window.innerHeight) * 100, 0, 100);
        root.style.setProperty("--mesh-x", `${x}%`);
        root.style.setProperty("--mesh-y", `${y}%`);
    };

    if (!reduceMotion) {
        let pointerFrame = null;
        window.addEventListener("pointermove", (event) => {
            if (pointerFrame) cancelAnimationFrame(pointerFrame);
            pointerFrame = requestAnimationFrame(() => setPointerVars(event));
        }, { passive: true });
    }

    const attachSurfaceGlow = () => {
        const surfaces = selectAll(".content-panel, .skill-block, .project-card, .pay-card, .contact-card");

        surfaces.forEach((surface) => {
            surface.addEventListener("pointermove", (event) => {
                const rect = surface.getBoundingClientRect();
                surface.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
                surface.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
            }, { passive: true });
        });
    };

    const createAmbientSparks = () => {
        const layer = document.querySelector(".ambient-grid");
        if (!layer || window.innerWidth < 700) return [];

        const count = window.innerWidth > 1200 ? 24 : 14;
        const sparks = [];

        for (let index = 0; index < count; index += 1) {
            const spark = document.createElement("span");
            spark.className = "cyber-spark";
            spark.setAttribute("aria-hidden", "true");
            spark.style.setProperty("--x", `${8 + Math.random() * 84}%`);
            spark.style.setProperty("--y", `${8 + Math.random() * 84}%`);
            spark.style.setProperty("--w", `${34 + Math.random() * 70}px`);
            spark.style.setProperty("--r", `${-24 + Math.random() * 48}deg`);
            layer.appendChild(spark);
            sparks.push(spark);
        }

        return sparks;
    };

    const attachMagneticButtons = () => {
        const targets = selectAll(".primary-action, .secondary-action, .project-link, .contact-card a, .contact-actions a, .bank-info button, .music-consent-accept, .music-consent-decline, .theme-toggle, .music-toggle, .social-strip a, .header-nav a");

        targets.forEach((target) => {
            target.addEventListener("pointermove", (event) => {
                const rect = target.getBoundingClientRect();
                const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
                const y = (event.clientY - rect.top - rect.height / 2) * 0.22;

                if (hasGsap) {
                    window.gsap.to(target, {
                        x,
                        y,
                        scale: 1.025,
                        duration: 0.42,
                        ease: "power3.out",
                        overwrite: "auto"
                    });
                    return;
                }

                target.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }, { passive: true });

            target.addEventListener("pointerleave", () => {
                if (hasGsap) {
                    window.gsap.to(target, {
                        x: 0,
                        y: 0,
                        scale: 1,
                        duration: 0.55,
                        ease: "elastic.out(1, 0.55)",
                        overwrite: "auto"
                    });
                    return;
                }

                target.style.transform = "";
            }, { passive: true });
        });
    };

    const attachSecretReveal = () => {
        selectAll("[data-secret-reveal]").forEach((target) => {
            const reveal = () => target.classList.add("is-revealed");

            target.addEventListener("pointerdown", reveal, { passive: true });
            target.addEventListener("click", reveal);
            target.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                reveal();
            });
        });
    };

    const initGsapMotion = (sparks) => {
        const { gsap, ScrollTrigger } = window;
        gsap.registerPlugin(ScrollTrigger);
        root.classList.add("premium-motion");

        gsap.defaults({
            ease: "power3.out",
            duration: 0.9
        });

        const intro = gsap.timeline({ delay: 0.12 });
        const clearIntroProps = () => {
            gsap.set(".site-header, .hero-copy > *, .hero-visual, .signal-board", {
                clearProps: "transform,filter,opacity,visibility"
            });
        };

        intro
            .fromTo(".site-header", {
                y: -22,
                autoAlpha: 0,
                filter: "blur(10px)"
            }, {
                y: 0,
                autoAlpha: 1,
                filter: "blur(0px)",
                duration: 0.75,
                onComplete: () => gsap.set(".site-header", { clearProps: "transform,filter,opacity,visibility" })
            })
            .from(".hero-copy > *", {
                y: 24,
                stagger: 0.085,
                duration: 0.62
            }, "-=0.34")
            .from(".hero-visual", {
                y: 26,
                scale: 0.97,
                duration: 0.72
            }, "-=0.44")
            .from(".signal-board", {
                y: 16,
                duration: 0.52
            }, "-=0.42");

        intro.eventCallback("onComplete", clearIntroProps);
        window.setTimeout(() => {
            intro.kill();
            clearIntroProps();
        }, 2200);

        gsap.from(".td-lock-screen .logo-web-title", {
            y: 30,
            scale: 0.96,
            duration: 0.72,
            delay: 0.2
        });

        gsap.from(".td-lock-screen .web_desc", {
            y: 18,
            duration: 0.58,
            delay: 0.44
        });

        window.setTimeout(() => {
            gsap.set(".td-lock-screen .logo-web-title, .td-lock-screen .web_desc", {
                clearProps: "transform,filter,opacity,visibility"
            });
        }, 1400);

        selectAll(".section-grid, .contact-showcase").forEach((section) => {
            gsap.fromTo(section, {
                autoAlpha: 0.72,
                y: 38,
                scale: 0.992
            }, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.95,
                scrollTrigger: {
                    trigger: section,
                    start: "top 82%",
                    once: true
                }
            });
        });

        selectAll(".content-panel, .skill-block, .project-card, .pay-card, .contact-card").forEach((surface, index) => {
            gsap.fromTo(surface, {
                autoAlpha: 0,
                y: 46,
                scale: 0.985,
                filter: "blur(14px)"
            }, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.9,
                delay: Math.min((index % 4) * 0.045, 0.18),
                onStart: () => surface.classList.remove("is-leaving"),
                onComplete: () => {
                    surface.classList.add("premium-panel-ready");
                    gsap.set(surface, {
                        clearProps: "transform,filter,opacity,visibility"
                    });
                },
                scrollTrigger: {
                    trigger: surface,
                    start: "top 88%",
                    once: true
                }
            });
        });

        selectAll(".skill-cloud").forEach((cloud) => {
            const pills = selectAll(".skill-pill", cloud);
            gsap.fromTo(pills, {
                autoAlpha: 0,
                y: 18,
                scale: 0.96
            }, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                duration: 0.54,
                stagger: 0.04,
                scrollTrigger: {
                    trigger: cloud,
                    start: "top 90%",
                    once: true
                }
            });
        });

        gsap.to(".ambient-grid", {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
                trigger: body,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.8
            }
        });

        gsap.to(".motion-window", {
            yPercent: -5,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: 0.9
            }
        });

        sparks.forEach((spark, index) => {
            gsap.to(spark, {
                autoAlpha: 0.7,
                x: `${24 + Math.random() * 54}px`,
                y: `${-18 - Math.random() * 46}px`,
                duration: 2.8 + Math.random() * 2.4,
                delay: index * 0.08,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
    };

    attachSurfaceGlow();
    attachMagneticButtons();
    attachSecretReveal();

    if (reduceMotion) {
        root.classList.add("premium-reduced");
        return;
    }

    const sparks = createAmbientSparks();

    if (hasGsap) {
        initGsapMotion(sparks);
    }
})();

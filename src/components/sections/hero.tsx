"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";

import { FaInstagram, FaFacebook, FaYoutube, FaSpotify, FaArrowDown } from "react-icons/fa";

function Hero() {
    const [desktopImageLoaded, setDesktopImageLoaded] = useState(false)
    const [mobileImageLoaded, setMobileImageLoaded] = useState(false)

    useEffect(() => {
        // Preload the desktop image
        const desktopImg = new window.Image()
        desktopImg.src = "/hero-desktop.webp"
        desktopImg.onload = () => setDesktopImageLoaded(true)

        // Preload the mobile image
        const mobileImg = new window.Image()
        mobileImg.src = "/hero-mobile.webp"
        mobileImg.onload = () => setMobileImageLoaded(true)
    }, [])

    // No need for width measurement, always show menu on mobile
    return (
        <header className="relative text-primary-foreground mb-12">
            <div className="absolute overflow-x-hidden bottom-0 md:top-0 left-1/2 translate-y-1/2 md:translate-y-0 -translate-x-1/2 py-4  pointer-events-none z-10">
                <motion.div
                    className="mx-auto bg-muted/60 text-foreground backdrop-blur-md border-muted-foreground border px-3 py-2 rounded-full pointer-events-auto relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: "auto" }}
                    transition={{
                        duration: 0.5,
                        ease: [0.4, 0, 0.2, 1],
                        when: "beforeChildren",
                        staggerChildren: 0.1
                    }}
                >
                    <div className="flex items-center gap-2">
                        <motion.div
                            className="size-10 rounded-full overflow-hidden border border-muted-foreground/25"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 10,
                                    ease: "linear"
                                }}
                            >
                                <Image src="/logo-320.jpg" alt="Nillihc band logo" width={100} height={100} className="w-full h-full object-cover" />
                            </motion.div>
                        </motion.div>
                        <motion.a
                            className="flex items-center justify-center p-2"
                            href="https://www.instagram.com/nillihcband/?ref=nillihc"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Volg Nillihc op Instagram"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                        >
                            <FaInstagram className="size-5" />
                        </motion.a>
                        <motion.a
                            className="flex items-center justify-center p-2"
                            href="https://www.facebook.com/NillihcBand/?ref=nillihc"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Volg Nillihc op Facebook"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
                        >
                            <FaFacebook />
                        </motion.a>
                        <motion.a
                            className="flex items-center justify-center p-2"
                            href="https://www.youtube.com/@nillihcband?ref=nillihc"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Bekijk Nillihc op YouTube"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                        >
                            <FaYoutube className="size-5" />
                        </motion.a>
                        <motion.a
                            className="flex items-center justify-center p-2"
                            href="https://open.spotify.com/artist/3LAoxEz5BGdijXj4YG2f6v?ref=nillihc"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Luister Nillihc op Spotify"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.4 }}
                        >
                            <FaSpotify className="size-5" />
                        </motion.a>
                    </div>
                </motion.div>
            </div>
            <div className="min-h-[80vh] md:min-h-[calc(99vh)] relative w-full flex items-center overflow-hidden">
                {/* Background image */}
                {/* Placeholder for desktop - shown initially, fades out when full image loads */}
                <Image
                    src="/hero-desktop-placeholder.webp"
                    alt=""
                    fill
                    className={`absolute inset-0 w-full h-full object-cover z-0 rounded-b-4xl md:block hidden blur-sm scale-110 transition-opacity duration-500 ${desktopImageLoaded ? 'opacity-0' : 'opacity-100'
                        }`}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                    aria-hidden="true"
                    priority
                />
                {/* Placeholder for mobile - shown initially, fades out when full image loads */}
                <Image
                    src="/hero-mobile-placeholder.webp"
                    alt=""
                    fill
                    className={`absolute inset-0 w-full h-full object-cover z-0 rounded-b-4xl md:hidden block blur-sm scale-110 transition-opacity duration-500 ${mobileImageLoaded ? 'opacity-0' : 'opacity-100'
                        }`}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                    aria-hidden="true"
                    priority
                />
                {/* Desktop image - preload and fade in when ready */}
                <Image
                    src="/hero-desktop.webp"
                    alt="Nillihc band performing live - hero image"
                    fill
                    className={`absolute inset-0 w-full h-full object-cover z-0 rounded-b-4xl md:block hidden transition-opacity duration-500 ${desktopImageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                    onLoadingComplete={() => {
                        if (window.matchMedia('(min-width: 768px)').matches) {
                            setDesktopImageLoaded(true)
                        }
                    }}
                    priority
                />
                {/* Mobile image - preload and fade in when ready */}
                <Image
                    src="/hero-mobile.webp"
                    alt="Nillihc band performing live - hero image mobile"
                    fill
                    className={`absolute inset-0 w-full h-full object-cover z-0 rounded-b-4xl md:hidden block transition-opacity duration-500 ${mobileImageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                    onLoadingComplete={() => {
                        if (window.matchMedia('(max-width: 767px)').matches) {
                            setMobileImageLoaded(true)
                        }
                    }}
                    priority
                />

                {/* Scroll down circle with arrow down */}
                <div className="w-full justify-center absolute bottom-4 z-10 hidden md:flex">
                    <motion.div
                        className="w-10 h-10 rounded-full bg-foreground/50 backdrop-blur-md flex items-center justify-center border-primary border-2"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >
                        <FaArrowDown className="size-5 text-background" />
                    </motion.div>
                </div>
                {/* Overlay content
                <div className="w-full flex justify-center absolute top-0 bottom-auto md:top-auto md:bottom-0 md:translate-y-[10px] z-10">
                    <motion.svg
                        initial={{ opacity: 1, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full h-auto max-w-6xl"
                        viewBox="0 0 445 126"
                        fill=""
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ display: 'block' }}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <path
                            className="fill-foreground"
                            d="M98.1568 6.70092V123.995H76.7262L25.6709 50.1709H24.8113V123.995H0V6.70092H21.7745L72.4286 80.4682H73.46V6.70092H98.1568ZM113.357 123.995V36.0245H137.767V123.995H113.357ZM125.619 24.6845C121.99 24.6845 118.877 23.4818 116.279 21.0764C113.72 18.6327 112.44 15.7118 112.44 12.3136C112.44 8.95363 113.72 6.07092 116.279 3.66546C118.877 1.22182 121.99 0 125.619 0C129.248 0 132.343 1.22182 134.902 3.66546C137.5 6.07092 138.798 8.95363 138.798 12.3136C138.798 15.7118 137.5 18.6327 134.902 21.0764C132.343 23.4818 129.248 24.6845 125.619 24.6845ZM176.891 6.70092V123.995H152.48V6.70092H176.891ZM216.014 6.70092V123.995H191.603V6.70092H216.014ZM230.727 123.995V36.0245H255.137V123.995H230.727ZM242.99 24.6845C239.361 24.6845 236.247 23.4818 233.65 21.0764C231.09 18.6327 229.81 15.7118 229.81 12.3136C229.81 8.95363 231.09 6.07092 233.65 3.66546C236.247 1.22182 239.361 0 242.99 0C246.618 0 249.713 1.22182 252.272 3.66546C254.87 6.07092 256.169 8.95363 256.169 12.3136C256.169 15.7118 254.87 18.6327 252.272 21.0764C249.713 23.4818 246.618 24.6845 242.99 24.6845ZM294.261 73.1373V123.995H269.85V6.70092H293.574V51.5454H294.605C296.592 46.3527 299.8 42.2863 304.231 39.3464C308.662 36.3682 314.22 34.879 320.905 34.879C327.018 34.879 332.347 36.2155 336.893 38.8882C341.478 41.5228 345.03 45.3218 347.551 50.2854C350.11 55.2109 351.371 61.11 351.333 67.9828V123.995H326.922V72.3354C326.96 66.9137 325.586 62.6945 322.796 59.6782C320.047 56.6618 316.188 55.1537 311.223 55.1537C307.898 55.1537 304.957 55.8601 302.398 57.2728C299.877 58.6855 297.89 60.7472 296.438 63.4582C295.025 66.1309 294.299 69.3573 294.261 73.1373ZM405.469 125.714C396.453 125.714 388.699 123.805 382.205 119.986C375.749 116.13 370.783 110.785 367.306 103.95C363.869 97.1155 362.149 89.2501 362.149 80.3537C362.149 71.3427 363.888 63.4391 367.364 56.6428C370.878 49.8082 375.864 44.4819 382.319 40.6637C388.775 36.8072 396.453 34.879 405.355 34.879C413.033 34.879 419.756 36.2727 425.525 39.06C431.293 41.8472 435.858 45.7609 439.22 50.8009C442.581 55.8409 444.434 61.7591 444.778 68.5554H421.743C421.093 64.1646 419.374 60.6327 416.585 57.96C413.835 55.2491 410.226 53.8937 405.755 53.8937C401.974 53.8937 398.67 54.9245 395.842 56.9864C393.053 59.0101 390.876 61.969 389.311 65.8637C387.744 69.7582 386.961 74.4737 386.961 80.01C386.961 85.6228 387.725 90.3955 389.253 94.3282C390.82 98.2609 393.016 101.258 395.842 103.32C398.67 105.382 401.974 106.413 405.755 106.413C408.544 106.413 411.046 105.84 413.263 104.695C415.517 103.549 417.368 101.888 418.821 99.7118C420.311 97.4973 421.284 94.8437 421.743 91.7509H444.778C444.396 98.4709 442.562 104.389 439.277 109.505C436.029 114.584 431.542 118.555 425.811 121.418C420.081 124.282 413.3 125.714 405.469 125.714Z" />
                    </motion.svg>
                </div> */}
            </div>
        </header>
    )
}

export { Hero }
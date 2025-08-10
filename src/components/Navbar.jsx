import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("Home");
    
    // Dapatkan lokasi saat ini dari URL
    const location = useLocation();

    const navItems = [
        { href: "#Home", label: "Home" },
        { href: "#About", label: "About" },
        { href: "#Portofolio", label: "Portofolio" },
        { href: "/blog", label: "Blog" }, // Link baru ke halaman blog
        { href: "#Contact", label: "Contact" },
    ];

    // Efek untuk handle scroll & update active section HANYA di homepage
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            // Hanya jalankan logika scroll-spy di halaman utama
            if (location.pathname === '/') {
                const sections = navItems.map(item => {
                    if (item.href.startsWith("#")) {
                        const section = document.querySelector(item.href);
                        if (section) {
                            return {
                                id: item.label,
                                offset: section.offsetTop - 300,
                                height: section.offsetHeight
                            };
                        }
                    }
                    return null;
                }).filter(Boolean);

                const currentPosition = window.scrollY;
                let newActiveSection = "Home"; // Default
                for (const section of sections) {
                    if (currentPosition >= section.offset && currentPosition < section.offset + section.height) {
                        newActiveSection = section.id;
                        break;
                    }
                }
                setActiveSection(newActiveSection);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]); // Tambahkan location.pathname sebagai dependency

    // Efek untuk set active section berdasarkan URL
    useEffect(() => {
        if (location.pathname.startsWith('/blog')) {
            setActiveSection('Blog');
        } else if (location.pathname.startsWith('/project')) {
            setActiveSection('Portofolio');
        } else if (location.pathname === '/') {
            // Biarkan scroll handler yang menentukan, atau set default ke Home
            setActiveSection('Home');
        }
    }, [location.pathname]);


    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset' };
    }, [isOpen]);

    const scrollToSection = (e, href) => {
        e.preventDefault();
        // Cek jika kita tidak di homepage, arahkan ke homepage dulu baru scroll
        if (location.pathname !== '/') {
            window.location.href = `/${href}`;
        } else {
            const section = document.querySelector(href);
            if (section) {
                const top = section.offsetTop - 100;
                window.scrollTo({
                    top: top,
                    behavior: "smooth"
                });
            }
        }
        setIsOpen(false);
    };

    const NavLink = ({ item }) => {
        const isPageLink = item.href.startsWith('/');
        const isActive = activeSection === item.label;

        const linkClasses = "group relative px-1 py-2 text-sm font-medium";
        const spanClasses = `relative z-10 transition-colors duration-300 ${
            isActive
                ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold"
                : "text-[#e2d3fd] group-hover:text-white"
        }`;
        const underlineClasses = `absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] transform origin-left transition-transform duration-300 ${
            isActive
                ? "scale-x-100"
                : "scale-x-0 group-hover:scale-x-100"
        }`;
        
        if (isPageLink) {
            return (
                <Link to={item.href} className={linkClasses} onClick={() => setIsOpen(false)}>
                    <span className={spanClasses}>{item.label}</span>
                    <span className={underlineClasses} />
                </Link>
            );
        }

        return (
            <a href={item.href} onClick={(e) => scrollToSection(e, item.href)} className={linkClasses}>
                <span className={spanClasses}>{item.label}</span>
                <span className={underlineClasses} />
            </a>
        );
    };

    const MobileNavLink = ({ item, index }) => {
        const isPageLink = item.href.startsWith('/');
        const isActive = activeSection === item.label;

        const linkClasses = `block px-4 py-3 text-lg font-medium transition-all duration-300 ease ${
            isActive
                ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold"
                : "text-[#e2d3fd] hover:text-white"
        }`;

        const style = {
            transitionDelay: `${index * 100}ms`,
            transform: isOpen ? "translateX(0)" : "translateX(50px)",
            opacity: isOpen ? 1 : 0,
        };

        if (isPageLink) {
            return <Link to={item.href} className={linkClasses} style={style} onClick={() => setIsOpen(false)}>{item.label}</Link>;
        }
        
        return <a href={item.href} onClick={(e) => scrollToSection(e, item.href)} className={linkClasses} style={style}>{item.label}</a>;
    }


    return (
        <nav
            className={`fixed w-full top-0 z-50 transition-all duration-500 ${
                isOpen
                    ? "bg-[#030014]"
                    : scrolled
                    ? "bg-[#030014]/50 backdrop-blur-xl"
                    : "bg-transparent"
            }`}
        >
            <div className="mx-auto px-[5%] sm:px-[5%] lg:px-[10%]">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link
                            to="/"
                            onClick={(e) => {
                                if (location.pathname === '/') {
                                    scrollToSection(e, "#Home");
                                }
                            }}
                            className="text-xl font-bold bg-gradient-to-r from-[#a855f7] to-[#6366f1] bg-clip-text text-transparent"
                        >
                            masyarakatbiasa
                        </Link>
                    </div>
        
                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-8 flex items-center space-x-8">
                            {navItems.map((item) => <NavLink key={item.label} item={item} />)}
                        </div>
                    </div>
        
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`relative p-2 text-[#e2d3fd] hover:text-white transition-transform duration-300 ease-in-out transform ${
                                isOpen ? "rotate-90 scale-125" : "rotate-0 scale-100"
                            }`}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
        
            {/* Mobile Menu */}
            <div
                className={`md:hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                }`}
            >
                <div className="px-4 py-6 space-y-4">
                    {navItems.map((item, index) => <MobileNavLink key={item.label} item={item} index={index} />)}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
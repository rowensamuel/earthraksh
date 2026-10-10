import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import liquidGL, { LiquidGLInstance } from 'liquid-gl';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { StickyStorytellingSection } from '../../components/home/StickyStorytellingSection';
import { dataService } from '../../services/dataService';
import { marketplaceService } from '../../services/marketplaceService';
import { equipmentService } from '../../services/equipmentService';
import { MarketplaceProduct, Equipment } from '../../types';
import {
  homeHeroImage,
  getEquipmentImage,
  getProduceImage
} from '../../assets/assetRegistry';
import {
  FarmIcon,
  CropIcon,
  SoilIcon,
  DiseaseIcon,
  InventoryIcon,
  EquipmentIcon,
  MarketplaceIcon,
  WeatherIcon,
  ShieldIcon,
  CheckIcon,
  GovernmentSchemeIcon,
  ArrowRightIcon,
  ExternalLinkIcon
} from '../../components/common/Icons';

// Apple cubic-bezier easing curve
const appleEase = [0.16, 1, 0.3, 1] as const;

/**
 * Reusable Apple-Style Scroll Fade Component
 * Smoothly appears when entering viewport, stays in clear focus,
 * and smoothly dissolves/disappears when scrolled past out of viewport.
 */
interface ScrollFadeItemProps {
  children: React.ReactNode;
  className?: string;
  fadeOffset?: number;
  scaleDown?: boolean;
}

const ScrollFadeItem: React.FC<ScrollFadeItemProps> = ({
  children,
  className = '',
  fadeOffset = 40,
  scaleDown = true
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  // Apple Smooth Reveal: Appears gracefully on enter, stays crisp and visible in viewport
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.92, 1], [0, 1, 1, 0.4]);
  const y = useTransform(scrollYProgress, [0, 0.18, 0.92, 1], [fadeOffset, 0, 0, -15]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.18, 0.92, 1],
    scaleDown ? [0.98, 1, 1, 0.99] : [1, 1, 1, 1]
  );

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<MarketplaceProduct[]>(() => dataService.getProducts().slice(0, 3));
  const [equipment, setEquipment] = useState<Equipment[]>(() => dataService.getEquipment().slice(0, 3));

  const lensRef = useRef<LiquidGLInstance | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax and Scroll Disappear Effect for Hero
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 800], [0, 180]);
  const heroContentOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const heroContentY = useTransform(scrollY, [0, 480], [0, -110]);
  const heroContentScale = useTransform(scrollY, [0, 480], [1, 0.92]);

  // 1. Initialize Lenis Inertial Smooth Scrolling (Optimized for 0-lag 60/120fps)
  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId: number;

    try {
      lenis = new Lenis({
        duration: 0.9,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    } catch (err) {
      console.warn('Lenis smooth scroll notice:', err);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  // 2. Load Real Marketplace & Machinery Data
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [prods, eq] = await Promise.all([
          marketplaceService.getProducts(),
          equipmentService.getEquipment()
        ]);
        if (prods.length > 0) setProducts(prods.slice(0, 3));
        if (eq.length > 0) setEquipment(eq.slice(0, 3));
      } catch (err) {
        console.warn('Home page public data load notice:', err);
      }
    };
    fetchPublicData();
  }, []);

  // 3. Initialize LiquidGL Lens with User's Exact Configuration (Optimized for 0-lag Refresh)
  useEffect(() => {
    let lens: LiquidGLInstance | null = null;
    let timer: NodeJS.Timeout;

    try {
      // Defer slightly so page mount, fonts, and images settle without any main-thread freeze
      timer = setTimeout(() => {
        const targetEl = document.querySelector('.liquidGL');
        if (targetEl) {
          try {
            lens = liquidGL({
              target: '.liquidGL',
              snapshot: '#hero-section',
              resolution: 1.25,
              engine: 'auto',
              zIndex: undefined,
              content: undefined,
              refraction: 0.01,
              aberration: 0,
              bevelDepth: 0.08,
              bevelWidth: 0.15,
              frost: 0,
              shadow: true,
              specular: true,
              reveal: 'fade',
              tilt: false,
              tiltFactor: 5,
              tiltEase: 400,
              draggable: false,
              interaction: 'none',
              interactionStrength: 0.5,
              interactionRadius: 0.35,
              interactionViscosity: 0.65,
              magnify: 1,
              tint: null,
              helper: false,
              on: {
                init: () => {}
              }
            });
            lensRef.current = lens;
          } catch (initErr) {
            console.warn('LiquidGL initialization notice:', initErr);
          }
        }
      }, 200);
    } catch (e) {
      console.warn('LiquidGL setup notice:', e);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (lens && typeof lens.destroy === 'function') {
        try {
          lens.destroy();
        } catch (cleanupErr) {
          console.warn('LiquidGL cleanup notice:', cleanupErr);
        }
      }
      lensRef.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAF6] flex flex-col text-[#17251D] antialiased selection:bg-[#8BE3A1] selection:text-[#0A281D] overflow-x-hidden">
      {/* Existing Navbar Preserved */}
      <PublicNavbar />

      {/* ==================================================================== */}
      {/* 1. CINEMATIC HERO: "AI BASED FARM" DISAPPEARS SMOOTHLY ON SCROLL     */}
      {/* ==================================================================== */}
      <section
        ref={heroRef}
        id="hero-section"
        className="relative w-full min-h-[96vh] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#0A281D] text-white"
      >
        {/* Full-bleed Architectural Vertical Farm Background with Parallax */}
        <motion.div
          style={{ y: heroImageY }}
          className="absolute inset-0 z-0 select-none pointer-events-none"
        >
          <img
            src={homeHeroImage}
            alt="Controlled Environment Agriculture"
            className="w-full h-full object-cover object-center scale-105"
            loading="eager"
          />
          {/* Deep Forest Multi-Stop Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A281D]/90 via-[#0A281D]/40 to-[#0A281D]" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0A281D]/45 to-[#0A281D]" />
        </motion.div>

        {/* Top Spacer for the absolute PublicNavbar */}
        <div className="h-28 sm:h-36 relative z-10" />

        {/* Central Stage: Massive AI BASED FARM Headline (Scrolls away with smooth opacity/lift) */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 flex-1 flex flex-col justify-center py-6 sm:py-10 lg:py-14">
          <motion.div
            style={{
              opacity: heroContentOpacity,
              y: heroContentY,
              scale: heroContentScale
            }}
            className="max-w-5xl space-y-5 sm:space-y-8"
          >
            {/* Signature Headline: AI BASED FARM */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: appleEase }}
              className="overflow-hidden"
            >
              <h1 className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl lg:text-[11vw] font-display font-black text-white tracking-tighter uppercase leading-[0.88] select-none drop-shadow-2xl break-words">
                AI BASED FARM
              </h1>
            </motion.div>

            {/* Smooth Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: appleEase }}
              className="text-sm sm:text-lg lg:text-xl text-[#DDEFE0]/85 max-w-2xl font-normal leading-relaxed"
            >
              Precision agronomy from soil to settlement. Unifying cadastral soil chemistry, computer-vision foliar diagnostics, peer machinery pools, and direct government yojana welfare.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35, ease: appleEase }}
              className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2"
            >
              <Link
                to="/marketplace"
                className="px-6 sm:px-8 py-3.5 rounded-full bg-[#8BE3A1] text-[#0A281D] font-bold text-xs uppercase tracking-widest hover:bg-white hover:shadow-[0_0_30px_rgba(139,227,161,0.5)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-xl cursor-pointer text-center"
              >
                Explore Marketplace Lots →
              </Link>

              <Link
                to="/equipment"
                className="px-6 sm:px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-bold uppercase tracking-widest backdrop-blur-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer text-center"
              >
                Machinery Sharing Fleet
              </Link>

              <Link
                to="/farmer/government-schemes"
                className="px-4 sm:px-5 py-3.5 text-xs font-semibold text-[#8BE3A1] hover:text-white transition-colors flex items-center justify-center gap-2 group cursor-pointer"
              >
                <GovernmentSchemeIcon size={16} />
                <span className="group-hover:underline">Government Yojana Portal</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* ================================================================== */}
        {/* PURE LIQUID GLASS ELEMENT (Powered by liquidGL)                    */}
        {/* ================================================================== */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-10">
          <motion.div
            style={{ opacity: heroContentOpacity }}
            className="w-full"
          >
            <div
              className="liquidGL w-full h-16 sm:h-20 rounded-2xl sm:rounded-full bg-white/[0.08] border border-white/30 transition-all duration-300 relative overflow-hidden backdrop-blur-3xl shadow-[0_24px_50px_rgba(0,0,0,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_-1px_2px_rgba(0,0,0,0.15)]"
            />
          </motion.div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* MOVING EARTHRAKSH BLACK STRAP MARQUEE RIBBON                         */}
      {/* ==================================================================== */}
      <div className="relative z-20 bg-[#07130b] border-y border-[#183823] py-3.5 overflow-hidden select-none shadow-md">
        <motion.div
          className="flex items-center gap-12 whitespace-nowrap text-xs font-bold tracking-widest text-[#8BE3A1] uppercase"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="inline-flex items-center gap-8">
              <span className="text-white/95 font-display font-black tracking-[0.2em] text-sm">
                EARTHRAKSH
              </span>
              <span className="text-[#8BE3A1] text-xs">✦</span>
              <span className="text-[#DDEFE0]/80 font-mono text-[11px] tracking-widest">
                AI BASED FARM
              </span>
              <span className="text-[#8BE3A1]/50 text-xs">✦</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ==================================================================== */}
      {/* 2. SPEC MONOLITH MATRIX                                             */}
      {/* ==================================================================== */}
      <section id="spec-architecture" className="py-16 sm:py-24 bg-[#F7FAF6] border-b border-[#DDEFE0]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-16">
          <ScrollFadeItem fadeOffset={35}>
            <div className="max-w-3xl space-y-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#123D2B] block">
                PRECISION SPECIFICATIONS
              </span>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-[#17251D] tracking-[-0.035em] leading-[1.05]">
                Designed to the molecule. <br />
                Measured to the rupee.
              </h2>
              <p className="text-base text-[#66756A] leading-relaxed">
                Every hectare, soil assay, foliar disease, and government benefit is engineered into a unified enterprise database.
              </p>
            </div>
          </ScrollFadeItem>

          {/* Staggered Metric Reveal that Appears and Disappears on Scroll */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pt-4 border-t border-[#DDEFE0]">
            {[
              {
                stat: '0.02',
                unit: 's',
                title: 'Inference Latency',
                desc: 'Computer-vision foliar pathology detection with 98.4% diagnostic accuracy and immediate chemical prescription.'
              },
              {
                stat: '₹3.0',
                unit: 'L',
                title: 'KCC Credit Access',
                desc: 'Institutional short-term crop loans at 4% prompt repayment rate with automated document readiness checks.'
              },
              {
                stat: '100',
                unit: '%',
                title: 'Escrow Guarantee',
                desc: 'Buyer deposits are locked in escrow prior to dispatch and released upon geotagged arrival confirmation.'
              },
              {
                stat: '55',
                unit: '%',
                title: 'Micro-Irrigation Subsidy',
                desc: 'Direct Benefit Transfer under PMKSY Per Drop More Crop verified through government revenue records.'
              }
            ].map((m, idx) => (
              <ScrollFadeItem key={m.title} fadeOffset={35 + idx * 8} className="space-y-2 group cursor-default">
                <span className="text-5xl sm:text-6xl font-display font-black text-[#17251D] group-hover:text-[#123D2B] transition-colors tracking-tight block">
                  {m.stat}<span className="text-[#123D2B] text-3xl font-light">{m.unit}</span>
                </span>
                <h3 className="text-sm font-bold text-[#17251D] uppercase tracking-wider">
                  {m.title}
                </h3>
                <p className="text-xs text-[#66756A] leading-relaxed">
                  {m.desc}
                </p>
              </ScrollFadeItem>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. PREMIUM STICKY SCROLL STORYTELLING: SOIL, CROP & SMART FARMING     */}
      {/* ==================================================================== */}
      <StickyStorytellingSection />

      {/* ==================================================================== */}
      {/* 4. THE PRODUCE CATALOG: WHOLESALE LOTS                              */}
      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* 4. THE PRODUCE CATALOG: WHOLESALE LOTS                              */}
      {/* ==================================================================== */}
      <section id="produce-catalog" className="py-14 sm:py-20 lg:py-24 bg-[#F7FAF6] border-b border-[#DDEFE0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 space-y-10 sm:space-y-12">
          <ScrollFadeItem fadeOffset={35}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-2.5 sm:space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#123D2B] block">
                  WHOLESALE LOT CATALOG
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-[#17251D] tracking-[-0.035em] break-words">
                  Verified harvests. <br className="hidden sm:inline" />
                  Direct from accredited plots.
                </h2>
              </div>

              <Link
                to="/marketplace"
                className="px-6 py-3 rounded-full bg-[#123D2B] text-white hover:bg-[#0A281D] text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shrink-0 self-start md:self-auto cursor-pointer shadow-md"
              >
                Browse Full Catalog →
              </Link>
            </div>
          </ScrollFadeItem>

          {/* Product Lot Cards with Scroll-Triggered Appear & Disappear */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((p: MarketplaceProduct, idx: number) => (
              <ScrollFadeItem key={p.product_id} fadeOffset={30 + idx * 15}>
                <motion.div
                  whileHover={{ y: -10, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
                  onClick={() => navigate(`/marketplace?product=${p.product_id}`)}
                  className="group bg-white rounded-3xl border border-[#DDEFE0] overflow-hidden hover:border-[#123D2B] hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="h-52 sm:h-64 overflow-hidden relative bg-[#DDEFE0]">
                      <img
                        src={
                          p.image_url && !p.image_url.includes('1790771887999')
                            ? p.image_url
                            : getProduceImage(p.product_name || p.category)
                        }
                        alt={p.product_name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#0A281D]/90 text-white backdrop-blur-xl px-3 py-1 sm:px-3.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                        {p.category}
                      </div>
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 text-[#123D2B] backdrop-blur-xl px-3 py-1 sm:px-3.5 rounded-full text-[10px] font-bold border border-white/60">
                        {p.certification}
                      </div>
                    </div>

                    <div className="p-5 sm:p-7 space-y-2.5">
                      <h3 className="text-lg sm:text-xl font-display font-bold text-[#17251D] group-hover:text-[#123D2B] transition-colors leading-snug break-words">
                        {p.product_name}
                      </h3>
                      <p className="text-xs text-[#66756A] truncate">
                        Producer: <strong className="text-[#17251D]">{p.seller_name}</strong> · {p.seller_location}
                      </p>
                      <p className="text-xs text-[#526356] line-clamp-2 leading-relaxed pt-1">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7 pt-4 border-t border-[#DDEFE0] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#66756A] block font-mono uppercase tracking-wider">Price</span>
                      <span className="text-lg sm:text-xl font-display font-black text-[#17251D]">
                        ₹{p.price_per_unit.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#66756A]"> / {p.unit}</span>
                    </div>

                    <span className="text-xs font-bold text-[#123D2B] group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                      <span>Inspect Lot</span>
                      <span>→</span>
                    </span>
                  </div>
                </motion.div>
              </ScrollFadeItem>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. MACHINERY FLEET: EQUIPMENT SHOWCASE                              */}
      {/* ==================================================================== */}
      <section id="machinery-fleet" className="py-14 sm:py-20 lg:py-24 bg-white border-b border-[#DDEFE0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 space-y-10 sm:space-y-12">
          <ScrollFadeItem fadeOffset={35}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl space-y-2.5 sm:space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#123D2B] block">
                  PEER-TO-PEER INDUSTRIAL FLEET
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-[#17251D] tracking-[-0.035em] break-words">
                  Utility tractors. <br className="hidden sm:inline" />
                  Autonomous sprayers.
                </h2>
              </div>

              <Link
                to="/equipment"
                className="px-6 py-3 rounded-full bg-[#123D2B] text-white hover:bg-[#0A281D] text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shrink-0 self-start md:self-auto cursor-pointer shadow-md"
              >
                Browse Equipment Pool →
              </Link>
            </div>
          </ScrollFadeItem>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {equipment.map((e: Equipment, idx: number) => (
              <ScrollFadeItem key={e.equipment_id} fadeOffset={30 + idx * 15}>
                <motion.div
                  whileHover={{ y: -10, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
                  onClick={() => navigate(`/equipment?machine=${e.equipment_id}`)}
                  className="group bg-[#F7FAF6] rounded-3xl border border-[#DDEFE0] overflow-hidden hover:border-[#123D2B] hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="h-52 sm:h-64 overflow-hidden relative bg-[#DDEFE0]">
                      <img
                        src={getEquipmentImage(e.equipment_name || e.model)}
                        alt={e.equipment_name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#0A281D]/90 text-white backdrop-blur-xl px-3 py-1 sm:px-3.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                        {e.equipment_name.includes('Tractor')
                          ? 'TRACTOR'
                          : e.equipment_name.includes('Drone')
                          ? 'DRONE'
                          : 'IMPLEMENT'}
                      </div>
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 text-[#123D2B] backdrop-blur-xl px-3 py-1 sm:px-3.5 rounded-full text-[10px] font-bold border border-white/60">
                        {e.availability_status}
                      </div>
                    </div>

                    <div className="p-5 sm:p-7 space-y-2.5">
                      <h3 className="text-lg sm:text-xl font-display font-bold text-[#17251D] group-hover:text-[#123D2B] transition-colors leading-snug break-words">
                        {e.equipment_name}
                      </h3>
                      <p className="text-xs text-[#66756A] truncate">
                        Model: <strong className="text-[#17251D]">{e.model}</strong>
                      </p>
                      <p className="text-xs text-[#66756A] truncate">
                        Owner: {e.owner_name}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7 pt-4 border-t border-[#DDEFE0] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#66756A] block font-mono uppercase tracking-wider">Daily Tariff</span>
                      <span className="text-lg sm:text-xl font-display font-black text-[#17251D]">
                        ₹{e.rental_rate_per_day.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#66756A]"> / day</span>
                    </div>

                    <span className="text-xs font-bold text-[#123D2B] group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                      <span>Reserve Implement</span>
                      <span>→</span>
                    </span>
                  </div>
                </motion.div>
              </ScrollFadeItem>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. CLOSING STATEMENT: ENTERPRISE CHAPTER                            */}
      {/* ==================================================================== */}
      <section className="py-16 sm:py-24 lg:py-28 bg-[#0A281D] text-white border-t border-[#123D2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 space-y-12 sm:space-y-16">
          <ScrollFadeItem fadeOffset={35}>
            <div className="max-w-4xl space-y-4 sm:space-y-6">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-[#8BE3A1] block">
                THE COMPLETE PLATFORM
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-display font-black text-white tracking-[-0.04em] leading-[0.98] break-words">
                Built for farmers. <br />
                Trusted by commercial buyers.
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-[#DDEFE0]/80 max-w-2xl leading-relaxed">
                Experience the EarthRakshak Enterprise Resource Platform today. Log in to your specialized workspace or register a new verified account.
              </p>
            </div>
          </ScrollFadeItem>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-2">
            {/* Farmer Journey */}
            <ScrollFadeItem fadeOffset={35}>
              <motion.div
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 350, damping: 20 } }}
                className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-[#123D2B]/75 border border-[#8BE3A1]/20 space-y-4 sm:space-y-6 hover:border-[#8BE3A1]/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3 sm:space-y-4">
                  <span className="text-xs font-mono font-bold text-[#8BE3A1] uppercase tracking-widest block">
                    FARMER PORTAL
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white break-words">
                    Manage Land, Telemetry &amp; Welfare
                  </h3>
                  <p className="text-xs sm:text-sm text-[#DDEFE0]/75 leading-relaxed">
                    Plot boundaries, crop life cycles, soil assays, foliar AI diagnostics, machinery rentals, and verified government yojana checklists.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="px-6 sm:px-8 py-3.5 rounded-full bg-[#8BE3A1] text-[#0A281D] font-bold text-xs uppercase tracking-widest hover:bg-white hover:scale-105 active:scale-95 transition-all inline-block cursor-pointer shadow-md text-center"
                  >
                    Enter Farmer Portal →
                  </Link>
                </div>
              </motion.div>
            </ScrollFadeItem>

            {/* Buyer Journey */}
            <ScrollFadeItem fadeOffset={45}>
              <motion.div
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 350, damping: 20 } }}
                className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-[#123D2B]/75 border border-[#8BE3A1]/20 space-y-4 sm:space-y-6 hover:border-[#8BE3A1]/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3 sm:space-y-4">
                  <span className="text-xs font-mono font-bold text-[#8BE3A1] uppercase tracking-widest block">
                    COMMERCIAL BUYER PORTAL
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-white break-words">
                    Source Accredited Wholesale Lots
                  </h3>
                  <p className="text-xs sm:text-sm text-[#DDEFE0]/75 leading-relaxed">
                    Wholesale catalog search, verified farm lots, secure escrow commitments, and live 24-hour consignment transit tracking.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to="/login"
                    className="px-6 sm:px-8 py-3.5 rounded-full bg-white text-[#0A281D] font-bold text-xs uppercase tracking-widest hover:bg-[#8BE3A1] hover:scale-105 active:scale-95 transition-all inline-block cursor-pointer shadow-md text-center"
                  >
                    Enter Buyer Portal →
                  </Link>
                </div>
              </motion.div>
            </ScrollFadeItem>
          </div>
        </div>
      </section>

      {/* Existing Footer Preserved */}
      <PublicFooter />
    </div>
  );
};

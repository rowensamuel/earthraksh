import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  soilHealthImg,
  soilAnalysisImg,
  cropDiagnosisImg,
  smartFarmingImg
} from '../../assets/assetRegistry';

interface StoryStep {
  id: string;
  number: string;
  category: string;
  headline: string;
  description: string;
  image: string;
  details: {
    label: string;
    value: string;
  }[];
}

const STORY_STEPS: StoryStep[] = [
  {
    id: 'soil-health',
    number: '01 / 04',
    category: 'Foundational Agronomy',
    headline: 'Soil Health & In-Field Moisture Dynamics',
    description:
      'Living soil condition determines root architecture, organic carbon assimilation, and natural drought resilience. Continuous monitoring tracks volumetric moisture levels and soil structure across active crop root zones, preventing both moisture stress and waterlogging.',
    image: soilHealthImg,
    details: [
      { label: 'Volumetric Moisture', value: '28% – 34% optimal zone' },
      { label: 'Organic Carbon', value: '0.82% active humus layer' },
      { label: 'Root Aeration', value: 'Balanced porosity profile' }
    ]
  },
  {
    id: 'soil-analysis',
    number: '02 / 04',
    category: 'Chemistry & Nutrition',
    headline: 'Calibrated pH & Cadastral NPK Assays',
    description:
      'Balanced crop nutrition depends on accurate soil chemical assays. Cadastral mapping measures active soil pH alongside primary macronutrients—Nitrogen (N), Phosphorus (P), and Potassium (K)—ensuring soil nutrient availability adheres to accredited agricultural baselines.',
    image: soilAnalysisImg,
    details: [
      { label: 'Soil Reaction', value: 'pH 6.8 neutral optimum' },
      { label: 'Available Nitrogen (N)', value: '284 kg/ha baseline' },
      { label: 'Phosphorus (P) & Potassium (K)', value: 'Optimal mineral balance' }
    ]
  },
  {
    id: 'crop-diagnosis',
    number: '03 / 04',
    category: 'Computer Vision Pathology',
    headline: 'AI Crop Diagnosis & Foliar Triage',
    description:
      'Computer-vision diagnostic models trained on verified agricultural field specimens identify foliar blights, fungal lesions, and nutrient stress directly from leaf imagery. Immediate diagnostic feedback allows timely containment before pathogen vectors spread across the plot.',
    image: cropDiagnosisImg,
    details: [
      { label: 'Diagnostic Speed', value: 'Sub-second neural inference' },
      { label: 'Pathogen Recognition', value: 'Fungal, bacterial & viral triage' },
      { label: 'Action Window', value: 'Immediate stage-1 containment' }
    ]
  },
  {
    id: 'smart-farming',
    number: '04 / 04',
    category: 'Advisory & Action',
    headline: 'Targeted Crop Care & Scientific Fertigation',
    description:
      'Actionable recommendations synthesize cadastral soil assays, real-time crop life cycles, and diagnostic results into clear management plans. Producers receive specific dosage guidance for organic inputs, verified chemical treatments, and precision micro-irrigation schedules.',
    image: smartFarmingImg,
    details: [
      { label: 'Input Efficiency', value: 'Eliminates excess chemical application' },
      { label: 'Irrigation Timing', value: 'Synchronized micro-sprinkler cycles' },
      { label: 'Plot Verification', value: 'Audited digital agronomy ledger' }
    ]
  }
];

interface StoryStepRowProps {
  step: StoryStep;
  idx: number;
}

const StoryStepRow: React.FC<StoryStepRowProps> = ({ step, idx }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [deviceTier, setDeviceTier] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const checkViewport = () => {
      const w = window.innerWidth;
      if (w < 768) setDeviceTier('mobile');
      else if (w < 1024) setDeviceTier('tablet');
      else setDeviceTier('desktop');

      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setPrefersReducedMotion(true);
      }
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ['start 85%', 'end 15%']
  });

  const isImageLeft = idx % 2 === 0;
  const imgDir = isImageLeft ? -1 : 1;
  const textDir = isImageLeft ? 1 : -1;

  // Responsive translation distance:
  // Desktop: full lateral motion (±70px / ±60px)
  // Tablet: adapted lateral motion (±32px / ±26px)
  // Mobile: subtle, safe motion (±14px / ±12px) to guarantee zero clipping on 320px-430px screens
  // Reduced motion: 0px
  const lateralScale = prefersReducedMotion ? 0 : deviceTier === 'mobile' ? 0.2 : deviceTier === 'tablet' ? 0.5 : 1;

  const visualShift = imgDir * 70 * lateralScale;
  const textShift = textDir * 60 * lateralScale;
  const detailShift = textDir * 40 * lateralScale;

  // Visual column transforms: enters smoothly from side with subtle scale
  const visualX = useTransform(scrollYProgress, [0, 0.05, 0.28, 0.74, 0.98], [visualShift, visualShift, 0, 0, visualShift]);
  const visualOpacity = useTransform(scrollYProgress, [0, 0.05, 0.28, 0.74, 0.98], [0, 0, 1, 1, 0]);
  const visualScale = useTransform(scrollYProgress, [0, 0.05, 0.28, 0.74, 0.98], [0.94, 0.94, 1, 1, 0.94]);

  // STAGGERED NARRATIVE SCROLL ENTRANCES (ONE BY ONE):
  // 1. FIRST: Category pill (normal) & Bold headline
  const headlineX = useTransform(scrollYProgress, [0, 0.06, 0.22, 0.80, 0.98], [textShift, textShift, 0, 0, textShift]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.06, 0.22, 0.80, 0.98], [0, 0, 1, 1, 0]);

  // 2. SECOND: Narrative body paragraph
  const paragraphX = useTransform(scrollYProgress, [0, 0.18, 0.34, 0.76, 0.94], [textShift, textShift, 0, 0, textShift]);
  const paragraphOpacity = useTransform(scrollYProgress, [0, 0.18, 0.34, 0.76, 0.94], [0, 0, 1, 1, 0]);

  // 3. THIRD: Example & agronomic metrics header
  const detailsHeaderX = useTransform(scrollYProgress, [0, 0.26, 0.40, 0.72, 0.90], [detailShift, detailShift, 0, 0, detailShift]);
  const detailsHeaderOpacity = useTransform(scrollYProgress, [0, 0.26, 0.40, 0.72, 0.90], [0, 0, 1, 1, 0]);

  // 4. FOURTH: Example items ONE BY ONE
  const detail0X = useTransform(scrollYProgress, [0, 0.30, 0.44, 0.70, 0.88], [detailShift, detailShift, 0, 0, detailShift]);
  const detail0Opacity = useTransform(scrollYProgress, [0, 0.30, 0.44, 0.70, 0.88], [0, 0, 1, 1, 0]);

  const detail1X = useTransform(scrollYProgress, [0, 0.36, 0.50, 0.68, 0.86], [detailShift, detailShift, 0, 0, detailShift]);
  const detail1Opacity = useTransform(scrollYProgress, [0, 0.36, 0.50, 0.68, 0.86], [0, 0, 1, 1, 0]);

  const detail2X = useTransform(scrollYProgress, [0, 0.42, 0.56, 0.66, 0.84], [detailShift, detailShift, 0, 0, detailShift]);
  const detail2Opacity = useTransform(scrollYProgress, [0, 0.42, 0.56, 0.66, 0.84], [0, 0, 1, 1, 0]);

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center will-change-transform min-h-[420px] sm:min-h-[480px] lg:min-h-[560px]"
    >
      {/* Visual Column */}
      <motion.div
        style={{ x: visualX, opacity: visualOpacity, scale: visualScale }}
        className={`w-full ${
          isImageLeft
            ? 'lg:col-span-6 lg:order-1'
            : 'lg:col-span-6 lg:order-2'
        }`}
      >
        <div className="w-full h-[250px] sm:h-[360px] md:h-[420px] lg:h-[500px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#E7EFE8] border border-[#DDEFE0] shadow-xl relative group">
          <img
            src={step.image}
            alt={step.headline}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A281D]/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase bg-[#0A281D]/80 text-white backdrop-blur-md px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/15">
              {step.number} · {step.category}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Narrative Text Column - Elements Staggered Sequentially One by One */}
      <div
        className={`space-y-5 sm:space-y-6 ${
          isImageLeft
            ? 'lg:col-span-6 lg:order-2'
            : 'lg:col-span-6 lg:order-1'
        }`}
      >
        {/* 1. Sequence, Category (Normal) & Headline (Bold) - Arrives First */}
        <motion.div
          style={{ x: headlineX, opacity: headlineOpacity }}
          className="space-y-2.5 sm:space-y-3 will-change-transform"
        >
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#EAF3EC] border border-[#CFE4D3]">
            <span className="text-[11px] sm:text-xs font-mono font-bold text-[#123D2B] tracking-wider uppercase">
              {step.number}
            </span>
            <span className="text-[#A2C7AA] font-light">|</span>
            <span className="text-[11px] sm:text-xs font-mono font-medium text-[#466650] uppercase tracking-wider">
              {step.category}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-black text-[#17251D] tracking-[-0.025em] leading-snug break-words">
            {step.headline}
          </h3>
        </motion.div>

        {/* 2. Narrative Body Paragraph - Arrives Second */}
        <motion.div
          style={{ x: paragraphX, opacity: paragraphOpacity }}
          className="will-change-transform"
        >
          <p className="text-sm sm:text-base lg:text-lg text-[#55695D] leading-relaxed">
            {step.description}
          </p>
        </motion.div>

        {/* 3. Supported Agronomic Examples - Arrives One by One */}
        <div className="pt-3 sm:pt-4 border-t border-[#DDEFE0] space-y-2 sm:space-y-2.5">
          <motion.div
            style={{ x: detailsHeaderX, opacity: detailsHeaderOpacity }}
            className="will-change-transform"
          >
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66756A] block pb-1">
              Verified In-Field Metrics & Examples
            </span>
          </motion.div>

          {step.details[0] && (
            <motion.div
              style={{ x: detail0X, opacity: detail0Opacity }}
              className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2 px-3 sm:px-3.5 rounded-xl bg-white border border-[#E2EBE3] shadow-xs gap-1 sm:gap-0 will-change-transform"
            >
              <span className="font-semibold text-[#17251D] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F6E43] shrink-0" />
                {step.details[0].label}
              </span>
              <span className="text-[#123D2B] font-mono sm:text-right font-medium text-[11px] sm:text-xs">
                {step.details[0].value}
              </span>
            </motion.div>
          )}

          {step.details[1] && (
            <motion.div
              style={{ x: detail1X, opacity: detail1Opacity }}
              className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2 px-3 sm:px-3.5 rounded-xl bg-white border border-[#E2EBE3] shadow-xs gap-1 sm:gap-0 will-change-transform"
            >
              <span className="font-semibold text-[#17251D] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F6E43] shrink-0" />
                {step.details[1].label}
              </span>
              <span className="text-[#123D2B] font-mono sm:text-right font-medium text-[11px] sm:text-xs">
                {step.details[1].value}
              </span>
            </motion.div>
          )}

          {step.details[2] && (
            <motion.div
              style={{ x: detail2X, opacity: detail2Opacity }}
              className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2 px-3 sm:px-3.5 rounded-xl bg-white border border-[#E2EBE3] shadow-xs gap-1 sm:gap-0 will-change-transform"
            >
              <span className="font-semibold text-[#17251D] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1F6E43] shrink-0" />
                {step.details[2].label}
              </span>
              <span className="text-[#123D2B] font-mono sm:text-right font-medium text-[11px] sm:text-xs">
                {step.details[2].value}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export const StickyStorytellingSection: React.FC = () => {
  useEffect(() => {
    // Preload all 4 storytelling images into browser cache
    STORY_STEPS.forEach((step) => {
      const img = new Image();
      img.src = step.image;
    });
  }, []);

  return (
    <section className="py-14 sm:py-20 lg:py-32 bg-[#F7FAF6] border-b border-[#DDEFE0] text-[#17251D] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12 sm:mb-20 lg:mb-32">
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#123D2B] block">
            AGRONOMIC OPERATING CORE
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-[#17251D] tracking-[-0.035em] leading-[1.08] break-words">
            Precision agronomy. <br className="hidden sm:inline" />
            From soil assay to healthy yield.
          </h2>
          <p className="text-sm sm:text-base text-[#66756A] leading-relaxed pt-1">
            Explore how continuous soil telemetry, cadastral chemistry, and neural foliar diagnostics unify into actionable on-farm guidance.
          </p>
        </div>

        {/* Alternating Right / Left Story Steps with Continuous Scroll Appear & Disappear */}
        <div className="space-y-20 sm:space-y-32 lg:space-y-48">
          {STORY_STEPS.map((step, idx) => (
            <StoryStepRow key={step.id} step={step} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

"use client";

import { motion, type Variants } from "framer-motion";
import * as React from "react";
import { PageHeaderERP } from "./page-header";

export const fadeElegant: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
  },
};

const fadePure: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

const professionalBlur: Variants = {
  initial: { opacity: 0, y: 6, filter: "blur(2px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    filter: "blur(1px)",
    transition: { duration: 0.2, ease: [0.4, 0, 0.6, 1] },
  },
};

type AnimationVariant = "fade-elegant" | "fade-pure" | "professional-blur";

type PageTransitionProps = {
  titleHeader: string;
  subtitle?: string;
  fallbackBackTo?: string;
  actions?: React.ReactNode;
  stickyHeader?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: AnimationVariant;
};

const variantMap: Record<AnimationVariant, Variants> = {
  "fade-elegant": fadeElegant,
  "fade-pure": fadePure,
  "professional-blur": professionalBlur,
};

export function PageTransition({
  children,
  className,
  titleHeader,
  subtitle,
  fallbackBackTo = "/crm",
  actions,
  stickyHeader = false,
  variant = "fade-elegant",
}: PageTransitionProps) {
  const selectedVariants = variantMap[variant];

  return (
    <>
      {/* Header fuera del motion: no “rebota” si haces scroll y sticky funciona mejor */}
      <PageHeaderERP
        title={titleHeader}
        subtitle={subtitle}
        fallbackBackTo={fallbackBackTo}
        actions={actions}
        sticky={stickyHeader}
      />

      {/* Contenido animado */}
      <motion.div
        className={`container mx-auto px-2 py-1 ${className ?? ""}`}
        variants={selectedVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </>
  );
}
